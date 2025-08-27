// Test para verificar loadAllModels específicamente
import { loadAllModels } from './syncDatabaseComplete.js';
import sequelize from './config/sequelize.js';

async function testLoadAllModels() {
  console.log('🧪 PROBANDO loadAllModels()');
  console.log('='.repeat(50));
  
  try {
    console.log('\n📦 Llamando loadAllModels()...');
    const result = await loadAllModels();
    
    console.log('\n📊 Resultado de loadAllModels():');
    console.log(`   - Success: ${result.success}`);
    console.log(`   - Models Loaded: ${result.modelsLoaded}`);
    console.log(`   - Associations Configured: ${result.associationsConfigured}`);
    
    // Verificar específicamente Municipios y Veredas
    const municipios = sequelize.models.Municipios;
    const veredas = sequelize.models.Veredas;
    
    console.log('\n🔍 Estado después de loadAllModels():');
    console.log(`   - Municipios existe: ${!!municipios}`);
    console.log(`   - Veredas existe: ${!!veredas}`);
    
    if (municipios && veredas) {
      const municipiosAssoc = Object.keys(municipios.associations || {});
      const veredasAssoc = Object.keys(veredas.associations || {});
      
      console.log(`   - Asociaciones Municipios: [${municipiosAssoc.join(', ')}]`);
      console.log(`   - Asociaciones Veredas: [${veredasAssoc.join(', ')}]`);
      
      if (municipiosAssoc.length === 0 || veredasAssoc.length === 0) {
        console.log('\n❌ ¡Las asociaciones están vacías después de loadAllModels()!');
        console.log('🔍 Verificando si están en safeModels...');
        
        // Verificar si están en safeModels (copiando la lista de loadAllModels)
        const safeModels = ['Encuesta', 'Enfermedad', 'Familia', 'FamiliaDisposicionBasura', 
                           'FamiliaSistemaAcueducto', 'FamiliaTipoAguasResiduales', 'FamiliaTipoVivienda',
                           'PersonaEnfermedad', 'Profesion', 'Sexo', 'SistemaAcueducto', 
                           'TipoAguasResiduales', 'TipoDisposicionBasura', 'TipoVivienda',
                           'Municipio', 'Departamento', 'Veredas', 'Municipios', 'Departamentos'];
        
        console.log(`   - Municipios en safeModels: ${safeModels.includes('Municipios') ? '✅' : '❌'}`);
        console.log(`   - Veredas en safeModels: ${safeModels.includes('Veredas') ? '✅' : '❌'}`);
        
        console.log('\n🔧 Configurando manualmente para comparar...');
        if (typeof municipios.associate === 'function') {
          municipios.associate(sequelize.models);
          console.log('✅ Municipios.associate() ejecutado manualmente');
        }
        
        if (typeof veredas.associate === 'function') {
          veredas.associate(sequelize.models);
          console.log('✅ Veredas.associate() ejecutado manualmente');
        }
        
        const municipiosAssocAfter = Object.keys(municipios.associations || {});
        const veredasAssocAfter = Object.keys(veredas.associations || {});
        
        console.log(`   - Asociaciones Municipios después: [${municipiosAssocAfter.join(', ')}]`);
        console.log(`   - Asociaciones Veredas después: [${veredasAssocAfter.join(', ')}]`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en testLoadAllModels():', error.message);
    console.error(error.stack);
  }
}

await testLoadAllModels();
