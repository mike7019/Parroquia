/**
 * Prueba específica del filtro de parentesco con datos existentes
 */

import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';

console.log('🧪 Testing: Filtro de parentesco "Padre" (ID: 2)');
console.log('=====================================');

async function testFiltroPadre() {
  try {
    console.log('📋 Consultando difuntos con parentesco "Padre" (ID: 2)...');
    
    const resultado = await difuntosConsolidadoService.consultarDifuntos({
      id_parentesco: 2
    });
    
    console.log(`✅ Difuntos encontrados con parentesco "Padre": ${resultado.total}`);
    
    if (resultado.total > 0) {
      console.log('\n📋 Detalles de los difuntos encontrados:');
      resultado.datos.forEach((difunto, index) => {
        console.log(`${index + 1}. Nombre: ${difunto.nombre_completo}`);
        console.log(`   Parentesco Real: ${difunto.parentesco_real}`);
        console.log(`   ID Parentesco: ${difunto.id_parentesco}`);
        console.log(`   Familia: ${difunto.apellido_familiar || 'No especificada'}`);
        console.log(`   Fecha: ${difunto.fecha_aniversario || 'No especificada'}`);
        console.log('');
      });
      
      // Verificar que todos tienen parentesco "Padre"
      const todosConParentescoPadre = resultado.datos.every(d => d.parentesco_real === 'Padre');
      console.log(`✅ Verificación: Todos los resultados tienen parentesco "Padre": ${todosConParentescoPadre}`);
      
      // Verificar que todos tienen id_parentesco = 2
      const todosConIdPadre = resultado.datos.every(d => d.id_parentesco == 2);
      console.log(`✅ Verificación: Todos tienen id_parentesco = 2: ${todosConIdPadre}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testFiltroPadre()
  .then(() => {
    console.log('\n🏁 Prueba finalizada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });