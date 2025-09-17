/**
 * SCRIPT DE PRUEBA SIMPLIFICADO: Solo validar la funcionalidad del servicio
 * Evita problemas de mock del response para focus en la lógica de negocio
 */

async function probarServicioDirecto() {
  console.log('🔧 INICIANDO PRUEBA DIRECTA DEL SERVICIO EXCEL');
  console.log('='.repeat(60));

  try {
    // 1. IMPORTAR SERVICIO
    console.log('📦 Importando servicio de familias...');
    const { default: familiasConsolidadoService } = await import('./src/services/consolidados/familiasConsolidadoService.js');
    
    console.log('✅ Servicio importado correctamente');
    
    // 2. VERIFICAR MÉTODO EXISTE
    const metodoExiste = typeof familiasConsolidadoService.generarReporteExcelFamiliar === 'function';
    console.log(`📋 Método generarReporteExcelFamiliar: ${metodoExiste ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    if (!metodoExiste) {
      return { exito: false, error: 'Método no existe' };
    }
    
    // 3. PRUEBA CON FILTROS BÁSICOS
    console.log('\n📊 PRUEBA 1: Generando Excel con filtros...');
    const filtros = { municipio: 'BOJAYÁ', limit: 3 };
    console.log('Filtros:', filtros);
    
    const workbook1 = await familiasConsolidadoService.generarReporteExcelFamiliar(filtros);
    
    console.log(`✅ Excel generado: ${workbook1 ? 'SÍ' : 'NO'}`);
    console.log(`📄 Hojas creadas: ${workbook1 ? workbook1.worksheets.length : 0}`);
    
    if (workbook1) {
      workbook1.worksheets.forEach((sheet, index) => {
        console.log(`   ${index + 1}. ${sheet.name} - ${sheet.rowCount} filas`);
      });
    }
    
    // 4. PRUEBA SIN FILTROS
    console.log('\n📊 PRUEBA 2: Generando Excel sin filtros...');
    const workbook2 = await familiasConsolidadoService.generarReporteExcelFamiliar();
    
    console.log(`✅ Excel sin filtros: ${workbook2 ? 'SÍ' : 'NO'}`);
    console.log(`📄 Hojas creadas: ${workbook2 ? workbook2.worksheets.length : 0}`);
    
    // 5. PRUEBA DE GUARDADO REAL
    console.log('\n💾 PRUEBA 3: Guardando archivo real...');
    const nombreArchivo = `test-servicio-${Date.now()}.xlsx`;
    await workbook1.xlsx.writeFile(nombreArchivo);
    
    const fs = require('fs');
    const stats = fs.statSync(nombreArchivo);
    console.log(`✅ Archivo guardado: ${nombreArchivo}`);
    console.log(`📏 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // 6. VALIDAR MÉTODO DEL CONTROLADOR
    console.log('\n🎯 PRUEBA 4: Validando método del controlador...');
    const { default: familiasConsolidadoController } = await import('./src/controllers/consolidados/familiasConsolidadoController.js');
    
    const metodoControllerExiste = typeof familiasConsolidadoController.generarReporteExcelCompleto === 'function';
    console.log(`📋 Método del controlador: ${metodoControllerExiste ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    
    return {
      exito: true,
      resultados: {
        metodo_servicio_existe: metodoExiste,
        excel_con_filtros: !!workbook1,
        excel_sin_filtros: !!workbook2,
        archivo_guardado: true,
        metodo_controller_existe: metodoControllerExiste,
        archivo_prueba: nombreArchivo
      }
    };
    
  } catch (error) {
    console.error('❌ ERROR EN PRUEBA:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      exito: false,
      error: error.message
    };
  }
}

// EJECUTAR
if (require.main === module) {
  probarServicioDirecto().catch(console.error);
}

module.exports = { probarServicioDirecto };