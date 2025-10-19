import personasService from './src/services/consolidados/personasService.js';
import fs from 'fs';

async function testGenerarExcel() {
  try {
    console.log('📊 TEST: Generar Excel de personas y verificar columna Parroquia');
    console.log('='.repeat(70));

    // Parámetros para el reporte
    const filtros = {
      page: 1,
      limit: 10
    };

    console.log('\n1️⃣ Consultando personas...\n');
    const resultado = await personasService.consultarPersonas(filtros);

    console.log(`✅ Personas encontradas: ${resultado.data.length}`);
    console.log(`   Total en BD: ${resultado.total}\n`);

    // Mostrar datos de parroquia
    console.log('2️⃣ Verificando campo PARROQUIA en los datos:\n');
    resultado.data.slice(0, 5).forEach((persona, index) => {
      console.log(`   Persona ${index + 1}:`);
      console.log(`     Nombre: ${persona.nombre_completo}`);
      console.log(`     Parroquia: ${persona.parroquia || 'NULL'}`);
      console.log(`     Municipio: ${persona.municipio || 'NULL'}`);
      console.log(`     Sector: ${persona.sector || 'NULL'}`);
      console.log();
    });

    console.log('3️⃣ Generando Excel...\n');
    const buffer = await personasService.generarExcelPersonas(resultado.data);

    console.log(`✅ Excel generado: ${buffer.length} bytes\n`);

    // Guardar el archivo
    const fileName = 'test-personas-parroquia.xlsx';
    fs.writeFileSync(fileName, buffer);

    console.log(`💾 Archivo guardado: ${fileName}`);
    console.log('   Abre el archivo y verifica la columna "Parroquia"\n');

    console.log('='.repeat(70));
    console.log('✅ TEST COMPLETADO');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Abre el archivo Excel generado');
    console.log('   2. Busca la columna "Parroquia" (columna L)');
    console.log('   3. Verifica si tiene datos o está vacía');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testGenerarExcel();
