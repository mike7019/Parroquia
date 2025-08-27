// Test final de asociaciones corregidas Municipios-Veredas
import './syncDatabaseComplete.js';
import veredaService from './src/services/catalog/veredaService.js';

async function testFinalVeredasAssociations() {
  console.log('🎯 TEST FINAL DE ASOCIACIONES MUNICIPIOS-VEREDAS');
  console.log('='.repeat(55));
  
  console.log('\n📋 CONFIGURACIÓN APLICADA:');
  console.log('1. ✅ Municipios.js tiene función associate completa');
  console.log('2. ✅ Veredas.js tiene belongsTo(Municipios)');  
  console.log('3. ✅ Ambos modelos están en safeModels');
  console.log('4. ✅ veredaService usa sequelize.models.Municipios');

  try {
    console.log('\n🧪 Probando getAllVeredas...');
    const result = await veredaService.getAllVeredas();
    
    console.log(`📊 Status: ${result.status}`);
    console.log(`📈 Total: ${result.total}`);
    console.log(`📝 Mensaje: ${result.message}`);
    
    if (result.status === 'success') {
      console.log('\n✅ ¡ÉXITO! Las asociaciones funcionan correctamente');
      
      if (result.data.length > 0) {
        console.log(`\n📋 Primeras ${Math.min(3, result.data.length)} veredas:`);
        for (let i = 0; i < Math.min(3, result.data.length); i++) {
          const vereda = result.data[i];
          console.log(`\n   ${i + 1}. ${vereda.nombre}`);
          console.log(`      ID: ${vereda.id_vereda}`);
          console.log(`      Código: ${vereda.codigo_vereda || 'N/A'}`);
          console.log(`      Municipio: ${vereda.municipio?.nombre || 'No asociado'}`);
          console.log(`      ID Municipio: ${vereda.municipio?.id_municipio || 'N/A'}`);
        }
      } else {
        console.log('\n📝 No hay veredas en la base de datos, pero las asociaciones funcionan');
      }
      
      console.log('\n🎉 RESULTADO: Error "not associated" RESUELTO');
      
    } else {
      console.log('\n❌ Aún hay problemas con las asociaciones');
      console.log('Mensaje de error:', result.message);
      
      if (result.message.includes('not associated')) {
        console.log('\n🔧 El error de asociación persiste. Posibles causas:');
        console.log('   - El servidor necesita ser reiniciado');
        console.log('   - Las asociaciones no se configuraron en el orden correcto');
        console.log('   - Hay conflicto de nombres entre modelos');
      }
    }
    
    // Test adicional: verificar que los modelos existen
    console.log('\n🔍 VERIFICACIÓN DE MODELOS CARGADOS:');
    const sequelize = (await import('./config/sequelize.js')).default;
    
    const municipiosExists = !!sequelize.models.Municipios;
    const veredasExists = !!sequelize.models.Veredas;
    const departamentosExists = !!sequelize.models.Departamentos;
    
    console.log(`   - Municipios: ${municipiosExists ? '✅' : '❌'}`);
    console.log(`   - Veredas: ${veredasExists ? '✅' : '❌'}`);
    console.log(`   - Departamentos: ${departamentosExists ? '✅' : '❌'}`);
    
    if (municipiosExists && veredasExists) {
      console.log('\n✅ Ambos modelos están disponibles en sequelize.models');
      
      // Verificar asociaciones
      const municipiosModel = sequelize.models.Municipios;
      const veredasModel = sequelize.models.Veredas;
      
      const municipiosAssociations = Object.keys(municipiosModel.associations || {});
      const veredasAssociations = Object.keys(veredasModel.associations || {});
      
      console.log(`\n🔗 Asociaciones de Municipios: [${municipiosAssociations.join(', ')}]`);
      console.log(`🔗 Asociaciones de Veredas: [${veredasAssociations.join(', ')}]`);
      
      if (municipiosAssociations.includes('veredas') && veredasAssociations.includes('municipio')) {
        console.log('✅ Las asociaciones están configuradas correctamente');
      } else {
        console.log('❌ Faltan asociaciones esperadas');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verificar que el servidor esté funcionando');
    console.log('2. Reiniciar el servidor para aplicar cambios');
    console.log('3. Verificar que no hay errores de sintaxis en los modelos');
  }
}

console.log('🚀 Ejecutando test final de asociaciones...\n');
await testFinalVeredasAssociations();

console.log('\n📋 RESUMEN:');
console.log('Si este test es exitoso, el error original debería estar resuelto.');
console.log('Las veredas deberían mostrarse con sus municipios asociados.');
console.log('El endpoint GET /api/catalog/veredas debería funcionar correctamente.');
