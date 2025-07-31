import sequelize from './config/sequelize.js';

async function findTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Buscar la tabla en todos los esquemas
    console.log('\n🔍 Buscando tabla tipo_identificacion en todos los esquemas:');
    const [results] = await sequelize.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name = 'tipo_identificacion';
    `);
    
    console.table(results);

    // Verificar esquemas disponibles
    console.log('\n📋 Esquemas disponibles:');
    const [schemas] = await sequelize.query(`
      SELECT schema_name 
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1');
    `);
    
    console.table(schemas);

    // Si encontramos la tabla, verificar su estructura
    if (results.length > 0) {
      const schema = results[0].table_schema;
      console.log(`\n📋 Estructura de ${schema}.tipo_identificacion:`);
      const [structure] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tipo_identificacion' 
        AND table_schema = '${schema}'
        ORDER BY ordinal_position;
      `);
      
      console.table(structure);

      console.log(`\n📊 Datos en ${schema}.tipo_identificacion:`);
      const [data] = await sequelize.query(`
        SELECT * FROM "${schema}".tipo_identificacion ORDER BY id_tipo_identificacion;
      `);
      
      console.table(data);
    }

    // Verificar estado de migraciones
    console.log('\n🔄 Estado de migraciones:');
    try {
      const [migrations] = await sequelize.query(`
        SELECT * FROM "SequelizeMeta" ORDER BY name;
      `);
      console.table(migrations);
    } catch (err) {
      console.log('❌ No se encontró tabla SequelizeMeta:', err.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

findTable();
