// Test para forzar la configuración de asociaciones
import './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';

async function forceAssociations() {
  console.log('🔧 FORZANDO CONFIGURACIÓN DE ASOCIACIONES');
  console.log('='.repeat(50));
  
  try {
    // Verificar que los modelos tengan función associate
    const municipios = sequelize.models.Municipios;
    const veredas = sequelize.models.Veredas;
    
    console.log('\n📋 Verificando funciones associate:');
    console.log(`   - Municipios.associate: ${typeof municipios.associate === 'function' ? '✅' : '❌'}`);
    console.log(`   - Veredas.associate: ${typeof veredas.associate === 'function' ? '✅' : '❌'}`);
    
    if (typeof municipios.associate !== 'function') {
      console.log('❌ Municipios no tiene función associate');
      return;
    }
    
    if (typeof veredas.associate !== 'function') {
      console.log('❌ Veredas no tiene función associate');
      return;
    }
    
    console.log('\n🔗 Configurando asociaciones manualmente...');
    
    // Configurar asociaciones manualmente
    municipios.associate(sequelize.models);
    veredas.associate(sequelize.models);
    
    console.log('✅ Asociaciones configuradas manualmente');
    
    // Verificar que se configuraron
    const municipiosAssoc = Object.keys(municipios.associations || {});
    const veredasAssoc = Object.keys(veredas.associations || {});
    
    console.log(`\n🔍 Asociaciones después de configurar:`);
    console.log(`   - Municipios: [${municipiosAssoc.join(', ')}]`);
    console.log(`   - Veredas: [${veredasAssoc.join(', ')}]`);
    
    if (municipiosAssoc.includes('veredas') && veredasAssoc.includes('municipio')) {
      console.log('✅ Asociaciones configuradas correctamente');
      
      // Ahora probar la consulta
      console.log('\n🧪 Probando consulta con asociaciones configuradas...');
      
      const veredas = await sequelize.models.Veredas.findAll({
        include: [{
          model: sequelize.models.Municipios,
          as: 'municipio',
          required: false
        }],
        limit: 3
      });
      
      console.log(`✅ Consulta exitosa. Veredas encontradas: ${veredas.length}`);
      
      if (veredas.length > 0) {
        veredas.forEach((vereda, index) => {
          console.log(`\n   ${index + 1}. ${vereda.nombre}`);
          console.log(`      Municipio: ${vereda.municipio?.nombre_municipio || 'No asociado'}`);
        });
      }
      
    } else {
      console.log('❌ Las asociaciones no se configuraron correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

await forceAssociations();
