import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'admin@parroquia.com';
const PASSWORD = 'Admin123!';

let authToken = null;

// Función para login
async function login() {
  console.log('🔐 Intentando autenticación...');
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo_electronico: EMAIL, contrasena: PASSWORD })
  });

  const data = await response.json();
  if (response.ok && (data.accessToken || data.data?.accessToken)) {
    authToken = data.accessToken || data.data.accessToken;
    console.log('✅ Autenticación exitosa\n');
    return true;
  } else {
    console.error('❌ Error en autenticación:', data);
    return false;
  }
}

// Función para obtener todos los centros poblados
async function getCentrosPoblados() {
  console.log('📋 Obteniendo todos los centros poblados...');
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función para crear un centro poblado
async function createCentroPoblado(nombre, id_municipio = null) {
  console.log(`➕ Creando centro poblado: ${nombre}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, id_municipio_municipios: id_municipio })
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función para obtener un centro poblado por ID
async function getCentroPobladoById(id) {
  console.log(`🔍 Obteniendo centro poblado con ID ${id}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados/${id}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función para actualizar un centro poblado
async function updateCentroPoblado(id, nombre) {
  console.log(`✏️ Actualizando centro poblado ID ${id}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre })
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función para obtener estadísticas
async function getEstadisticas() {
  console.log('📊 Obteniendo estadísticas...');
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados/statistics`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función para eliminar un centro poblado
async function deleteCentroPoblado(id) {
  console.log(`🗑️ Eliminando centro poblado ID ${id}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  console.log('');
  return data;
}

// Función principal para probar todo el CRUD
async function testCRUD() {
  console.log('='.repeat(60));
  console.log('🧪 PRUEBAS COMPLETAS DE CRUD - CENTROS POBLADOS');
  console.log('='.repeat(60));
  console.log('');

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ No se pudo autenticar. Abortando pruebas.');
    return;
  }

  try {
    // 2. Listar centros poblados (debe estar vacío inicialmente)
    console.log('--- PASO 1: Listar centros poblados iniciales ---');
    await getCentrosPoblados();

    // 3. Crear primer centro poblado
    console.log('--- PASO 2: Crear primer centro poblado ---');
    const created1 = await createCentroPoblado('Centro Poblado San Pedro', 1);
    const id1 = created1.data?.id_centro_poblado;

    // 4. Crear segundo centro poblado sin municipio
    console.log('--- PASO 3: Crear segundo centro poblado (sin municipio) ---');
    const created2 = await createCentroPoblado('Centro Poblado La Esperanza');
    const id2 = created2.data?.id_centro_poblado;

    // 5. Listar todos de nuevo
    console.log('--- PASO 4: Listar todos los centros poblados ---');
    await getCentrosPoblados();

    // 6. Obtener uno por ID
    if (id1) {
      console.log('--- PASO 5: Obtener centro poblado por ID ---');
      await getCentroPobladoById(id1);
    }

    // 7. Actualizar
    if (id1) {
      console.log('--- PASO 6: Actualizar centro poblado ---');
      await updateCentroPoblado(id1, 'Centro Poblado San Pedro Actualizado');
    }

    // 8. Obtener estadísticas
    console.log('--- PASO 7: Obtener estadísticas ---');
    await getEstadisticas();

    // 9. Verificar actualización
    if (id1) {
      console.log('--- PASO 8: Verificar actualización ---');
      await getCentroPobladoById(id1);
    }

    // 10. Eliminar
    if (id2) {
      console.log('--- PASO 9: Eliminar centro poblado ---');
      await deleteCentroPoblado(id2);
    }

    // 11. Listar final
    console.log('--- PASO 10: Listar centros poblados finales ---');
    await getCentrosPoblados();

    console.log('='.repeat(60));
    console.log('✅ PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar pruebas
testCRUD().catch(console.error);
