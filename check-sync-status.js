import sequelize from './config/sequelize.js';

async function checkSyncStatus() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');
    
    const tables = ['tallas', 'veredas', 'usuarios', 'municipios'];
    for (const table of tables) {
      try {
        const result = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`, { type: sequelize.QueryTypes.SELECT });
        console.log(`📊 ${table}: ${result[0].count} registros`);
      } catch (err) {
        console.log(`❌ ${table}: Error - ${err.message}`);
      }
    }
    
    // Verificar estructura de tallas específicamente
    const tallaStructure = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tallas' 
      ORDER BY ordinal_position
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n🔍 Estructura tabla tallas:');
    tallaStructure.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSyncStatus().catch(console.error);
