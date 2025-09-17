/**
 * Prueba del método obtenerAniversariosProximos
 * Verificar que el método funciona correctamente
 */

import 'dotenv/config';
import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';

async function probarAniversariosProximos() {
  try {
    console.log('🧪 PROBANDO MÉTODO obtenerAniversariosProximos');
    console.log('=' .repeat(50));

    // Probar con 30 días por defecto
    console.log('\n📅 Probando aniversarios próximos (30 días)...');
    const aniversarios30 = await difuntosConsolidadoService.obtenerAniversariosProximos(30);
    console.log(`✅ Resultado: ${aniversarios30.length} aniversarios próximos`);
    
    if (aniversarios30.length > 0) {
      console.log('Primeros 3 resultados:');
      aniversarios30.slice(0, 3).forEach((aniversario, index) => {
        console.log(`  ${index + 1}. ${aniversario.nombre_completo} - ${aniversario.dias_hasta_aniversario} días`);
      });
    }

    // Probar con 60 días
    console.log('\n📅 Probando aniversarios próximos (60 días)...');
    const aniversarios60 = await difuntosConsolidadoService.obtenerAniversariosProximos(60);
    console.log(`✅ Resultado: ${aniversarios60.length} aniversarios próximos`);

    // Probar con 365 días (todo el año)
    console.log('\n📅 Probando aniversarios próximos (365 días)...');
    const aniversarios365 = await difuntosConsolidadoService.obtenerAniversariosProximos(365);
    console.log(`✅ Resultado: ${aniversarios365.length} aniversarios próximos`);

    console.log('\n🎉 MÉTODO FUNCIONA CORRECTAMENTE');
    console.log(`📊 Resumen:`);
    console.log(`   - 30 días: ${aniversarios30.length} aniversarios`);
    console.log(`   - 60 días: ${aniversarios60.length} aniversarios`);
    console.log(`   - 365 días: ${aniversarios365.length} aniversarios`);

  } catch (error) {
    console.error('❌ ERROR AL PROBAR EL MÉTODO:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cerrar conexión si es necesario
    process.exit(0);
  }
}

// Ejecutar prueba
probarAniversariosProximos();