import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

class EnfermedadTestClient {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async testCreateEnfermedad() {
    console.log('\n🧪 Testing CREATE enfermedad...');
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        nombre: 'Diabetes tipo 2',
        descripcion: 'Trastorno metabólico caracterizado por altos niveles de glucosa en sangre'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 201) {
      console.log('✅ CREATE test passed');
      return data.data.id_enfermedad;
    } else {
      console.log('❌ CREATE test failed');
      return null;
    }
  }

  async testGetAllEnfermedades() {
    console.log('\n🧪 Testing GET ALL enfermedades...');
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades?page=1&limit=5&search=diabetes`, {
      method: 'GET',
      headers: this.headers
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ GET ALL test passed');
      return true;
    } else {
      console.log('❌ GET ALL test failed');
      return false;
    }
  }

  async testGetEnfermedadById(id) {
    console.log(`\n🧪 Testing GET enfermedad by ID: ${id}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades/${id}`, {
      method: 'GET',
      headers: this.headers
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ GET BY ID test passed');
      return true;
    } else {
      console.log('❌ GET BY ID test failed');
      return false;
    }
  }

  async testUpdateEnfermedad(id) {
    console.log(`\n🧪 Testing UPDATE enfermedad ID: ${id}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        nombre: 'Diabetes tipo 2 - Actualizada',
        descripcion: 'Descripción actualizada del trastorno metabólico'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ UPDATE test passed');
      return true;
    } else {
      console.log('❌ UPDATE test failed');
      return false;
    }
  }

  async testDuplicateEnfermedad() {
    console.log('\n🧪 Testing DUPLICATE prevention...');
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        nombre: 'Diabetes tipo 2 - Actualizada',
        descripcion: 'Intento de duplicado'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 409) {
      console.log('✅ DUPLICATE prevention test passed');
      return true;
    } else {
      console.log('❌ DUPLICATE prevention test failed');
      return false;
    }
  }

  async testDeleteEnfermedad(id) {
    console.log(`\n🧪 Testing DELETE enfermedad ID: ${id}...`);
    
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades/${id}`, {
      method: 'DELETE',
      headers: this.headers
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ DELETE test passed');
      return true;
    } else {
      console.log('❌ DELETE test failed');
      return false;
    }
  }

  async testValidationErrors() {
    console.log('\n🧪 Testing VALIDATION errors...');
    
    // Test missing nombre
    const response = await fetch(`${API_BASE_URL}/api/catalog/enfermedades`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        descripcion: 'Solo descripción sin nombre'
      })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400) {
      console.log('✅ VALIDATION test passed');
      return true;
    } else {
      console.log('❌ VALIDATION test failed');
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Enfermedad CRUD API Tests...');
    console.log(`🌐 API Base URL: ${API_BASE_URL}`);
    
    try {
      // Test validation first
      await this.testValidationErrors();
      
      // Test CRUD operations
      const enfermedadId = await this.testCreateEnfermedad();
      
      if (enfermedadId) {
        await this.testGetAllEnfermedades();
        await this.testGetEnfermedadById(enfermedadId);
        await this.testUpdateEnfermedad(enfermedadId);
        await this.testDuplicateEnfermedad();
        await this.testDeleteEnfermedad(enfermedadId);
      }
      
      console.log('\n✅ All Enfermedad CRUD tests completed!');
      
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
    }
  }
}

// Test runner function
async function testEnfermedadAPI() {
  // You'll need to provide a valid JWT token
  const token = process.env.TEST_TOKEN || 'your-jwt-token-here';
  
  if (token === 'your-jwt-token-here') {
    console.log('⚠️  Please set a valid JWT token in the TEST_TOKEN environment variable');
    console.log('   You can get one by logging into the API first');
    return;
  }
  
  const testClient = new EnfermedadTestClient(token);
  await testClient.runAllTests();
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnfermedadAPI();
}

export { EnfermedadTestClient, testEnfermedadAPI };
