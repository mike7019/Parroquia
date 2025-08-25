import db from './src/models/index.js';

async function testModels() {
  try {
    console.log('🧪 Probando carga de modelos...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // Check that models are loaded
    const models = [
      'Usuario', 'Role', 'Parroquia', 'Veredas', 'Municipios', 
      'Departamentos', 'Familias', 'Persona', 'DifuntosFamilia'
    ];
    
    console.log('📋 Modelos cargados:');
    models.forEach(modelName => {
      if (db[modelName]) {
        console.log(`✅ ${modelName}: OK`);
      } else {
        console.log(`❌ ${modelName}: FALTANTE`);
      }
    });
    
    // Test a simple query
    const municipiosCount = await db.Municipios.count();
    console.log(`🏙️  Total municipios: ${municipiosCount}`);
    
    const veredasCount = await db.Veredas.count();
    console.log(`🌾 Total veredas: ${veredasCount}`);
    
    console.log('🎉 Prueba de modelos completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error probando modelos:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
  }
}

testModels();
