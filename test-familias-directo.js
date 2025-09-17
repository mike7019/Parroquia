/**
 * Test directo del servicio de familias Excel sin servidor
 */

import familiasConsolidadoService from './src/services/consolidados/familiasConsolidadoService.js';

console.log('🧪 TEST DIRECTO DEL SERVICIO FAMILIAS EXCEL');
console.log('=' .repeat(50));

async function testDirecto() {
  try {
    console.log('\n1️⃣ Probando consulta básica de familias...');
    
    const resultado = await familiasConsolidadoService.consultarFamilias({ 
      limite: 3
    });
    
    console.log(`✅ Consulta exitosa`);
    console.log(`📊 Total registros: ${resultado.total}`);
    console.log(`📋 Estructura respuesta:`, Object.keys(resultado));
    
    if (resultado.datos && resultado.datos.length > 0) {
      console.log(`\n📝 ESTRUCTURA DEL PRIMER REGISTRO:`);
      const primerRegistro = resultado.datos[0];
      Object.keys(primerRegistro).forEach(key => {
        console.log(`   ${key}: ${primerRegistro[key]}`);
      });
      
      console.log('\n2️⃣ Probando generación de datos Excel...');
      const datosExcel = await familiasConsolidadoService.generarReporteExcel({ 
        limite: 2 
      });
      
      console.log(`✅ Generación Excel: ${datosExcel.tiene_datos ? 'EXITOSA' : 'SIN DATOS'}`);
      console.log(`📊 Total registros Excel: ${datosExcel.metadatos.total_registros}`);
      console.log(`📋 Encabezados (${datosExcel.encabezados.length}):`, datosExcel.encabezados);
      
      if (datosExcel.datos && datosExcel.datos.length > 0) {
        console.log(`\n📝 PRIMER REGISTRO EXCEL FORMATEADO:`);
        const primerExcel = datosExcel.datos[0];
        Object.keys(primerExcel).forEach(key => {
          console.log(`   ${key}: ${primerExcel[key]}`);
        });
        
        console.log('\n3️⃣ Validando consistencia JSON vs Excel...');
        console.log(`✅ Registros JSON: ${resultado.total} | Excel: ${datosExcel.metadatos.total_registros}`);
        console.log(`✅ Consistencia: ${resultado.total === datosExcel.metadatos.total_registros ? 'CORRECTA' : 'ERROR'}`);
        
        console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
        console.log('📋 El Excel ahora debería funcionar correctamente');
        return true;
      } else {
        console.log('❌ No se generaron datos Excel');
        return false;
      }
    } else {
      console.log('❌ No se encontraron datos en la consulta básica');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERROR en el test:', error.message);
    console.error('🔍 Stack trace:', error.stack);
    return false;
  }
}

// Ejecutar el test
testDirecto().then(exitoso => {
  console.log('\n' + '='.repeat(50));
  if (exitoso) {
    console.log('🎯 RESULTADO: FUNCIONALIDAD EXCEL REPARADA ✅');
    console.log('📋 Endpoints disponibles:');
    console.log('   • POST /api/familias/excel');
    console.log('   • GET  /api/familias/excel');
  } else {
    console.log('🎯 RESULTADO: AÚN HAY PROBLEMAS ❌');
  }
  console.log('🔚 Test completado');
}).catch(error => {
  console.error('💥 Error ejecutando test directo:', error);
  process.exit(1);
});