import sequelize from '../config/sequelize.js';
import '../src/models/index.js'; // Importar todos los modelos

async function checkModels() {
  try {
    console.log('🔍 Verificando modelos cargados en Sequelize...\n');
    
    // Listar todos los modelos disponibles
    const models = Object.keys(sequelize.models);
    console.log(`📋 Modelos encontrados: ${models.length}`);
    models.forEach((modelName, index) => {
      console.log(`   ${index + 1}. ${modelName}`);
    });
    
    console.log('\n🔍 Buscando modelo Enfermedad...');
    if (sequelize.models.Enfermedad) {
      console.log('✅ Modelo Enfermedad encontrado');
      console.log(`   Tabla: ${sequelize.models.Enfermedad.tableName}`);
      console.log(`   Atributos: ${Object.keys(sequelize.models.Enfermedad.rawAttributes).join(', ')}`);
    } else {
      console.log('❌ Modelo Enfermedad NO encontrado');
    }
    
    // Intentar importar el modelo directamente
    console.log('\n🔍 Importando modelo Enfermedad directamente...');
    const Enfermedad = await import('../src/models/catalog/Enfermedad.js');
    console.log('✅ Modelo importado correctamente');
    console.log(`   Nombre del modelo: ${Enfermedad.default.name}`);
    
    // Intentar hacer una consulta simple
    console.log('\n🔍 Intentando consulta SELECT...');
    const count = await sequelize.query('SELECT COUNT(*) as count FROM enfermedades');
    console.log(`✅ Consulta exitosa. Total de enfermedades: ${count[0][0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkModels();
