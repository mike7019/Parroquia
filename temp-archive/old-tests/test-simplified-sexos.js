import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testSimplifiedSexosEndpoints() {
  try {
    console.log('🔍 Testing simplified sexos endpoints...');

    // First, login to get a token
    console.log('🔐 Logging in...');
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo_electronico: 'dieg45475105@yopmail.com',
        contrasena: 'Fuerte789&'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Login successful');

    // Test GET /api/catalog/sexos
    console.log('\n📋 Testing GET /api/catalog/sexos...');
    const getSexosResponse = await fetch(`${API_BASE}/catalog/sexos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`Status: ${getSexosResponse.status}`);
    if (getSexosResponse.ok) {
      const getSexosData = await getSexosResponse.json();
      console.log(`✅ GET endpoint works - found ${getSexosData.data.sexos.length} sexos`);
      console.log('Sample sexo:', getSexosData.data.sexos[0]);
    } else {
      const errorData = await getSexosResponse.json();
      console.log('❌ GET endpoint failed:', errorData);
    }

    // Test POST /api/catalog/sexos
    console.log('\n📝 Testing POST /api/catalog/sexos...');
    const postSexoResponse = await fetch(`${API_BASE}/catalog/sexos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sexo: 'Test Sexo ' + Date.now()
      })
    });

    console.log(`Status: ${postSexoResponse.status}`);
    const postSexoData = await postSexoResponse.json();
    if (postSexoResponse.ok) {
      console.log('✅ POST endpoint works');
    } else {
      console.log('ℹ️ POST response:', postSexoData.message);
    }

    // Test that removed endpoints return 404
    console.log('\n🚫 Testing removed endpoints return 404...');
    
    const removedEndpoints = [
      '/catalog/sexos/bulk',
      '/catalog/sexos/select', 
      '/catalog/sexos/search',
      '/catalog/sexos/statistics',
      '/catalog/sexos/name/test',
      '/catalog/sexos/1',
      '/catalog/sexos/1/details'
    ];

    for (const endpoint of removedEndpoints) {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 404) {
        console.log(`✅ ${endpoint} correctly returns 404`);
      } else {
        console.log(`⚠️ ${endpoint} returns ${response.status} (expected 404)`);
      }
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimplifiedSexosEndpoints();
