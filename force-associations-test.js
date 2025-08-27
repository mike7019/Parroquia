// Forzar configuración de asociaciones y probar
import './syncDatabaseComplete.js';

async function forceAssociations() {
  const { default: sequelize } = await import('./config/sequelize.js');
  
  console.log('🔧 FORZANDO CONFIGURACIÓN DE ASOCIACIONES');
  console.log('==========================================');
  
  // Obtener modelos
  const VeredasModel = sequelize.models.Veredas;
  const MunicipiosModel = sequelize.models.Municipios;
  
  try {
    // Configurar asociaciones manualmente
    console.log('\n⚙️ Configurando asociaciones manualmente...');
    
    if (VeredasModel.associate) {
      VeredasModel.associate(sequelize.models);
      console.log('✅ Asociaciones de Veredas configuradas');
    }
    
    if (MunicipiosModel.associate) {
      MunicipiosModel.associate(sequelize.models);
      console.log('✅ Asociaciones de Municipios configuradas');
    }
    
    // Verificar asociaciones después de configurar
    console.log('\n🔍 Verificando asociaciones después de configurar:');
    console.log(`Veredas asociaciones: ${Object.keys(VeredasModel.associations)}`);
    console.log(`Municipios asociaciones: ${Object.keys(MunicipiosModel.associations)}`);
    
    // Probar query con include
    console.log('\n📊 Probando query con include después de configurar asociaciones...');
    const veredasWithMunicipio = await VeredasModel.findAll({
      include: [{
        model: MunicipiosModel,
        as: 'municipio',
        required: false
      }],
      limit: 2
    });
    
    console.log(`✅ Query exitosa: ${veredasWithMunicipio.length} veredas encontradas`);
    
    if (veredasWithMunicipio.length > 0) {
      const vereda = veredasWithMunicipio[0];
      console.log(`\n📋 Primera vereda:`);
      console.log(`   - Nombre: "${vereda.nombre}"`);
      console.log(`   - ID: ${vereda.id_vereda}`);
      console.log(`   - Municipio: ${vereda.municipio?.nombre_municipio || 'No asociado'}`);
      console.log(`   - ID Municipio: ${vereda.municipio?.id_municipio || 'N/A'}`);
    }
    
    // Probar con servicio original
    console.log('\n🧪 Probando con veredaService...');
    const { default: veredaService } = await import('./src/services/catalog/veredaService.js');
    
    const result = await veredaService.getAllVeredas();
    console.log(`📊 Servicio resultado: ${result.status}`);
    console.log(`📈 Total: ${result.total}`);
    console.log(`📝 Mensaje: ${result.message}`);
    
    if (result.status === 'success') {
      console.log('\n🎉 ¡ÉXITO! Las asociaciones están funcionando correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await sequelize.close();
}

forceAssociations().catch(console.error);
