import sequelize from './config/sequelize.js';

async function checkVeredas() {
  try {
    await sequelize.authenticate();
    
    const result = await sequelize.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('📊 Estructura de tabla veredas:');
    console.table(result);
    
    // Verificar datos
    const data = await sequelize.query(`SELECT id_vereda, nombre, nombre_vereda, codigo_vereda FROM veredas LIMIT 3`, { type: sequelize.QueryTypes.SELECT });
    console.log('\n📋 Datos actuales:');
    console.table(data);
    
    // Verificar si hay columna nombre_vereda vacía
    const emptyCount = await sequelize.query(`SELECT COUNT(*) as count FROM veredas WHERE nombre_vereda IS NULL`, { type: sequelize.QueryTypes.SELECT });
    console.log(`\n📊 Registros con nombre_vereda vacío: ${emptyCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkVeredas().catch(console.error);
