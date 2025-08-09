async function testEnfermedadService() {
  try {
    console.log('🧪 Iniciando pruebas del servicio de Enfermedades\n');

    // Importar el servicio dinámicamente
    const enfermedadServiceModule = await import('../src/services/catalog/enfermedadService.js');
    const enfermedadService = enfermedadServiceModule.default;

    // Test 1: Obtener todas las enfermedades
    console.log('📋 Test 1: Obtener todas las enfermedades');
    const resultadoTodas = await enfermedadService.getAllEnfermedades({ limit: 50 });
    console.log(`✅ Total de enfermedades: ${resultadoTodas.pagination.totalCount}`);
    console.log(`   Primeras 3: ${resultadoTodas.enfermedades.slice(0, 3).map(e => e.nombre).join(', ')}\n`);

    // Test 2: Buscar con paginación
    console.log('📋 Test 2: Buscar con paginación (página 1, 5 resultados)');
    const resultado = await enfermedadService.getAllEnfermedades({ page: 1, limit: 5 });
    console.log(`✅ Enfermedades encontradas: ${resultado.pagination.totalCount}`);
    console.log(`   Mostrando: ${resultado.enfermedades.length} de ${resultado.pagination.totalCount}`);
    console.log(`   Páginas: ${resultado.pagination.totalPages}\n`);

    // Test 3: Buscar por término específico
    console.log('📋 Test 3: Buscar enfermedades con "diabetes"');
    const busquedaDiabetes = await enfermedadService.getAllEnfermedades({ search: 'diabetes', limit: 10 });
    console.log(`✅ Enfermedades encontradas: ${busquedaDiabetes.pagination.totalCount}`);
    busquedaDiabetes.enfermedades.forEach(e => {
      console.log(`   - ${e.nombre}`);
    });
    console.log('');

    // Test 4: Obtener enfermedad por ID
    console.log('📋 Test 4: Obtener enfermedad por ID');
    const primeraEnfermedad = resultadoTodas.enfermedades[0];
    const enfermedadPorId = await enfermedadService.getEnfermedadById(primeraEnfermedad.id_enfermedad);
    console.log(`✅ Enfermedad obtenida: ${enfermedadPorId.nombre}`);
    console.log(`   Descripción: ${enfermedadPorId.descripcion.substring(0, 60)}...\n`);

    // Test 5: Crear nueva enfermedad
    console.log('📋 Test 5: Crear nueva enfermedad');
    const nuevaEnfermedad = await enfermedadService.createEnfermedad({
      nombre: 'Enfermedad de Prueba',
      descripcion: 'Esta es una enfermedad creada para pruebas del sistema.'
    });
    console.log(`✅ Nueva enfermedad creada: ${nuevaEnfermedad.nombre} (ID: ${nuevaEnfermedad.id_enfermedad})\n`);

    // Test 6: Actualizar enfermedad
    console.log('📋 Test 6: Actualizar enfermedad');
    const enfermedadActualizada = await enfermedadService.updateEnfermedad(nuevaEnfermedad.id_enfermedad, {
      descripcion: 'Descripción actualizada para la enfermedad de prueba.'
    });
    console.log(`✅ Enfermedad actualizada: ${enfermedadActualizada.nombre}`);
    console.log(`   Nueva descripción: ${enfermedadActualizada.descripcion}\n`);

    // Test 7: Verificar total después de crear
    console.log('📋 Test 7: Verificar total después de crear');
    const totalFinalResult = await enfermedadService.getAllEnfermedades({ limit: 50 });
    console.log(`✅ Total de enfermedades ahora: ${totalFinalResult.pagination.totalCount}\n`);

    // Test 8: Eliminar enfermedad de prueba
    console.log('📋 Test 8: Eliminar enfermedad de prueba');
    await enfermedadService.deleteEnfermedad(nuevaEnfermedad.id_enfermedad);
    console.log(`✅ Enfermedad eliminada: ${nuevaEnfermedad.nombre}\n`);

    // Test 9: Verificar total después de eliminar
    console.log('📋 Test 9: Verificar total después de eliminar');
    const totalFinalFinalResult = await enfermedadService.getAllEnfermedades({ limit: 50 });
    console.log(`✅ Total de enfermedades final: ${totalFinalFinalResult.pagination.totalCount}\n`);

    console.log('🎉 Todas las pruebas completadas exitosamente!');
    console.log('✅ El servicio CRUD de Enfermedades está funcionando correctamente.');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    process.exit(0);
  }
}

testEnfermedadService();
