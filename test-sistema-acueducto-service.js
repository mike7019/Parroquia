/**
 * Script para probar los servicios de Sistemas de Acueducto
 * Utilizando las funciones del service layer
 */

import {
  createSistemaAcueducto,
  getAllSistemasAcueducto,
  getSistemaAcueductoById,
  updateSistemaAcueducto,
  deleteSistemaAcueducto,
  searchSistemasAcueducto,
  getSistemasByName,
  getUniqueNombres,
  getStatistics,
  bulkCreateSistemasAcueducto
} from './src/services/catalog/sistemaAcueductoService.js';

async function testSistemaAcueductoService() {
  try {
    console.log('🧪 Probando servicios de Sistemas de Acueducto...\n');

    // Test 1: Crear sistema
    console.log('➕ Test 1: Crear nuevo sistema');
    const nombreTest = `Test Service ${Date.now()}`;
    const nuevoSistema = await createSistemaAcueducto({
      nombre: nombreTest,
      descripcion: 'Sistema creado desde el service layer'
    });
    console.log('✅ Sistema creado:', nuevoSistema);
    console.log('');

    // Test 2: Obtener todos los sistemas
    console.log('📋 Test 2: Obtener todos los sistemas');
    const todosSistemas = await getAllSistemasAcueducto();
    console.log(`✅ Total de sistemas: ${todosSistemas.total}`);
    console.log('Primeros 3 sistemas:');
    todosSistemas.sistemas.slice(0, 3).forEach(sistema => {
      console.log(`   - ID: ${sistema.id_sistema_acueducto}, Nombre: ${sistema.nombre}`);
    });
    console.log('');

    // Test 3: Obtener sistema por ID
    console.log('👁️ Test 3: Obtener sistema por ID');
    const sistemaById = await getSistemaAcueductoById(nuevoSistema.id_sistema_acueducto);
    console.log('✅ Sistema obtenido:', {
      id: sistemaById.id_sistema_acueducto,
      nombre: sistemaById.nombre,
      descripcion: sistemaById.descripcion
    });
    console.log('');

    // Test 4: Buscar sistemas
    console.log('🔍 Test 4: Buscar sistemas');
    const resultadoBusqueda = await searchSistemasAcueducto('Test');
    console.log(`✅ Encontrados ${resultadoBusqueda.total} sistemas con 'Test'`);
    resultadoBusqueda.sistemas.forEach(sistema => {
      console.log(`   - ${sistema.nombre}`);
    });
    console.log('');

    // Test 5: Obtener con filtros
    console.log('🔄 Test 5: Obtener con filtros y ordenamiento');
    const sistemasOrdenados = await getAllSistemasAcueducto({
      search: 'agua',
      sortBy: 'nombre',
      sortOrder: 'DESC'
    });
    console.log(`✅ Sistemas con 'agua' ordenados por nombre (DESC): ${sistemasOrdenados.total}`);
    sistemasOrdenados.sistemas.forEach(sistema => {
      console.log(`   - ${sistema.nombre}`);
    });
    console.log('');

    // Test 6: Actualizar sistema
    console.log('✏️ Test 6: Actualizar sistema');
    const sistemaActualizado = await updateSistemaAcueducto(nuevoSistema.id_sistema_acueducto, {
      nombre: `${nombreTest} Actualizado`,
      descripcion: 'Descripción actualizada desde el service'
    });
    console.log('✅ Sistema actualizado:', {
      id: sistemaActualizado.id_sistema_acueducto,
      nombre: sistemaActualizado.nombre,
      descripcion: sistemaActualizado.descripcion
    });
    console.log('');

    // Test 7: Obtener nombres únicos
    console.log('📝 Test 7: Obtener nombres únicos');
    const nombresUnicos = await getUniqueNombres();
    console.log(`✅ Total de nombres únicos: ${nombresUnicos.length}`);
    console.log('Primeros 5 nombres:', nombresUnicos.slice(0, 5));
    console.log('');

    // Test 8: Estadísticas
    console.log('📊 Test 8: Obtener estadísticas');
    const estadisticas = await getStatistics();
    console.log('✅ Estadísticas:', estadisticas);
    console.log('');

    // Test 9: Creación masiva
    console.log('📦 Test 9: Creación masiva');
    const timestamp = Date.now();
    const sistemasParaCrear = [
      { nombre: `Bulk Test 1 ${timestamp}`, descripcion: 'Primer sistema del bulk' },
      { nombre: `Bulk Test 2 ${timestamp}`, descripcion: 'Segundo sistema del bulk' },
      { nombre: `Bulk Test 3 ${timestamp}`, descripcion: null }
    ];
    
    const resultadoBulk = await bulkCreateSistemasAcueducto(sistemasParaCrear);
    console.log(`✅ Creados ${resultadoBulk.count} sistemas en bulk`);
    resultadoBulk.created.forEach(sistema => {
      console.log(`   - ID: ${sistema.id_sistema_acueducto}, Nombre: ${sistema.nombre}`);
    });
    console.log('');

    // Test 10: Obtener por nombre
    console.log('🔎 Test 10: Obtener por nombre');
    const sistemasPorNombre = await getSistemasByName(`Bulk Test 1 ${timestamp}`);
    console.log(`✅ Sistemas encontrados con nombre específico: ${sistemasPorNombre.length}`);
    sistemasPorNombre.forEach(sistema => {
      console.log(`   - ID: ${sistema.id_sistema_acueducto}, Nombre: ${sistema.nombre}`);
    });
    console.log('');

    // Test 11: Probar validaciones de error
    console.log('❌ Test 11: Probar validaciones de error');
    
    // Intentar crear sistema sin nombre
    try {
      await createSistemaAcueducto({ descripcion: 'Sistema sin nombre' });
      console.log('❌ ERROR: Se permitió crear sistema sin nombre');
    } catch (error) {
      console.log('✅ Validación funcionando:', error.message);
    }

    // Intentar crear sistema duplicado
    try {
      await createSistemaAcueducto({
        nombre: sistemaActualizado.nombre,
        descripcion: 'Sistema duplicado'
      });
      console.log('❌ ERROR: Se permitió crear sistema duplicado');
    } catch (error) {
      console.log('✅ Validación de unicidad funcionando:', error.message);
    }

    // Intentar obtener sistema inexistente
    try {
      await getSistemaAcueductoById(99999);
      console.log('❌ ERROR: Se encontró sistema inexistente');
    } catch (error) {
      console.log('✅ Validación de existencia funcionando:', error.message);
    }
    console.log('');

    // Test 12: Limpiar datos de prueba
    console.log('🧹 Test 12: Limpiar datos de prueba');
    
    // Eliminar sistema principal
    await deleteSistemaAcueducto(sistemaActualizado.id_sistema_acueducto);
    console.log('✅ Sistema principal eliminado');

    // Eliminar sistemas del bulk
    for (const sistema of resultadoBulk.created) {
      await deleteSistemaAcueducto(sistema.id_sistema_acueducto);
    }
    console.log('✅ Sistemas del bulk eliminados');
    console.log('');

    console.log('🎉 Todos los tests del service layer completados exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas del service:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar las pruebas
testSistemaAcueductoService();
