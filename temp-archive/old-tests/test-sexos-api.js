import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testSexosEndpoint() {
  try {
    console.log('🔍 Testing sexos endpoint...');

    // First, try to login to get a token
    console.log('🔐 Attempting to login...');
    
    // Try with a test user (you may need to adjust credentials)
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

    console.log('📊 Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('🔑 Login Response:', loginData);

    if (loginResponse.ok && loginData.data && loginData.data.accessToken) {
      // Now test the sexos endpoint with the token
      console.log('✅ Login successful, testing sexos endpoint...');
      
      const sexosResponse = await fetch(`${API_BASE}/catalog/sexos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📊 Sexos Status:', sexosResponse.status);
      const sexosData = await sexosResponse.json();
      console.log('📄 Sexos Response:', JSON.stringify(sexosData, null, 2));

    } else {
      console.log('❌ Login failed, trying without authentication...');
      
      // Try without authentication to see the error
      const sexosResponse = await fetch(`${API_BASE}/catalog/sexos`);
      console.log('📊 Sexos Status (no auth):', sexosResponse.status);
      const sexosData = await sexosResponse.json();
      console.log('📄 Sexos Response (no auth):', JSON.stringify(sexosData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSexosEndpoint();
