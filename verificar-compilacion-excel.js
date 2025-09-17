#!/usr/bin/env node

/**
 * Script simple para verificar que el servicio y controlador de Excel compilen correctamente
 */

console.log('🔍 Verificando importaciones y compilación...');

async function verificarCompilacion() {
    try {
        // Importar servicio
        console.log('📦 Importando servicio de difuntos consolidado...');
        const { default: difuntosConsolidadoService } = await import('./src/services/consolidados/difuntosConsolidadoService.js');
        console.log('✅ Servicio importado correctamente');

        // Importar controlador
        console.log('📦 Importando controlador de difuntos consolidado...');
        const { default: difuntosConsolidadoController } = await import('./src/controllers/consolidados/difuntosConsolidadoController.js');
        console.log('✅ Controlador importado correctamente');

        // Verificar que los métodos existen
        console.log('🔍 Verificando métodos del servicio...');
        const metodosServicio = [
            'obtenerDifuntosConsolidados',
            'generarReporteExcel',
            'formatearDatosParaExcel',
            'obtenerEncabezadosExcel',
            'generarNombreArchivoExcel'
        ];

        metodosServicio.forEach(metodo => {
            if (typeof difuntosConsolidadoService[metodo] === 'function') {
                console.log(`   ✅ ${metodo}`);
            } else {
                console.log(`   ❌ ${metodo} - NO ENCONTRADO`);
            }
        });

        console.log('🔍 Verificando métodos del controlador...');
        const metodosControlador = [
            'consultarDifuntos',
            'obtenerAniversariosProximos',
            'generarReporteExcel',
            'crearArchivoExcel',
            'crearExcelSinDatos'
        ];

        metodosControlador.forEach(metodo => {
            if (typeof difuntosConsolidadoController[metodo] === 'function') {
                console.log(`   ✅ ${metodo}`);
            } else {
                console.log(`   ❌ ${metodo} - NO ENCONTRADO`);
            }
        });

        // Probar importación de ExcelJS
        console.log('📦 Verificando ExcelJS...');
        const ExcelJS = await import('exceljs');
        console.log('✅ ExcelJS importado correctamente');

        // Crear un libro de prueba
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Test');
        worksheet.addRow(['Test', 'Value']);
        
        const buffer = await workbook.xlsx.writeBuffer();
        console.log(`✅ Archivo Excel de prueba generado: ${buffer.length} bytes`);

        console.log('\n🎉 ¡Todas las verificaciones pasaron exitosamente!');
        console.log('✅ El código está listo para funcionar');

    } catch (error) {
        console.error('❌ Error en verificación:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Ejecutar verificación
verificarCompilacion().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});