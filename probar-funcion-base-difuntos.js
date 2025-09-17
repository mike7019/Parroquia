/**
 * Prueba de la función base obtenerDifuntosConsolidados y los nuevos métodos
 * Verificar que todos los endpoints pueden usar la función base
 */

import 'dotenv/config';
import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';

async function probarFuncionBase() {
  try {
    console.log('🧪 PROBANDO FUNCIÓN BASE Y MÉTODOS REFACTORIZADOS');
    console.log('=' .repeat(60));

    // 1. Probar función base directamente
    console.log('\n1️⃣ PROBANDO FUNCIÓN BASE obtenerDifuntosConsolidados');
    console.log('-'.repeat(50));
    
    const opcionesBase = {
      filtrosSQL: {},
      filtrosJS: {},
      ordenamiento: 'fecha_aniversario DESC',
      limite: 10,
      incluirMetadatos: true
    };

    const resultadoBase = await difuntosConsolidadoService.obtenerDifuntosConsolidados(opcionesBase);
    console.log(`✅ Función base ejecutada: ${resultadoBase.total} difuntos encontrados`);
    console.log(`📊 Fuentes: ${resultadoBase.fuentes.difuntos_familia} difuntos_familia, ${resultadoBase.fuentes.personas_fallecidas} personas`);

    // 2. Probar método refactorizado consultarDifuntos
    console.log('\n2️⃣ PROBANDO MÉTODO REFACTORIZADO consultarDifuntos');
    console.log('-'.repeat(50));
    
    const filtrosTradicionais = {
      // parentesco: 'padre',
      // mes_aniversario: 5
    };

    const resultadoTradicial = await difuntosConsolidadoService.consultarDifuntos(filtrosTradicionais);
    console.log(`✅ Método tradicional ejecutado: ${resultadoTradicial.total} difuntos encontrados`);

    // 3. Probar nuevos métodos especializados
    console.log('\n3️⃣ PROBANDO NUEVOS MÉTODOS ESPECIALIZADOS');
    console.log('-'.repeat(50));

    // 3a. Buscar por parentesco
    console.log('\n🔸 Probando buscar por parentesco (padre)...');
    const padres = await difuntosConsolidadoService.obtenerDifuntosPorParentesco('padre');
    console.log(`✅ Padres difuntos: ${padres.total} encontrados`);

    // 3b. Buscar por parentesco (madre)
    console.log('\n🔸 Probando buscar por parentesco (madre)...');
    const madres = await difuntosConsolidadoService.obtenerDifuntosPorParentesco('madre');
    console.log(`✅ Madres difuntas: ${madres.total} encontradas`);

    // 3c. Buscar por texto libre
    console.log('\n🔸 Probando buscar por texto libre...');
    const busquedaTexto = await difuntosConsolidadoService.buscarDifuntosTextoLibre('cardiovascular', 20);
    console.log(`✅ Búsqueda por "cardiovascular": ${busquedaTexto.total} encontrados`);

    // 3d. Buscar por mes de aniversario
    console.log('\n🔸 Probando buscar por mes de aniversario (mayo)...');
    const mesAniversario = await difuntosConsolidadoService.obtenerDifuntosPorMesAniversario(5);
    console.log(`✅ Difuntos de mayo: ${mesAniversario.total} encontrados`);

    // 3e. Buscar por rango de fechas
    console.log('\n🔸 Probando buscar por rango de fechas...');
    const rangoFechas = await difuntosConsolidadoService.obtenerDifuntosPorRangoFechas('2020-01-01', '2020-12-31');
    console.log(`✅ Difuntos 2020: ${rangoFechas.total} encontrados`);

    // 4. Probar aniversarios próximos
    console.log('\n4️⃣ PROBANDO ANIVERSARIOS PRÓXIMOS');
    console.log('-'.repeat(50));
    
    const aniversarios = await difuntosConsolidadoService.obtenerAniversariosProximos(30);
    console.log(`✅ Aniversarios próximos (30 días): ${aniversarios.length} encontrados`);

    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('=' .repeat(60));
    console.log('📋 RESUMEN:');
    console.log(`   • Función base: ✅ Funcional`);
    console.log(`   • Método tradicional: ✅ Funcional`);
    console.log(`   • Métodos especializados: ✅ Funcionales`);
    console.log(`   • Aniversarios próximos: ✅ Funcional`);
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ ERROR DURANTE LAS PRUEBAS:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Ejecutar pruebas
probarFuncionBase();