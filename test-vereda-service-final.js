// Test final del servicio de veredas
import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';

async function testVeredaServiceFinal() {
  console.log('🧪 TEST FINAL - SERVICIO DE VEREDAS');
  console.log('='.repeat(50));
  
  try {
    // Cargar modelos
    console.log('\n📦 Cargando modelos...');
    await loadAllModels();
    
    // Verificar asociaciones
    const municipios = sequelize.models.Municipios;
    const veredas = sequelize.models.Veredas;
    
    const municipiosAssoc = Object.keys(municipios.associations || {});
    const veredasAssoc = Object.keys(veredas.associations || {});
    
    console.log(`\n🔗 Asociaciones verificadas:`);
    console.log(`   - Municipios: [${municipiosAssoc.join(', ')}]`);
    console.log(`   - Veredas: [${veredasAssoc.join(', ')}]`);
    
    if (municipiosAssoc.includes('veredas') && veredasAssoc.includes('municipio')) {
      console.log('✅ Asociaciones correctas detectadas');
      
      // Probar la consulta exacta del servicio
      console.log('\n🔍 Probando consulta del servicio...');
      
      const veredasResult = await veredas.findAll({
        include: [{
          model: municipios,
          as: 'municipio',
          required: false
        }],
        limit: 5,
        order: [['nombre', 'ASC']]
      });
      
      console.log(`✅ Consulta exitosa. Veredas encontradas: ${veredasResult.length}`);
      
      if (veredasResult.length > 0) {
        console.log('\n📋 Primeras 5 veredas:');
        veredasResult.forEach((vereda, index) => {
          console.log(`   ${index + 1}. ${vereda.nombre} (ID: ${vereda.id_vereda})`);
          console.log(`      📍 Municipio: ${vereda.municipio?.nombre_municipio || 'Sin municipio'}`);
          console.log(`      🏷️  Código: ${vereda.codigo_vereda || 'Sin código'}`);
        });
      }
      
      console.log('\n🎯 ¡EL SERVICIO FUNCIONA CORRECTAMENTE!');
      
    } else {
      console.log('❌ Faltan asociaciones críticas');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
  }
}

await testVeredaServiceFinal();
