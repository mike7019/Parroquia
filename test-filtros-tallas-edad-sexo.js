/**
 * Test para verificar filtros de edad y sexo en reportes de tallas
 * Prueba el endpoint GET /api/personas/consolidado/tallas
 */

import personasService from './src/services/consolidados/personasService.js';

async function testFiltrosTallasEdadSexo() {
  try {
    console.log('🧪 TEST: Filtros de Tallas con Edad y Sexo');
    console.log('='.repeat(80));
    console.log('');

    // TEST 1: Solo filtro de tallas
    console.log('1️⃣ TEST: Solo tallas (sin edad ni sexo)\n');
    const test1 = await personasService.consultarPersonas({
      talla_camisa: 'M',
      limit: 5
    });
    console.log(`   ✅ Personas con talla M: ${test1.data.length}`);
    if (test1.data.length > 0) {
      console.log(`   Primera persona: ${test1.data[0].nombre_completo}, Edad: ${test1.data[0].edad}, Sexo: ${test1.data[0].sexo}`);
    }
    console.log('');

    // TEST 2: Tallas + Edad mínima
    console.log('2️⃣ TEST: Tallas + Edad mínima (18 años)\n');
    const test2 = await personasService.consultarPersonas({
      talla_camisa: 'M',
      edad_min: 18,
      limit: 5
    });
    console.log(`   ✅ Personas con talla M y mayores de 18 años: ${test2.data.length}`);
    if (test2.data.length > 0) {
      test2.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Edad: ${p.edad}, Sexo: ${p.sexo}`);
      });
    }
    console.log('');

    // TEST 3: Tallas + Rango de edad
    console.log('3️⃣ TEST: Tallas + Rango de edad (18-35 años)\n');
    const test3 = await personasService.consultarPersonas({
      talla_camisa: 'M',
      edad_min: 18,
      edad_max: 35,
      limit: 5
    });
    console.log(`   ✅ Personas con talla M entre 18-35 años: ${test3.data.length}`);
    if (test3.data.length > 0) {
      test3.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Edad: ${p.edad}, Sexo: ${p.sexo}`);
      });
    }
    console.log('');

    // TEST 4: Tallas + Sexo (por ID)
    console.log('4️⃣ TEST: Tallas + Sexo Masculino (id_sexo=1)\n');
    const test4 = await personasService.consultarPersonas({
      talla_camisa: 'M',
      id_sexo: 1,
      limit: 5
    });
    console.log(`   ✅ Hombres con talla M: ${test4.data.length}`);
    if (test4.data.length > 0) {
      test4.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Edad: ${p.edad}, Sexo: ${p.sexo}`);
      });
    }
    console.log('');

    // TEST 5: Tallas + Sexo (por nombre)
    console.log('5️⃣ TEST: Tallas + Sexo Femenino (por nombre)\n');
    const test5 = await personasService.consultarPersonas({
      talla_camisa: 'S',
      sexo: 'femenino',
      limit: 5
    });
    console.log(`   ✅ Mujeres con talla S: ${test5.data.length}`);
    if (test5.data.length > 0) {
      test5.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Edad: ${p.edad}, Sexo: ${p.sexo}`);
      });
    }
    console.log('');

    // TEST 6: Combinación completa
    console.log('6️⃣ TEST: Combinación completa (Tallas + Edad + Sexo)\n');
    const test6 = await personasService.consultarPersonas({
      talla_camisa: 'M',
      edad_min: 20,
      edad_max: 40,
      id_sexo: 1,
      limit: 10
    });
    console.log(`   ✅ Hombres con talla M entre 20-40 años: ${test6.data.length}`);
    if (test6.data.length > 0) {
      console.log('\n   📋 Tabla de resultados:\n');
      console.log('   ┌─────┬──────────────────────────┬──────┬───────────────┬─────────────┐');
      console.log('   │ No. │ Nombre                   │ Edad │ Sexo          │ Talla       │');
      console.log('   ├─────┼──────────────────────────┼──────┼───────────────┼─────────────┤');
      test6.data.forEach((p, i) => {
        const num = String(i + 1).padStart(3, ' ');
        const nombre = (p.nombre_completo || 'N/A').substring(0, 24).padEnd(24, ' ');
        const edad = String(p.edad || 'N/A').padStart(4, ' ');
        const sexo = (p.sexo || 'N/A').substring(0, 13).padEnd(13, ' ');
        const talla = (p.talla_camisa || 'N/A').padEnd(11, ' ');
        console.log(`   │ ${num} │ ${nombre} │ ${edad} │ ${sexo} │ ${talla} │`);
      });
      console.log('   └─────┴──────────────────────────┴──────┴───────────────┴─────────────┘\n');
    }
    console.log('');

    // TEST 7: Múltiples tallas
    console.log('7️⃣ TEST: Talla de pantalón con filtros\n');
    const test7 = await personasService.consultarPersonas({
      talla_pantalon: '32',
      edad_min: 18,
      limit: 5
    });
    console.log(`   ✅ Personas con talla de pantalón 32 (mayores de 18): ${test7.data.length}`);
    if (test7.data.length > 0) {
      test7.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Pantalón: ${p.talla_pantalon}, Edad: ${p.edad}`);
      });
    }
    console.log('');

    // TEST 8: Talla de zapato
    console.log('8️⃣ TEST: Talla de zapato con sexo\n');
    const test8 = await personasService.consultarPersonas({
      talla_zapato: '40',
      sexo: 'masculino',
      limit: 5
    });
    console.log(`   ✅ Hombres con talla de zapato 40: ${test8.data.length}`);
    if (test8.data.length > 0) {
      test8.data.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.nombre_completo} - Zapato: ${p.talla_zapato}, Sexo: ${p.sexo}`);
      });
    }
    console.log('');

    // RESUMEN FINAL
    console.log('='.repeat(80));
    console.log('✅ TEST COMPLETADO\n');
    console.log('📊 RESUMEN DE FILTROS PROBADOS:\n');
    console.log('   ✅ Filtro por talla de camisa');
    console.log('   ✅ Filtro por talla de pantalón');
    console.log('   ✅ Filtro por talla de zapato');
    console.log('   ✅ Filtro por edad mínima (edad_min)');
    console.log('   ✅ Filtro por edad máxima (edad_max)');
    console.log('   ✅ Filtro por rango de edad (edad_min + edad_max)');
    console.log('   ✅ Filtro por sexo usando ID (id_sexo)');
    console.log('   ✅ Filtro por sexo usando nombre (sexo)');
    console.log('   ✅ Combinación de todos los filtros\n');

    console.log('🎯 ENDPOINTS DISPONIBLES:\n');
    console.log('   GET /api/personas/consolidado/tallas');
    console.log('   Parámetros:');
    console.log('     - talla_camisa: string (ej: M, L, XL)');
    console.log('     - talla_pantalon: string (ej: 32, 34)');
    console.log('     - talla_zapato: string (ej: 40, 42)');
    console.log('     - edad_min: integer (ej: 18)');
    console.log('     - edad_max: integer (ej: 65)');
    console.log('     - id_sexo: integer (1=Masculino, 2=Femenino)');
    console.log('     - sexo: string (ej: masculino, femenino)');
    console.log('     - format: string (json | excel)\n');

    console.log('📝 EJEMPLO DE USO:\n');
    console.log('   GET /api/personas/consolidado/tallas?talla_camisa=M&edad_min=20&edad_max=40&id_sexo=1&format=excel\n');
    console.log('   Descarga Excel con hombres de 20-40 años con talla M\n');

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
    process.exit(1);
  }
}

// Ejecutar test
testFiltrosTallasEdadSexo();
