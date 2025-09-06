const { Client } = require('pg');

// Configuración de la base de datos
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025'
};

async function inspeccionarEstructura() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar estructura de tablas geográficas
    const tablasGeograficas = ['departamentos', 'municipios', 'parroquias', 'sectores', 'veredas'];
    
    for (const tabla of tablasGeograficas) {
      console.log(`\n🔍 Estructura de la tabla: ${tabla}`);
      console.log('='.repeat(50));
      
      try {
        // Obtener estructura de la tabla
        const estructura = await client.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [tabla]);

        if (estructura.rows.length > 0) {
          console.table(estructura.rows);
          
          // Obtener datos de muestra
          const muestra = await client.query(`SELECT * FROM ${tabla} LIMIT 3`);
          console.log(`\n📊 Datos de muestra (${muestra.rows.length} registros):`);
          if (muestra.rows.length > 0) {
            console.table(muestra.rows);
          } else {
            console.log('⚠️ No hay datos en esta tabla');
          }
          
        } else {
          console.log(`❌ La tabla ${tabla} no existe o no tiene columnas`);
        }
      } catch (error) {
        console.log(`❌ Error al consultar la tabla ${tabla}:`, error.message);
      }
    }

    // Verificar relaciones de claves foráneas
    console.log('\n🔗 Verificando relaciones de claves foráneas...');
    console.log('='.repeat(50));
    
    const relaciones = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('departamentos', 'municipios', 'parroquias', 'sectores', 'veredas')
      ORDER BY tc.table_name, tc.constraint_name
    `);

    if (relaciones.rows.length > 0) {
      console.table(relaciones.rows);
    } else {
      console.log('⚠️ No se encontraron relaciones de claves foráneas');
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await client.end();
  }
}

async function testCrearVereda() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('\n🧪 Probando crear una vereda directamente...');
    
    // Intentar obtener un sector existente
    const sectores = await client.query('SELECT * FROM sectores LIMIT 1');
    
    if (sectores.rows.length === 0) {
      console.log('❌ No hay sectores disponibles. Creando uno primero...');
      
      // Verificar si hay parroquias
      const parroquias = await client.query('SELECT * FROM parroquias LIMIT 1');
      if (parroquias.rows.length === 0) {
        console.log('❌ No hay parroquias disponibles. Necesitas crear la jerarquía completa.');
        return;
      }
      
      const parroquia = parroquias.rows[0];
      console.log(`📍 Usando parroquia: ${JSON.stringify(parroquia)}`);
      
      // Crear un sector
      const nuevoSector = await client.query(`
        INSERT INTO sectores (nombre, codigo, ${parroquia.hasOwnProperty('id') ? 'parroquia_id' : 'parroquiaId'}) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `, ['Sector Prueba', 'SPR001', parroquia.id || parroquia.parroquia_id]);
      
      console.log('✅ Sector creado:', nuevoSector.rows[0]);
    }
    
    // Obtener sector para crear vereda
    const sectoresActuales = await client.query('SELECT * FROM sectores LIMIT 1');
    const sector = sectoresActuales.rows[0];
    
    console.log(`📍 Usando sector: ${JSON.stringify(sector)}`);
    
    // Intentar crear vereda
    const columnaSectorId = sector.hasOwnProperty('id') ? 'sector_id' : 'sectorId';
    
    const nuevaVereda = await client.query(`
      INSERT INTO veredas (nombre, codigo, ${columnaSectorId}) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, ['Vereda Prueba Test', 'VPT001', sector.id || sector.sector_id]);
    
    console.log('✅ Vereda creada exitosamente:', nuevaVereda.rows[0]);
    
    // Eliminar la vereda de prueba
    await client.query('DELETE FROM veredas WHERE nombre = $1', ['Vereda Prueba Test']);
    console.log('🗑️ Vereda de prueba eliminada');
    
  } catch (error) {
    console.error('❌ Error al probar crear vereda:', error.message);
    console.error('Detalles:', error);
  } finally {
    await client.end();
  }
}

async function main() {
  await inspeccionarEstructura();
  await testCrearVereda();
}

if (require.main === module) {
  main();
}
