import sequelize from './config/sequelize.js';

(async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla difuntos_familia...');
    
    const result = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'difuntos_familia' ORDER BY ordinal_position;", 
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📋 Estructura de la tabla difuntos_familia:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // También vamos a ver algunos datos de ejemplo
    console.log('\n🔍 Datos de ejemplo:');
    const ejemplos = await sequelize.query(
      "SELECT * FROM difuntos_familia LIMIT 3;", 
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(ejemplos);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
