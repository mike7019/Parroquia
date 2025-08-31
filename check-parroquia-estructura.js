import sequelize from './config/sequelize.js';

(async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla parroquia...');
    
    const result = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'parroquia' ORDER BY ordinal_position;", 
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📋 Estructura de la tabla parroquia:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
