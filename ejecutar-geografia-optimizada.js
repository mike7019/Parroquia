/**
 * EJECUTOR DE SEEDERS GEOGRÁFICOS OPTIMIZADOS
 * 
 * Este script ejecuta los seeders de geografía con IDs secuenciales
 * y fallbacks robustos en caso de fallo de API externa
 */

import { runGeografiaSeeders } from './src/seeders/geografiaOptimizada.js';

console.log('🚀 Iniciando ejecución de seeders geográficos optimizados...\n');

(async () => {
  try {
    const inicio = Date.now();
    
    const resultados = await runGeografiaSeeders();
    
    const tiempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);
    
    console.log(`\n🏁 Ejecución completada en ${tiempoTotal} segundos`);
    
    // Verificar si hay errores
    const errores = Object.values(resultados).filter(r => !r?.success);
    if (errores.length > 0) {
      console.log(`\n⚠️ Se encontraron ${errores.length} errores:`);
      errores.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message || 'Error desconocido'}`);
      });
      process.exit(1);
    } else {
      console.log('\n✅ Todos los seeders ejecutados exitosamente');
      console.log('\n📋 Los datos geográficos ahora tienen IDs secuenciales:');
      console.log('   - Departamentos: ID 1-33');
      console.log('   - Municipios: ID 1-N (secuenciales)');
      console.log('   - Parroquia San José: ID 1');
      console.log('   - Sector Centro: ID 1');
      console.log('   - Vereda La Macarena: ID 1');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
})();
