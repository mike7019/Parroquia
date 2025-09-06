const { Client } = require('pg');

// Configuración de la base de datos
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025'
};

// Función principal para crear veredas desde la API
async function crearVeredaAPI(datosVereda) {
  const client = new Client(config);
  
  try {
    await client.connect();

    // Validar datos requeridos
    if (!datosVereda.nombre || datosVereda.nombre.trim() === '') {
      throw new Error('El nombre de la vereda es requerido');
    }

    // El campo puede venir como id_municipio_municipios o municipioId
    const municipioId = datosVereda.id_municipio_municipios || 
                       datosVereda.municipioId || 
                       datosVereda.id_municipio ||
                       datosVereda.municipio_id;

    if (!municipioId) {
      throw new Error('El ID del municipio es requerido (id_municipio_municipios, municipioId, id_municipio o municipio_id)');
    }

    // Verificar que el municipio existe
    const municipio = await client.query(
      'SELECT * FROM municipios WHERE id_municipio = $1',
      [municipioId]
    );

    if (municipio.rows.length === 0) {
      throw new Error(`No existe un municipio con ID: ${municipioId}`);
    }

    // Verificar si ya existe una vereda con el mismo nombre en el municipio
    const veredaExistente = await client.query(`
      SELECT * FROM veredas 
      WHERE UPPER(TRIM(nombre)) = UPPER(TRIM($1)) AND id_municipio_municipios = $2
    `, [datosVereda.nombre, municipioId]);

    if (veredaExistente.rows.length > 0) {
      throw new Error(`Ya existe una vereda con el nombre "${datosVereda.nombre}" en este municipio`);
    }

    // Corregir la secuencia si es necesario
    await client.query(`
      SELECT setval('veredas_id_vereda_seq', 
        COALESCE((SELECT MAX(id_vereda) FROM veredas), 0) + 1, false)
    `);

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
      datosVereda.nombre.trim(),
      datosVereda.codigo_vereda || datosVereda.codigo || null,
      municipioId
    ]);

    // Obtener información completa de la vereda creada
    const veredaCompleta = await client.query(`
      SELECT 
        v.id_vereda,
        v.nombre,
        v.codigo_vereda,
        v.id_municipio_municipios,
        m.nombre_municipio,
        d.nombre as departamento,
        v.created_at,
        v.updated_at
      FROM veredas v
      JOIN municipios m ON v.id_municipio_municipios = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      WHERE v.id_vereda = $1
    `, [result.rows[0].id_vereda]);

    return {
      success: true,
      data: veredaCompleta.rows[0],
      message: 'Vereda creada exitosamente'
    };

  } catch (error) {
    console.error('Error detallado:', error);
    
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

// Función para listar municipios
async function listarMunicipiosAPI() {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        m.id_municipio,
        m.nombre_municipio,
        m.codigo_dane,
        d.nombre as departamento,
        COUNT(v.id_vereda) as total_veredas
      FROM municipios m
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      LEFT JOIN veredas v ON v.id_municipio_municipios = m.id_municipio
      GROUP BY m.id_municipio, m.nombre_municipio, m.codigo_dane, d.nombre
      ORDER BY d.nombre, m.nombre_municipio
    `);

    return {
      success: true,
      data: result.rows,
      total: result.rows.length,
      message: 'Municipios obtenidos exitosamente'
    };

  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Error listing municipios',
        code: 'LIST_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message
      }
    };
  } finally {
    await client.end();
  }
}

// Función para listar veredas de un municipio
async function listarVeredasPorMunicipioAPI(municipioId) {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        v.id_vereda,
        v.nombre,
        v.codigo_vereda,
        m.nombre_municipio,
        d.nombre as departamento,
        v.created_at,
        v.updated_at
      FROM veredas v
      JOIN municipios m ON v.id_municipio_municipios = m.id_municipio
      JOIN departamentos d ON m.id_departamento = d.id_departamento
      WHERE v.id_municipio_municipios = $1
      ORDER BY v.nombre
    `, [municipioId]);

    return {
      success: true,
      data: result.rows,
      total: result.rows.length,
      message: `Veredas del municipio obtenidas exitosamente`
    };

  } catch (error) {
    return {
      success: false,
      error: {
        message: 'Error listing veredas',
        code: 'LIST_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message
      }
    };
  } finally {
    await client.end();
  }
}

// Función de prueba
async function probarAPI() {
  console.log('🧪 Probando API de Veredas...\n');

  // Probar listar municipios
  console.log('1. Listando municipios...');
  const municipios = await listarMunicipiosAPI();
  if (municipios.success) {
    console.log(`✅ Se encontraron ${municipios.total} municipios`);
    console.table(municipios.data.slice(0, 5)); // Mostrar solo los primeros 5
  } else {
    console.log('❌ Error al listar municipios:', municipios.error);
    return;
  }

  // Probar crear vereda
  console.log('\n2. Creando vereda de prueba...');
  const datosVereda = {
    nombre: 'Vereda API Test',
    codigo_vereda: 'VAT001',
    id_municipio_municipios: municipios.data[0].id_municipio // Usar el primer municipio
  };

  const resultadoCreacion = await crearVeredaAPI(datosVereda);
  if (resultadoCreacion.success) {
    console.log('✅ Vereda creada exitosamente:');
    console.table([resultadoCreacion.data]);

    // Probar listar veredas del municipio
    console.log('\n3. Listando veredas del municipio...');
    const veredas = await listarVeredasPorMunicipioAPI(datosVereda.id_municipio_municipios);
    if (veredas.success) {
      console.log(`✅ Se encontraron ${veredas.total} veredas`);
      console.table(veredas.data);
    }

    // Limpiar: eliminar la vereda de prueba
    console.log('\n4. Eliminando vereda de prueba...');
    const client = new Client(config);
    await client.connect();
    await client.query('DELETE FROM veredas WHERE id_vereda = $1', [resultadoCreacion.data.id_vereda]);
    await client.end();
    console.log('✅ Vereda de prueba eliminada');

  } else {
    console.log('❌ Error al crear vereda:', resultadoCreacion.error);
  }
}

async function main() {
  await probarAPI();
  
  console.log('\n📋 Resumen de la API:');
  console.log('✅ crearVeredaAPI(datosVereda) - Crear nueva vereda');
  console.log('✅ listarMunicipiosAPI() - Listar municipios disponibles');
  console.log('✅ listarVeredasPorMunicipioAPI(municipioId) - Listar veredas de un municipio');
  
  console.log('\n📝 Estructura de datos para crear vereda:');
  console.log({
    nombre: 'string (requerido)',
    codigo_vereda: 'string (opcional)', // o 'codigo'
    id_municipio_municipios: 'integer (requerido)' // o 'municipioId' o 'id_municipio'
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  crearVeredaAPI,
  listarMunicipiosAPI,
  listarVeredasPorMunicipioAPI
};
