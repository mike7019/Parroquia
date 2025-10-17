/**
 * Test para verificar que el reporte de familias incluye el ID de familia
 * Prueba tanto la consulta de datos como la generación del Excel
 */

import familiasConsultasService from './src/services/familiasConsultasService.js';
import ReporteService from './src/services/reportes/reporteService.js';
import fs from 'fs';
import path from 'path';

const reporteService = new ReporteService();

async function testReporteFamiliasConID() {
  try {
    console.log('📊 TEST: Reporte de Familias con ID');
    console.log('='.repeat(80));
    console.log('');

    // 1. Consultar familias
    console.log('1️⃣ CONSULTANDO FAMILIAS:\n');
    const filtros = {
      limite: 5 // Solo 5 familias para prueba
    };

    const resultado = await familiasConsultasService.consultarFamiliasConPadresMadres(filtros);
    const familias = resultado?.datos || resultado;

    console.log(`   ✅ Se obtuvieron ${familias.length} familias\n`);

    // 2. Mostrar estructura de datos
    console.log('2️⃣ ESTRUCTURA DE DATOS DE LA PRIMERA FAMILIA:\n');
    if (familias.length > 0) {
      const primeraFamilia = familias[0];
      console.log('   Campos disponibles:');
      console.log(`   - id_encuesta: ${primeraFamilia.id_encuesta}`);
      console.log(`   - id_familia: ${primeraFamilia.id_familia || 'NO EXISTE'}`);
      console.log(`   - informacionGeneral.apellido_familiar: ${primeraFamilia.informacionGeneral?.apellido_familiar}`);
      console.log(`   - informacionGeneral.municipio: ${JSON.stringify(primeraFamilia.informacionGeneral?.municipio)}`);
      console.log(`   - informacionGeneral.sector: ${JSON.stringify(primeraFamilia.informacionGeneral?.sector)}`);
      console.log(`   - familyMembers (cantidad): ${primeraFamilia.familyMembers?.length || 0}`);
      console.log(`   - metadata.total_miembros: ${primeraFamilia.metadata?.total_miembros}`);
      console.log('');

      if (primeraFamilia.familyMembers && primeraFamilia.familyMembers.length > 0) {
        console.log('   Primera persona en familyMembers:');
        const primerMiembro = primeraFamilia.familyMembers[0];
        console.log(`   - nombres: ${primerMiembro.nombres}`);
        console.log(`   - numeroIdentificacion: ${primerMiembro.numeroIdentificacion}`);
        console.log(`   - sexo: ${JSON.stringify(primerMiembro.sexo)}`);
        console.log('');
      }
    }

    // 3. Tabla resumen de IDs
    console.log('3️⃣ TABLA DE IDs DE FAMILIAS:\n');
    console.log('┌────────────┬─────────────────────────────┬───────────────────────┐');
    console.log('│ ID Familia │ Apellido Familiar           │ Municipio             │');
    console.log('├────────────┼─────────────────────────────┼───────────────────────┤');
    
    familias.forEach(familia => {
      const id = String(familia.id_encuesta || familia.id_familia || 'N/A').padStart(10, ' ');
      const apellido = (familia.informacionGeneral?.apellido_familiar || familia.apellido_familiar || 'N/A')
        .substring(0, 27).padEnd(27, ' ');
      const municipio = (familia.informacionGeneral?.municipio?.nombre || familia.municipio || 'N/A')
        .substring(0, 21).padEnd(21, ' ');
      console.log(`│ ${id} │ ${apellido} │ ${municipio} │`);
    });
    
    console.log('└────────────┴─────────────────────────────┴───────────────────────┘\n');

    // 4. Generar reporte Excel
    console.log('4️⃣ GENERANDO REPORTE EXCEL:\n');
    
    const reporte = await reporteService.generarReporteFamiliasExcel(familias, filtros, {
      incluirEstadisticas: true,
      formatoAvanzado: true
    });

    console.log(`   ✅ Reporte generado:`);
    console.log(`      Nombre: ${reporte.filename}`);
    console.log(`      Tamaño: ${Math.round(reporte.size / 1024)} KB`);
    console.log(`      Registros: ${reporte.registros}`);
    console.log('');

    // 5. Guardar archivo
    console.log('5️⃣ GUARDANDO ARCHIVO:\n');
    
    const dirReportes = './reportes_test';
    if (!fs.existsSync(dirReportes)) {
      fs.mkdirSync(dirReportes, { recursive: true });
    }

    const rutaArchivo = path.join(dirReportes, reporte.filename);
    fs.writeFileSync(rutaArchivo, reporte.buffer);

    console.log(`   ✅ Archivo guardado en: ${rutaArchivo}\n`);

    // 6. Resumen final
    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETADO\n');
    console.log('📋 RESUMEN:');
    console.log(`   - Familias consultadas: ${familias.length}`);
    console.log(`   - Reporte generado: ${reporte.filename}`);
    console.log(`   - Tamaño del archivo: ${Math.round(reporte.size / 1024)} KB`);
    console.log(`   - Registros en el reporte: ${reporte.registros}`);
    console.log('');
    console.log('💡 VERIFICACIÓN:');
    console.log('   1. Abre el archivo Excel generado');
    console.log('   2. Verifica que la columna "ID Familia" contenga valores');
    console.log('   3. Compara los IDs con la tabla mostrada arriba');
    console.log('');
    console.log(`📂 Ubicación: ${path.resolve(rutaArchivo)}\n`);

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
    process.exit(1);
  }
}

// Ejecutar test
testReporteFamiliasConID();
