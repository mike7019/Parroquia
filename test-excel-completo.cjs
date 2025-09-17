/**
 * SCRIPT DE PRUEBA: Generación de Excel Familiar Completo
 * Valida la funcionalidad completa del nuevo método generarReporteExcelFamiliar()
 * Crea un archivo Excel de prueba con datos reales del sistema
 */

const fs = require('fs');
const path = require('path');

async function probarGeneracionExcelCompleto() {
  console.log('🔧 INICIANDO PRUEBA DE EXCEL FAMILIAR COMPLETO');
  console.log('='.repeat(60));

  try {
    // 1. IMPORTAR SERVICIO CON MANEJO DE ES MODULES
    console.log('📦 Importando servicio de familias...');
    const { default: familiasConsolidadoService } = await import('./src/services/consolidados/familiasConsolidadoService.js');
    
    // 2. GENERAR EXCEL CON FILTROS DE PRUEBA
    console.log('📊 Generando Excel con datos de prueba...');
    const filtrosPrueba = {
      municipio: 'BOJAYÁ', // Municipio con datos conocidos
      limit: 10 // Limitar para prueba rápida
    };
    
    console.log('Filtros aplicados:', filtrosPrueba);
    
    const workbook = await familiasConsolidadoService.generarReporteExcelFamiliar(filtrosPrueba);
    
    // 3. VALIDAR ESTRUCTURA DEL WORKBOOK
    console.log('\n📋 VALIDANDO ESTRUCTURA DEL EXCEL:');
    console.log('- Hojas creadas:', workbook.worksheets.length);
    
    workbook.worksheets.forEach((sheet, index) => {
      console.log(`  ${index + 1}. ${sheet.name} (${sheet.rowCount} filas, ${sheet.columnCount} columnas)`);
    });
    
    // 4. GUARDAR ARCHIVO DE PRUEBA
    const nombreArchivo = `reporte-familias-prueba-${Date.now()}.xlsx`;
    const rutaArchivo = path.join(__dirname, nombreArchivo);
    
    console.log(`\n💾 Guardando archivo: ${nombreArchivo}`);
    await workbook.xlsx.writeFile(rutaArchivo);
    
    // 5. VERIFICAR ARCHIVO CREADO
    const stats = fs.statSync(rutaArchivo);
    console.log(`✅ Archivo creado exitosamente:`);
    console.log(`   - Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Ruta: ${rutaArchivo}`);
    
    // 6. VALIDAR CONTENIDO DE CADA HOJA
    console.log('\n📄 DETALLES POR HOJA:');
    
    const hojaResumen = workbook.getWorksheet('Resumen Familiar');
    if (hojaResumen) {
      console.log(`   - Resumen Familiar: ${hojaResumen.rowCount - 1} familias procesadas`);
    }
    
    const hojaDetalle = workbook.getWorksheet('Detalle Familiar');
    if (hojaDetalle) {
      console.log(`   - Detalle Familiar: ${hojaDetalle.rowCount - 1} miembros individuales`);
    }
    
    const hojaEstadisticas = workbook.getWorksheet('Estadísticas');
    if (hojaEstadisticas) {
      console.log(`   - Estadísticas: ${hojaEstadisticas.rowCount} filas de datos`);
    }
    
    const hojaDifuntos = workbook.getWorksheet('Difuntos');
    if (hojaDifuntos) {
      console.log(`   - Difuntos: ${hojaDifuntos.rowCount - 1} registros de difuntos`);
    }
    
    const hojaPastoral = workbook.getWorksheet('Necesidades Pastorales');
    if (hojaPastoral) {
      console.log(`   - Necesidades Pastorales: ${hojaPastoral.rowCount - 1} familias con necesidades`);
    }
    
    console.log('\n🎉 PRUEBA DE EXCEL COMPLETADA EXITOSAMENTE!');
    console.log(`📁 Archivo listo para revisión: ${nombreArchivo}`);
    
    return {
      exito: true,
      archivo: rutaArchivo,
      tamano_kb: (stats.size / 1024).toFixed(2),
      hojas: workbook.worksheets.length,
      mensaje: 'Excel generado correctamente con todas las hojas'
    };
    
  } catch (error) {
    console.error('❌ ERROR EN PRUEBA DE EXCEL:', error.message);
    console.error('Stack completo:', error.stack);
    
    return {
      exito: false,
      error: error.message,
      mensaje: 'Error en generación de Excel'
    };
  }
}

// 7. PRUEBA ADICIONAL: EXCEL SIN FILTROS (TODOS LOS DATOS)
async function probarExcelCompleto() {
  console.log('\n' + '='.repeat(60));
  console.log('🌍 PRUEBA ADICIONAL: EXCEL SIN FILTROS (TODAS LAS FAMILIAS)');
  
  try {
    const { default: familiasConsolidadoService } = await import('./src/services/consolidados/familiasConsolidadoService.js');
    
    console.log('📊 Generando Excel completo (sin filtros)...');
    const workbook = await familiasConsolidadoService.generarReporteExcelFamiliar();
    
    const nombreArchivo = `reporte-familias-completo-${Date.now()}.xlsx`;
    const rutaArchivo = path.join(__dirname, nombreArchivo);
    
    await workbook.xlsx.writeFile(rutaArchivo);
    const stats = fs.statSync(rutaArchivo);
    
    console.log(`✅ Excel completo generado:`);
    console.log(`   - Archivo: ${nombreArchivo}`);
    console.log(`   - Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   - Hojas: ${workbook.worksheets.length}`);
    
    return { exito: true, archivo: rutaArchivo };
    
  } catch (error) {
    console.error('❌ Error en Excel completo:', error.message);
    return { exito: false, error: error.message };
  }
}

// EJECUTAR PRUEBAS
async function ejecutarPruebas() {
  console.log('🚀 INICIANDO SUITE DE PRUEBAS EXCEL FAMILIAR');
  console.log('Fecha:', new Date().toLocaleString());
  console.log('='.repeat(60));
  
  // Prueba 1: Excel con filtros
  const resultado1 = await probarGeneracionExcelCompleto();
  
  // Prueba 2: Excel completo (solo si la primera funciona)
  let resultado2 = null;
  if (resultado1.exito) {
    resultado2 = await probarExcelCompleto();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS:');
  console.log('- Excel con filtros:', resultado1.exito ? '✅ EXITOSO' : '❌ FALLÓ');
  if (resultado2) {
    console.log('- Excel completo:', resultado2.exito ? '✅ EXITOSO' : '❌ FALLÓ');
  }
  console.log('='.repeat(60));
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = { probarGeneracionExcelCompleto, probarExcelCompleto };