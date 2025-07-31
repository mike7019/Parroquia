import sequelize from './config/sequelize.js';

async function checkTableStructure() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Verificar estructura de tipo_identificacion
    console.log('\n📋 Estructura de la tabla tipo_identificacion:');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tipo_identificacion' 
      AND table_schema = 'caracterizacion'
      ORDER BY ordinal_position;
    `);
    
    console.table(results);

    // Verificar datos existentes
    console.log('\n📊 Datos existentes en tipo_identificacion:');
    const [data] = await sequelize.query(`
      SELECT * FROM caracterizacion.tipo_identificacion ORDER BY id_tipo_identificacion;
    `);
    
    console.table(data);

    // Verificar estado de migraciones
    console.log('\n🔄 Estado de migraciones:');
    const [migrations] = await sequelize.query(`
      SELECT * FROM "SequelizeMeta" ORDER BY name;
    `);
    
    console.table(migrations);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();
