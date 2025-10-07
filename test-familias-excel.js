/**
 * Script de prueba para verificar la generación de Excel de familias
 */

import familiasConsolidadoService from './src/services/consolidados/familiasConsolidadoService.js';
import fs from 'fs';

console.log('🧪 Testing: Generación de Excel de Familias');
console.log('=====================================');

async function testGenerarExcelFamilias() {
  try {
    console.log('📋 1. Consultando familias disponibles...');
    
    const familias = await familiasConsolidadoService.consultarFamilias({
      limite: 5
    });
    
    console.log(`✅ Familias encontradas: ${familias.datos?.length || 0}`);
    
    if (familias.datos && familias.datos.length > 0) {
      console.log('   Ejemplos:');
      familias.datos.slice(0, 3).forEach((fam, index) => {
        console.log(`   ${index + 1}. ${fam.apellido_familiar} - ${fam.miembros_familia?.length || 0} miembros`);
      });
    }
    
    console.log('\n📊 2. Probando método generarReporteExcelFamilias...');
    
    // Verificar que el método existe
    if (typeof familiasConsolidadoService.generarReporteExcelFamilias !== 'function') {
      console.error('❌ Error: El método generarReporteExcelFamilias NO existe');
      console.log('   Métodos disponibles:', Object.getOwnPropertyNames(Object.getPrototypeOf(familiasConsolidadoService)));
      return;
    }
    
    console.log('✅ El método generarReporteExcelFamilias existe');
    
    console.log('\n📊 3. Generando reporte Excel de prueba...');
    
    const workbook = await familiasConsolidadoService.generarReporteExcelFamilias({
      limite: 5
    });
    
    console.log('✅ Workbook generado exitosamente');
    
    // Guardar archivo de prueba
    const testFilename = `test_familias_${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(testFilename);
    
    console.log(`✅ Archivo Excel guardado: ${testFilename}`);
    
    // Verificar que el archivo existe
    if (fs.existsSync(testFilename)) {
      const stats = fs.statSync(testFilename);
      console.log(`   Tamaño del archivo: ${(stats.size / 1024).toFixed(2)} KB`);
      
      // Listar las hojas
      console.log(`   Número de hojas: ${workbook.worksheets.length}`);
      workbook.worksheets.forEach((sheet, index) => {
        console.log(`   ${index + 1}. ${sheet.name} (${sheet.rowCount} filas)`);
      });
    }
    
    console.log('\n✅ ¡Prueba completada exitosamente!');
    console.log('🔍 Verificar que:');
    console.log('   1. El método generarReporteExcelFamilias existe y funciona');
    console.log('   2. Se generan 4 hojas: Info General, Miembros, Difuntos, Estadísticas');
    console.log('   3. El archivo Excel se puede abrir correctamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar la prueba
testGenerarExcelFamilias()
  .then(() => {
    console.log('\n🏁 Prueba finalizada');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });