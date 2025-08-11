import axios from 'axios';

/**
 * Script de pruebas para el CRUD de Parentesco
 * Requiere que el servidor esté ejecutándose
 */

const BASE_URL = 'http://localhost:3000/api';
const CATALOG_URL = `${BASE_URL}/catalog/parentescos`;

// Variables para las pruebas
let authToken = '';
let testParentescoId = null;

/**
 * Función para realizar login y obtener token
 */
async function login() {
  try {
    console.log('🔐 Realizando login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@parroquia.com', // Ajusta según tu usuario admin
      password: 'admin123' // Ajusta según tu contraseña
    });
    
    authToken = response.data.data.accessToken;
    console.log('✅ Login exitoso');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Función para realizar peticiones autenticadas
 */
async function makeRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Prueba 1: Obtener estadísticas de parentescos
 */
async function testGetStats() {
  try {
    console.log('\n📊 Prueba 1: Obtener estadísticas...');
    const response = await makeRequest('GET', `${CATALOG_URL}/stats`);
    console.log('✅ Estadísticas obtenidas:', response.data);
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message);
  }
}

/**
 * Prueba 2: Listar todos los parentescos
 */
async function testGetAll() {
  try {
    console.log('\n📋 Prueba 2: Listar todos los parentescos...');
    const response = await makeRequest('GET', CATALOG_URL);
    console.log(`✅ Se obtuvieron ${response.data.parentescos.length} parentescos`);
    
    // Mostrar los primeros 5
    const primeros5 = response.data.parentescos.slice(0, 5);
    primeros5.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.nombre} (ID: ${p.id_parentesco})`);
    });
    
    return response.data.parentescos;
  } catch (error) {
    console.error('❌ Error listando parentescos:', error.message);
    return [];
  }
}

/**
 * Prueba 3: Crear un nuevo parentesco
 */
async function testCreate() {
  try {
    console.log('\n➕ Prueba 3: Crear nuevo parentesco...');
    const nuevoParentesco = {
      nombre: 'Test Parentesco',
      descripcion: 'Parentesco creado para pruebas automáticas'
    };
    
    const response = await makeRequest('POST', CATALOG_URL, nuevoParentesco);
    testParentescoId = response.data.parentesco.id_parentesco;
    console.log(`✅ Parentesco creado con ID: ${testParentescoId}`);
    console.log(`   Nombre: ${response.data.parentesco.nombre}`);
    console.log(`   Descripción: ${response.data.parentesco.descripcion}`);
    
    return response.data.parentesco;
  } catch (error) {
    console.error('❌ Error creando parentesco:', error.message);
    return null;
  }
}

/**
 * Prueba 4: Obtener parentesco por ID
 */
async function testGetById(id) {
  try {
    console.log(`\n🔍 Prueba 4: Obtener parentesco por ID (${id})...`);
    const response = await makeRequest('GET', `${CATALOG_URL}/${id}`);
    console.log('✅ Parentesco obtenido:', response.data.parentesco.nombre);
    return response.data.parentesco;
  } catch (error) {
    console.error('❌ Error obteniendo parentesco por ID:', error.message);
    return null;
  }
}

/**
 * Prueba 5: Actualizar parentesco
 */
async function testUpdate(id) {
  try {
    console.log(`\n✏️  Prueba 5: Actualizar parentesco (${id})...`);
    const datosActualizados = {
      nombre: 'Test Parentesco Actualizado',
      descripcion: 'Descripción actualizada para pruebas'
    };
    
    const response = await makeRequest('PUT', `${CATALOG_URL}/${id}`, datosActualizados);
    console.log('✅ Parentesco actualizado');
    console.log(`   Nuevo nombre: ${response.data.parentesco.nombre}`);
    console.log(`   Nueva descripción: ${response.data.parentesco.descripcion}`);
    
    return response.data.parentesco;
  } catch (error) {
    console.error('❌ Error actualizando parentesco:', error.message);
    return null;
  }
}

/**
 * Prueba 6: Buscar parentescos con filtro
 */
async function testSearch() {
  try {
    console.log('\n🔎 Prueba 6: Buscar parentescos con filtro...');
    const response = await makeRequest('GET', `${CATALOG_URL}?search=Padre`);
    console.log(`✅ Búsqueda completada, encontrados: ${response.data.parentescos.length} resultados`);
    
    response.data.parentescos.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.nombre}`);
    });
  } catch (error) {
    console.error('❌ Error en búsqueda:', error.message);
  }
}

