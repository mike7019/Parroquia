/**
 * Script para analizar qué datos realmente devuelve el servicio de familias
 * Esto nos permitirá ajustar el Excel correctamente
 */

import familiasConsolidadoService from './src/services/consolidados/familiasConsolidadoService.js';

console.log('🔍 ANALIZANDO ESTRUCTURA DE DATOS ACTUAL DEL SERVICIO FAMILIAS');
console.log('=' .repeat(60));

async function analizarEstructuraDatos() {
  try {
    console.log('\n📊 PASO 1: Consulta básica sin filtros...');
    
    const resultado = await familiasConsolidadoService.consultarFamilias({ limite: 3 });
    
    console.log(`\n✅ Resultado obtenido:`);
    console.log(`📈 Total registros: ${resultado.total}`);
    console.log(`📋 Estructura de respuesta:`, Object.keys(resultado));
    
    if (resultado.datos && resultado.datos.length > 0) {
      console.log(`\n🔍 ESTRUCTURA DEL PRIMER REGISTRO:`);
      const primerRegistro = resultado.datos[0];
      console.log('Campos disponibles:', Object.keys(primerRegistro));
      
      console.log('\n📝 CONTENIDO COMPLETO DEL PRIMER REGISTRO:');
      console.log(JSON.stringify(primerRegistro, null, 2));
      
      console.log('\n📝 CONTENIDO DE LOS PRIMEROS 3 REGISTROS:');
      resultado.datos.slice(0, 3).forEach((registro, index) => {
        console.log(`\n--- REGISTRO ${index + 1} ---`);
        console.log(JSON.stringify(registro, null, 2));
      });
    } else {
      console.log('❌ No se encontraron datos');
    }
    
    // Probar con filtros específicos
    console.log('\n📊 PASO 2: Consulta con filtros específicos...');
    const resultadoFiltrado = await familiasConsolidadoService.consultarFamilias({ 
      limite: 2,
      incluir_detalles: true
    });
    
    console.log(`\n✅ Resultado con filtros:`);
    console.log(`📈 Total registros: ${resultadoFiltrado.total}`);
    if (resultadoFiltrado.estadisticas) {
      console.log(`📊 Estadísticas disponibles:`, Object.keys(resultadoFiltrado.estadisticas));
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ ERROR analizando estructura:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Ejecutar análisis
if (import.meta.url === `file://${process.argv[1]}`) {
  analizarEstructuraDatos().then(resultado => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ANÁLISIS COMPLETADO');
    
    if (resultado && resultado.datos && resultado.datos.length > 0) {
      console.log('\n📋 RESUMEN DE CAMPOS DISPONIBLES:');
      const camposDisponibles = Object.keys(resultado.datos[0]);
      camposDisponibles.forEach(campo => {
        const valor = resultado.datos[0][campo];
        const tipo = typeof valor;
        console.log(`   ${campo}: ${tipo} = ${valor}`);
      });
    }
    
    console.log('\n🔚 Usar esta información para corregir formatearDatosParaExcel()');
  }).catch(error => {
    console.error('💥 Error ejecutando análisis:', error);
    process.exit(1);
  });
}

export default analizarEstructuraDatos;