const { Client } = require('pg');

// Configuración de la base de datos
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025'
};

async function crearVeredaCorrecta(nombre, codigoVereda, idMunicipio) {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar que el municipio existe
    const municipio = await client.query(
      'SELECT * FROM municipios WHERE id_municipio = $1',
      [idMunicipio]
    );

    if (municipio.rows.length === 0) {
      throw new Error(`No existe un municipio con ID: ${idMunicipio}`);
    }

    console.log(`📍 Municipio encontrado: ${municipio.rows[0].nombre_municipio}`);

    // Crear la vereda con la estructura correcta
    const result = await client.query(`
      INSERT INTO veredas (nombre, codigo_vereda, id_municipio_municipios, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      RETURNING *
    `, [nombre, codigoVereda, idMunicipio]);

    console.log('✅ Vereda creada exitosamente:');
    console.table(result.rows);

    return result.rows[0];

  } catch (error) {
    console.error('❌ Error al crear vereda:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function listarMunicipios() {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        m.id_municipio,
        m.nombre_municipio,
        m.codigo_dane,
        d.nombre as departamento
      FROM municipios m
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      ORDER BY d.nombre, m.nombre_municipio
      LIMIT 10
    `);

    console.log('\n📋 Municipios disponibles (primeros 10):');
    console.table(result.rows);

    return result.rows;

  } catch (error) {
    console.error('❌ Error al listar municipios:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function listarVeredasPorMunicipio(idMunicipio) {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        v.id_vereda,
        v.nombre,
        v.codigo_vereda,
        m.nombre_municipio,
        d.nombre as departamento
      FROM veredas v
      JOIN municipios m ON v.id_municipio_municipios = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      WHERE v.id_municipio_municipios = $1
      ORDER BY v.nombre
    `, [idMunicipio]);

    console.log(`\n📋 Veredas del municipio (ID: ${idMunicipio}):`);
    if (result.rows.length > 0) {
      console.table(result.rows);
    } else {
      console.log('⚠️ No hay veredas en este municipio');
    }

    return result.rows;

  } catch (error) {
    console.error('❌ Error al listar veredas:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function crearVeredaInteractiva() {
  try {
    console.log('🏗️ Creador de Veredas - Estructura Correcta\n');
    
    // Listar municipios disponibles
    await listarMunicipios();
    
    // Crear una vereda de ejemplo
    console.log('\n🧪 Creando vereda de ejemplo...');
    
    const veredaEjemplo = await crearVeredaCorrecta(
      'Vereda Ejemplo Funcional',
      'VEF001',
      1 // Primer municipio
    );

    // Listar veredas del municipio
    await listarVeredasPorMunicipio(1);

    // Eliminar la vereda de ejemplo
    console.log('\n🗑️ Eliminando vereda de ejemplo...');
    const client = new Client(config);
    await client.connect();
    await client.query('DELETE FROM veredas WHERE id_vereda = $1', [veredaEjemplo.id_vereda]);
    await client.end();
    console.log('✅ Vereda de ejemplo eliminada');

    return true;

  } catch (error) {
    console.error('❌ Error en el proceso:', error.message);
    return false;
  }
}

// Función para crear veredas desde la API con la estructura correcta
async function crearVeredaAPI(datosVereda) {
  const client = new Client(config);
  
  try {
    await client.connect();

    // Validar datos requeridos
    if (!datosVereda.nombre) {
      throw new Error('El nombre de la vereda es requerido');
    }

    if (!datosVereda.id_municipio_municipios) {
      throw new Error('El ID del municipio es requerido');
    }

    // Verificar que el municipio existe
    const municipio = await client.query(
      'SELECT * FROM municipios WHERE id_municipio = $1',
      [datosVereda.id_municipio_municipios]
    );

    if (municipio.rows.length === 0) {
      throw new Error(`No existe un municipio con ID: ${datosVereda.id_municipio_municipios}`);
    }

    // Verificar si ya existe una vereda con el mismo nombre en el municipio
    const veredaExistente = await client.query(`
      SELECT * FROM veredas 
      WHERE nombre = $1 AND id_municipio_municipios = $2
    `, [datosVereda.nombre, datosVereda.id_municipio_municipios]);

    if (veredaExistente.rows.length > 0) {
      throw new Error(`Ya existe una vereda con el nombre "${datosVereda.nombre}" en este municipio`);
    }

    // Crear la vereda
    const result = await client.query(`
      INSERT INTO veredas (
        nombre, 
        codigo_vereda, 
        id_municipio_municipios, 
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      RETURNING *
    `, [
      datosVereda.nombre,
      datosVereda.codigo_vereda || null,
      datosVereda.id_municipio_municipios
    ]);

    return {
      success: true,
      data: result.rows[0],
      message: 'Vereda creada exitosamente'
    };

  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Error creating vereda',
        code: 'CREATE_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message
      }
    };
  } finally {
    await client.end();
  }
}

async function main() {
  const exito = await crearVeredaInteractiva();
  
  if (exito) {
    console.log('\n✅ El sistema está funcionando correctamente para crear veredas');
    console.log('📝 Usa la función crearVeredaAPI() para crear veredas desde tu aplicación');
    console.log('\n📋 Estructura correcta para crear veredas:');
    console.log({
      nombre: 'string (requerido)',
      codigo_vereda: 'string (opcional)',
      id_municipio_municipios: 'integer (requerido)'
    });
  } else {
    console.log('\n❌ Hay problemas que necesitan ser resueltos');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  crearVeredaAPI,
  crearVeredaCorrecta,
  listarMunicipios,
  listarVeredasPorMunicipio
};