/**
 * Prueba 7: Paginación
 */
async function testPagination() {
  try {
    console.log('\n📄 Prueba 7: Probar paginación...');
    const response = await makeRequest('GET', `${CATALOG_URL}?page=1&limit=5`);
    
    if (response.data.pagination) {
      console.log('✅ Paginación funcionando');
      console.log(`   Página actual: ${response.data.pagination.currentPage}`);
      console.log(`   Total páginas: ${response.data.pagination.totalPages}`);
      console.log(`   Total elementos: ${response.data.pagination.totalItems}`);
      console.log(`   Elementos por página: ${response.data.pagination.itemsPerPage}`);
    } else {
      console.log('ℹ️  Sin paginación (se devolvieron todos los resultados)');
    }
  } catch (error) {
    console.error('❌ Error en paginación:', error.message);
  }
}

/**
 * Prueba 8: Eliminar parentesco (soft delete)
 */
async function testDelete(id) {
  try {
    console.log(`\n🗑️  Prueba 8: Eliminar parentesco (${id})...`);
    const response = await makeRequest('DELETE', `${CATALOG_URL}/${id}`);
    console.log('✅ Parentesco eliminado (soft delete)');
    
    // Verificar que está inactivo
    const parentesco = await testGetById(id);
    if (parentesco && !parentesco.activo) {
      console.log('✅ Confirmado: el parentesco está marcado como inactivo');
    }
  } catch (error) {
    console.error('❌ Error eliminando parentesco:', error.message);
  }
}

/**
 * Prueba 9: Restaurar parentesco
 */
async function testRestore(id) {
  try {
    console.log(`\n🔄 Prueba 9: Restaurar parentesco (${id})...`);
    const response = await makeRequest('PATCH', `${CATALOG_URL}/${id}/restore`);
    console.log('✅ Parentesco restaurado');
    
    // Verificar que está activo de nuevo
    const parentesco = await testGetById(id);
    if (parentesco && parentesco.activo) {
      console.log('✅ Confirmado: el parentesco está activo nuevamente');
    }
  } catch (error) {
    console.error('❌ Error restaurando parentesco:', error.message);
  }
}

/**
 * Prueba 10: Eliminar permanentemente para limpiar
 */
async function testFinalCleanup(id) {
  try {
    console.log(`\n🧹 Prueba 10: Eliminación final para limpiar (${id})...`);
    await makeRequest('DELETE', `${CATALOG_URL}/${id}`);
    console.log('✅ Parentesco de prueba eliminado para limpiar');
  } catch (error) {
    console.error('❌ Error en limpieza final:', error.message);
  }
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL CRUD DE PARENTESCO');
  console.log('='.repeat(50));
  
  // Login primero
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ No se pudo realizar login. Verifica las credenciales.');
    return;
  }
  
  try {
    // Ejecutar todas las pruebas en orden
    await testGetStats();
    const parentescos = await testGetAll();
    const nuevoParentesco = await testCreate();
    
    if (nuevoParentesco && testParentescoId) {
      await testGetById(testParentescoId);
      await testUpdate(testParentescoId);
      await testSearch();
      await testPagination();
      await testDelete(testParentescoId);
      await testRestore(testParentescoId);
      await testFinalCleanup(testParentescoId);
    }
    
    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Verificar si se está ejecutando directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
