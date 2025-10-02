/**
 * Script de prueba para verificar la corrección del parentesco en difuntos consolidado
 * Verificará que se devuelve el parentesco real en lugar del parentesco inferido
 */

import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';
import { Parentesco } from './src/models/index.js';

console.log('🧪 Testing: Corrección del parentesco en difuntos consolidado');
console.log('=====================================');

async function testDifuntosParentesco() {
  try {
    console.log('📋 1. Obteniendo algunos parentescos existentes...');
    
    // Obtener parentescos existentes
    const parentescos = await Parentesco.findAll({
      limit: 5,
      order: [['id_parentesco', 'ASC']]
    });
    
    if (parentescos.length > 0) {
      console.log(`✅ Encontrados ${parentescos.length} parentescos:`);
      parentescos.forEach(p => {
        console.log(`   - ID: ${p.id_parentesco}, Nombre: ${p.nombre}`);
      });
    } else {
      console.log('⚠️  No se encontraron parentescos en la base de datos');
    }
    
    console.log('\n📋 2. Consultando difuntos sin filtros...');
    
    // Consultar difuntos sin filtros
    const resultadoCompleto = await difuntosConsolidadoService.consultarDifuntos({});
    
    console.log(`✅ Total de difuntos encontrados: ${resultadoCompleto.total}`);
    console.log(`   - Difuntos Familia: ${resultadoCompleto.estadisticas.difuntos_familia}`);
    console.log(`   - Personas Fallecidas: ${resultadoCompleto.estadisticas.personas_fallecidas}`);
    
    // Analizar parentescos en el resultado
    const parentescosEncontrados = {};
    resultadoCompleto.datos.forEach(difunto => {
      const parentesco = difunto.parentesco_real || 'Sin parentesco';
      parentescosEncontrados[parentesco] = (parentescosEncontrados[parentesco] || 0) + 1;
    });
    
    console.log('\n📊 Distribución de parentescos en el resultado:');
    Object.entries(parentescosEncontrados).forEach(([parentesco, count]) => {
      console.log(`   - ${parentesco}: ${count} difuntos`);
    });
    
    // Mostrar algunos ejemplos detallados
    console.log('\n📋 3. Ejemplos de difuntos con parentesco real:');
    const ejemplos = resultadoCompleto.datos.slice(0, 5);
    ejemplos.forEach((difunto, index) => {
      console.log(`   ${index + 1}. ${difunto.nombre_completo}`);
      console.log(`      Parentesco: ${difunto.parentesco_real || 'No especificado'}`);
      console.log(`      ID Parentesco: ${difunto.id_parentesco || 'No asignado'}`);
      console.log(`      Fuente: ${difunto.fuente}`);
      console.log('');
    });
    
    // Probar filtro por parentesco si hay parentescos disponibles
    if (parentescos.length > 0) {
      const primerParentesco = parentescos[0];
      console.log(`\n📋 4. Probando filtro por parentesco: ${primerParentesco.nombre} (ID: ${primerParentesco.id_parentesco})`);
      
      const resultadoFiltrado = await difuntosConsolidadoService.consultarDifuntos({
        id_parentesco: primerParentesco.id_parentesco
      });
      
      console.log(`✅ Difuntos encontrados con parentesco "${primerParentesco.nombre}": ${resultadoFiltrado.total}`);
      
      if (resultadoFiltrado.total > 0) {
        console.log('   Ejemplos:');
        resultadoFiltrado.datos.slice(0, 3).forEach((difunto, index) => {
          console.log(`     ${index + 1}. ${difunto.nombre_completo} - Parentesco: ${difunto.parentesco_real}`);
        });
      }
    }
    
    console.log('\n✅ ¡Prueba completada exitosamente!');
    console.log('🔍 Verificar que:');
    console.log('   1. Los difuntos ahora muestran el parentesco real de la tabla parentescos');
    console.log('   2. No aparece "Familiar" como parentesco inferido por defecto');
    console.log('   3. El filtro por id_parentesco funciona correctamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar la prueba
testDifuntosParentesco()
  .then(() => {
    console.log('\n🏁 Prueba finalizada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });