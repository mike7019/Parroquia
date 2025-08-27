// Prueba simple para verificar asociaciones
import './syncDatabaseComplete.js';

async function simpleAssociationTest() {
  const { default: sequelize } = await import('./config/sequelize.js');
  
  console.log('🔍 DIAGNÓSTICO SIMPLE DE ASOCIACIONES');
  console.log('=====================================');
  
  // Verificar modelos disponibles
  console.log('\n📦 Modelos disponibles en sequelize:');
  const availableModels = Object.keys(sequelize.models);
  availableModels.forEach(model => {
    console.log(`   - ${model}`);
  });
  
  // Verificar modelo específico Veredas
  const VeredasModel = sequelize.models.Veredas;
  const MunicipiosModel = sequelize.models.Municipios; // Cambiar a Municipios
  
  console.log(`\n🔍 Modelo Veredas existe: ${!!VeredasModel}`);
  console.log(`🔍 Modelo Municipios existe: ${!!MunicipiosModel}`);
  
  // Verificar si tienen funciones associate
  if (VeredasModel) {
    console.log(`🔍 Veredas.associate función existe: ${typeof VeredasModel.associate === 'function'}`);
  }
  if (MunicipiosModel) {
    console.log(`🔍 Municipios.associate función existe: ${typeof MunicipiosModel.associate === 'function'}`);
  }
  
  if (VeredasModel) {
    console.log('\n🔗 Asociaciones de Veredas:');
    console.log(`   - associations: ${Object.keys(VeredasModel.associations || {})}`);
    
    // Probar query simple sin include
    try {
      console.log('\n📊 Probando query simple (sin include)...');
      const simpleVeredas = await VeredasModel.findAll({
        limit: 3,
        attributes: ['id_vereda', 'nombre', 'id_municipio_municipios']
      });
      
      console.log(`✅ Query simple exitosa, encontradas: ${simpleVeredas.length} veredas`);
      if (simpleVeredas.length > 0) {
        console.log(`   Primera vereda: "${simpleVeredas[0].nombre}" (ID: ${simpleVeredas[0].id_vereda})`);
      }
      
    } catch (error) {
      console.error('❌ Error en query simple:', error.message);
    }
    
    // Probar query con include usando string
    try {
      console.log('\n📊 Probando query con include usando alias...');
      const veredasWithMunicipio = await VeredasModel.findAll({
        include: ['municipio'], // Usar alias directamente
        limit: 2
      });
      
      console.log(`✅ Query con include exitosa: ${veredasWithMunicipio.length} veredas`);
      if (veredasWithMunicipio.length > 0) {
        const vereda = veredasWithMunicipio[0];
        console.log(`   Vereda: "${vereda.nombre}"`);
        console.log(`   Municipio: ${vereda.municipio?.nombre_municipio || 'No asociado'}`);
      }
      
    } catch (error) {
      console.error('❌ Error en query con include:', error.message);
    }
  }
  
  await sequelize.close();
}

simpleAssociationTest().catch(console.error);
