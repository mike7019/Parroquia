import aguasResidualesService from '../src/services/catalog/aguasResidualesService.js';

/**
 * Script de prueba para el servicio de Aguas Residuales
 * Ejecutar desde la raíz del proyecto: node test-aguas-residuales-service.js
 */

async function testAguasResidualesService() {
  console.log('🧪 Iniciando pruebas del servicio de Aguas Residuales...\n');

  try {
    // Test 1: Obtener todas las tipos de aguas residuales
    console.log('📋 Test 1: Obtener todos los tipos de aguas residuales');
    const allTipos = await aguasResidualesService.getAllTiposAguasResiduales();
    console.log(`✅ Encontrados ${allTipos.tiposAguasResiduales.length} tipos de aguas residuales`);
    console.log('Datos:', allTipos.tiposAguasResiduales.map(t => ({ id: t.id_tipo_aguas_residuales, nombre: t.nombre })));
    console.log('');

    // Test 2: Búsqueda
    console.log('🔍 Test 2: Búsqueda de tipos de aguas residuales');
    const searchResults = await aguasResidualesService.searchTiposAguasResiduales('alcantarillado');
    console.log(`✅ Encontrados ${searchResults.length} resultados para 'alcantarillado'`);
    console.log('Resultados:', searchResults.map(t => ({ id: t.id_tipo_aguas_residuales, nombre: t.nombre })));
    console.log('');

    // Test 3: Obtener por ID
    if (allTipos.tiposAguasResiduales.length > 0) {
      const firstTipo = allTipos.tiposAguasResiduales[0];
      console.log(`📄 Test 3: Obtener tipo por ID (${firstTipo.id_tipo_aguas_residuales})`);
      const tipoById = await aguasResidualesService.getTipoAguasResidualesById(firstTipo.id_tipo_aguas_residuales);
      console.log(`✅ Tipo encontrado: ${tipoById.nombre}`);
      console.log('');
    }

    // Test 4: Estadísticas
    console.log('📊 Test 4: Obtener estadísticas');
    const stats = await aguasResidualesService.getStatistics();
    console.log('✅ Estadísticas obtenidas:', stats);
    console.log('');

    // Test 5: Crear nuevo tipo (opcional - comentado para evitar datos de prueba)
    /*
    console.log('➕ Test 5: Crear nuevo tipo de aguas residuales');
    const newTipo = await aguasResidualesService.createTipoAguasResiduales({
      nombre: 'Tratamiento Secundario',
      descripcion: 'Sistema de tratamiento secundario para aguas residuales'
    });
    console.log(`✅ Nuevo tipo creado con ID: ${newTipo.id_tipo_aguas_residuales}`);
    
    // Test 6: Actualizar tipo
    console.log('✏️ Test 6: Actualizar tipo de aguas residuales');
    const updatedTipo = await aguasResidualesService.updateTipoAguasResiduales(newTipo.id_tipo_aguas_residuales, {
      descripcion: 'Sistema avanzado de tratamiento secundario para aguas residuales'
    });
    console.log(`✅ Tipo actualizado: ${updatedTipo.nombre}`);
    
    // Test 7: Eliminar tipo
    console.log('🗑️ Test 7: Eliminar tipo de aguas residuales');
    const deleteResult = await aguasResidualesService.deleteTipoAguasResiduales(newTipo.id_tipo_aguas_residuales);
    console.log(`✅ ${deleteResult.message}`);
    */

    console.log('🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar las pruebas
testAguasResidualesService();
