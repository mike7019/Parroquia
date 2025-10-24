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

// Función para obtener sectores por municipio
async function getSectoresByMunicipio(id_municipio) {
  console.log(`\n📍 Obteniendo sectores del municipio ${id_municipio}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/sectors/municipio/${id_municipio}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  return data;
}

// Función para obtener corregimientos por municipio
async function getCorregimientosByMunicipio(id_municipio) {
  console.log(`\n🏘️ Obteniendo corregimientos del municipio ${id_municipio}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/corregimientos/municipio/${id_municipio}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  return data;
}

// Función para obtener centros poblados por municipio (endpoint dedicado)
async function getCentrosPobladosByMunicipio(id_municipio) {
  console.log(`\n🏙️ Obteniendo centros poblados del municipio ${id_municipio}...`);
  const response = await fetch(`${BASE_URL}/api/catalog/centros-poblados/municipio/${id_municipio}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Respuesta:', JSON.stringify(data, null, 2));
  return data;
}

// Función principal para probar todo
async function testEndpoints() {
  console.log('='.repeat(70));
  console.log('🧪 PRUEBAS DE ENDPOINTS POR MUNICIPIO');
  console.log('='.repeat(70));

  // 1. Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ No se pudo autenticar. Abortando pruebas.');
    return;
  }

  try {
    // Probar con municipio 1 (Abejorral según las pruebas anteriores)
    const id_municipio = 1;

    console.log('\n' + '='.repeat(70));
    console.log(`📊 PRUEBAS CON MUNICIPIO ID: ${id_municipio}`);
    console.log('='.repeat(70));

    // 2. Sectores por municipio
    await getSectoresByMunicipio(id_municipio);

    // 3. Corregimientos por municipio
    await getCorregimientosByMunicipio(id_municipio);

    // 4. Centros poblados por municipio
    await getCentrosPobladosByMunicipio(id_municipio);

    // Probar con un municipio que probablemente no tenga datos
    console.log('\n' + '='.repeat(70));
    console.log('📊 PRUEBAS CON MUNICIPIO SIN DATOS (ID: 999)');
    console.log('='.repeat(70));

    await getSectoresByMunicipio(999);
    await getCorregimientosByMunicipio(999);
    await getCentrosPobladosByMunicipio(999);

    console.log('\n' + '='.repeat(70));
    console.log('✅ PRUEBAS COMPLETADAS');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar pruebas
testEndpoints().catch(console.error);
