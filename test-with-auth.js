import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function getAuthToken() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    
    console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    const token = response.data.data?.accessToken || response.data.data?.access_token || response.data.data?.token || response.data.accessToken || response.data.token;
    
    if (token) {
      console.log('✅ Token obtenido exitosamente');
      return token;
    } else {
      console.log('❌ No se encontró token en la respuesta');
      return null;
    }
  } catch (error) {
    console.log('❌ Error al obtener token:', error.response?.data || error.message);
    return null;
  }
}

async function testDifuntosWithAuth() {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ No se pudo obtener token de autenticación');
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    console.log('\n📋 Probando endpoints de difuntos con autenticación...');

    // Test 1: Todos los difuntos
    console.log('\n1️⃣ Probando consulta de todos los difuntos...');
    try {
      const response = await axios.get(`${BASE_URL}/difuntos/consultas/todos`, { headers });
      console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Madres difuntas
    console.log('\n2️⃣ Probando consulta de madres difuntas...');
    try {
      const response = await axios.get(`${BASE_URL}/difuntos/consultas/madres`, { headers });
      console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Estadísticas
    console.log('\n3️⃣ Probando estadísticas de difuntos...');
    try {
      const response = await axios.get(`${BASE_URL}/difuntos/estadisticas`, { headers });
      console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 4: Padres difuntos
    console.log('\n4️⃣ Probando consulta de padres difuntos...');
    try {
      const response = await axios.get(`${BASE_URL}/difuntos/consultas/padres`, { headers });
      console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 5: Rango de fechas
    console.log('\n5️⃣ Probando consulta por rango de fechas...');
    try {
      const response = await axios.get(`${BASE_URL}/difuntos/consultas/rango-fechas?fecha_inicio=2020-01-01&fecha_fin=2022-12-31`, { headers });
      console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testDifuntosWithAuth();
