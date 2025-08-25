import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testDifuntosEndpoints() {
  console.log('🧪 Testing Difuntos Endpoints\n');
  
  try {
    // First, get an auth token
    console.log('1. Getting authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Authentication successful');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test madres difuntas endpoint
    console.log('\n2. Testing madres difuntas endpoint...');
    try {
      const madresResponse = await axios.get(`${BASE_URL}/difuntos/consultas/madres`, { headers });
      console.log('✅ Madres difuntas - Status:', madresResponse.status);
      console.log('📊 Results:', madresResponse.data.data.length, 'records');
      if (madresResponse.data.data.length > 0) {
        console.log('📋 Sample:', JSON.stringify(madresResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Madres difuntas error:', error.response?.data || error.message);
    }
    
    // Test padres difuntos endpoint  
    console.log('\n3. Testing padres difuntos endpoint...');
    try {
      const padresResponse = await axios.get(`${BASE_URL}/difuntos/consultas/padres`, { headers });
      console.log('✅ Padres difuntos - Status:', padresResponse.status);
      console.log('📊 Results:', padresResponse.data.data.length, 'records');
      if (padresResponse.data.data.length > 0) {
        console.log('📋 Sample:', JSON.stringify(padresResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Padres difuntos error:', error.response?.data || error.message);
    }
    
    // Test todos difuntos endpoint
    console.log('\n4. Testing todos difuntos endpoint...');
    try {
      const todosResponse = await axios.get(`${BASE_URL}/difuntos/consultas/todos`, { headers });
      console.log('✅ Todos difuntos - Status:', todosResponse.status);
      console.log('📊 Results:', todosResponse.data.data.length, 'records');
      if (todosResponse.data.data.length > 0) {
        console.log('📋 Sample:', JSON.stringify(todosResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Todos difuntos error:', error.response?.data || error.message);
    }
    
    // Test range query endpoint
    console.log('\n5. Testing range query endpoint...');
    try {
      const rangeResponse = await axios.get(`${BASE_URL}/difuntos/consultas/rango-fechas?fecha_inicio=2019-01-01&fecha_fin=2022-12-31`, { headers });
      console.log('✅ Range query - Status:', rangeResponse.status);
      console.log('📊 Results:', rangeResponse.data.data.length, 'records');
      if (rangeResponse.data.data.length > 0) {
        console.log('📋 Sample:', JSON.stringify(rangeResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Range query error:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDifuntosEndpoints();
