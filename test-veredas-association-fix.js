// Script para probar las asociaciones corregidas Municipio-Veredas
import './syncDatabaseComplete.js'; // Cargar modelos primero
import veredaService from './src/services/catalog/veredaService.js';

async function testVeredasAssociationFixed() {
  console.log('🧪 PROBANDO ASOCIACIONES MUNICIPIO-VEREDAS CORREGIDAS');
  console.log('='.repeat(60));
  
  try {
    console.log('\n1️⃣ Probando getAllVeredas con include de Municipio...');
    const result = await veredaService.getAllVeredas();
    
    console.log(`📊 Status: ${result.status}`);
    console.log(`📈 Total veredas: ${result.total}`);
    console.log(`📝 Mensaje: ${result.message}`);
    
    if (result.status === 'success' && result.data.length > 0) {
      console.log('\n✅ ¡Asociaciones funcionando correctamente!');
      
      // Mostrar primeras 3 veredas como ejemplo
      const samplesToShow = Math.min(3, result.data.length);
      console.log(`\n📋 Mostrando ${samplesToShow} veredas de ejemplo:`);
      
      for (let i = 0; i < samplesToShow; i++) {
        const vereda = result.data[i];
        console.log(`\n   ${i + 1}. Vereda "${vereda.nombre}"`);
        console.log(`      - ID: ${vereda.id_vereda}`);
        console.log(`      - Código: ${vereda.codigo_vereda || 'N/A'}`);
        console.log(`      - Municipio: ${vereda.municipio?.nombre || 'No asociado'}`);
        console.log(`      - ID Municipio: ${vereda.municipio?.id_municipio || 'N/A'}`);
      }
      
    } else if (result.status === 'error') {
      console.log('❌ Error en asociaciones:', result.message);
      
      if (result.message.includes('not associated')) {
        console.log('\n💡 El error de asociación persiste. Posibles causas:');
        console.log('   - Las asociaciones no se configuraron correctamente');
        console.log('   - Es necesario reiniciar el servidor');
        console.log('   - Falta sincronización de modelos');
      }
    }
    
    // Prueba adicional: buscar por municipio específico
    console.log('\n2️⃣ Probando getVeredasByMunicipio(1)...');
    const veredasByMunicipio = await veredaService.getVeredasByMunicipio(1);
    console.log(`✅ Veredas encontradas para municipio 1: ${veredasByMunicipio.length}`);
    
    if (veredasByMunicipio.length > 0) {
      const firstVereda = veredasByMunicipio[0];
      console.log(`   Primera vereda: "${firstVereda.nombre}"`);
      console.log(`   Municipio asociado: ${firstVereda.municipio?.nombre || 'No asociado'}`);
    }
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('   1. Reiniciar el servidor de desarrollo');
    console.log('   2. Ejecutar sincronización de base de datos');
    console.log('   3. Verificar que todas las correcciones se aplicaron');
  }
}

// Función para mostrar resumen de cambios aplicados
function showAppliedChanges() {
  console.log('\n📋 CAMBIOS APLICADOS PARA CORREGIR ASOCIACIONES:');
  console.log('='.repeat(55));
  
  const changes = [
    {
      file: 'Municipio.cjs',
      change: 'models.Vereda → models.Veredas',
      status: '✅ Aplicado'
    },
    {
      file: 'Veredas.js', 
      change: 'Agregada función associate() con belongsTo',
      status: '✅ Aplicado'
    },
    {
      file: 'veredaService.js',
      change: 'sequelize.models.Municipios → Municipio (4 lugares)',
      status: '✅ Aplicado'
    },
    {
      file: 'syncDatabaseComplete.js',
      change: 'Agregado Veredas a safeModels array',
      status: '✅ Aplicado'
    }
  ];
  
  changes.forEach((change, index) => {
    console.log(`\n${index + 1}. ${change.file}:`);
    console.log(`   📝 Cambio: ${change.change}`);
    console.log(`   ${change.status}`);
  });
}

console.log('🔧 CORRECCIÓN DE ASOCIACIONES MUNICIPIO-VEREDAS');
console.log('================================================');

showAppliedChanges();
await testVeredasAssociationFixed();

console.log('\n🎯 RESULTADO:');
console.log('Si las pruebas son exitosas, el error "Municipios is not associated to Veredas!" debería estar resuelto.');
console.log('Si persisten errores, es necesario reiniciar el servidor para que los cambios surtan efecto.');
