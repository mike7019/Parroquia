import { Municipios, Departamentos } from './src/models/catalog/index.js';

class MunicipioTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api/catalog/municipios';
  }

  async makeRequest(method, url, data = null) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();
      
      return {
        status: response.status,
        data: result
      };
    } catch (error) {
      return {
        status: 500,
        error: error.message
      };
    }
  }

  async testDatabaseModels() {
    console.log('\n🔍 1. TESTING DATABASE MODELS AND RELATIONSHIPS');
    console.log('=' .repeat(60));

    try {
      // Test Departamentos model
      console.log('\n📋 Testing Departamentos model:');
      const departamentos = await Departamentos.findAll({ limit: 3 });
      console.log(`✅ Found ${departamentos.length} departamentos`);
      departamentos.forEach(d => {
        console.log(`   - ID: ${d.id_departamento}, ${d.nombre} (${d.codigo_dane})`);
      });

      // Test Municipios model
      console.log('\n📋 Testing Municipios model:');
      const municipios = await Municipios.findAll({ 
        limit: 3,
        include: [{
          association: 'departamento',
          attributes: ['id_departamento', 'nombre', 'codigo_dane']
        }]
      });
      console.log(`✅ Found ${municipios.length} municipios`);
      municipios.forEach(m => {
        console.log(`   - ID: ${m.id_municipio}, ${m.nombre_municipio} (${m.codigo_dane})`);
        if (m.departamento) {
          console.log(`     Departamento: ${m.departamento.nombre}`);
        }
      });

      // Test relationship integrity
      console.log('\n🔗 Testing relationship integrity:');
      const municipioWithDept = await Municipios.findOne({
        include: [{
          association: 'departamento',
          required: true
        }]
      });

      if (municipioWithDept) {
        console.log(`✅ Relationship working: ${municipioWithDept.nombre_municipio} -> ${municipioWithDept.departamento.nombre}`);
      } else {
        console.log('⚠️  No municipios with valid departamento relationship found');
      }

    } catch (error) {
      console.error('❌ Database model test failed:', error.message);
    }
  }

  async testCRUD() {
    console.log('\n🧪 2. TESTING FULL CRUD OPERATIONS');
    console.log('=' .repeat(60));

    let testMunicipioId = null;
    const testData = {
      nombre_municipio: 'Test Municipio CRUD',
      codigo_dane: '99999',
      id_departamento: 1
    };

    // CREATE
    console.log('\n🔸 Testing CREATE (POST /)');
    const createResult = await this.makeRequest('POST', this.baseUrl, testData);
    console.log(`Status: ${createResult.status}`);
    if (createResult.status === 201) {
      console.log('✅ CREATE successful');
      console.log('Response:', JSON.stringify(createResult.data, null, 2));
    } else {
      console.log('❌ CREATE failed');
      console.log('Error:', JSON.stringify(createResult.data, null, 2));
    }

    // READ ALL
    console.log('\n🔸 Testing READ ALL (GET /)');
    const readAllResult = await this.makeRequest('GET', this.baseUrl);
    console.log(`Status: ${readAllResult.status}`);
    if (readAllResult.status === 200) {
      console.log('✅ READ ALL successful');
      const municipios = readAllResult.data.data.municipios;
      console.log(`Found ${municipios.length} municipios`);
      
      // Find our test municipio
      const testMunicipio = municipios.find(m => m.codigo_dane === testData.codigo_dane);
      if (testMunicipio) {
        testMunicipioId = testMunicipio.id_municipio;
        console.log(`📍 Found test municipio with ID: ${testMunicipioId}`);
      }
    } else {
      console.log('❌ READ ALL failed');
      console.log('Error:', JSON.stringify(readAllResult.data, null, 2));
    }

    if (!testMunicipioId) {
      console.log('⚠️  Cannot continue with UPDATE/DELETE tests - no test municipio ID');
      return;
    }

    // READ BY ID
    console.log('\n🔸 Testing READ BY ID (GET /:id)');
    const readByIdResult = await this.makeRequest('GET', `${this.baseUrl}/${testMunicipioId}`);
    console.log(`Status: ${readByIdResult.status}`);
    if (readByIdResult.status === 200) {
      console.log('✅ READ BY ID successful');
      console.log('Municipio data:', JSON.stringify(readByIdResult.data.data, null, 2));
    } else {
      console.log('❌ READ BY ID failed');
      console.log('Error:', JSON.stringify(readByIdResult.data, null, 2));
    }

    // UPDATE
    console.log('\n🔸 Testing UPDATE (PUT /:id)');
    const updateData = {
      nombre_municipio: 'Test Municipio CRUD UPDATED'
    };
    const updateResult = await this.makeRequest('PUT', `${this.baseUrl}/${testMunicipioId}`, updateData);
    console.log(`Status: ${updateResult.status}`);
    if (updateResult.status === 200) {
      console.log('✅ UPDATE successful');
      console.log('Updated data:', JSON.stringify(updateResult.data.data, null, 2));
    } else {
      console.log('❌ UPDATE failed');
      console.log('Error:', JSON.stringify(updateResult.data, null, 2));
    }

    // DELETE
    console.log('\n🔸 Testing DELETE (DELETE /:id)');
    const deleteResult = await this.makeRequest('DELETE', `${this.baseUrl}/${testMunicipioId}`);
    console.log(`Status: ${deleteResult.status}`);
    if (deleteResult.status === 200) {
      console.log('✅ DELETE successful');
      console.log('Response:', JSON.stringify(deleteResult.data, null, 2));
    } else {
      console.log('❌ DELETE failed');
      console.log('Error:', JSON.stringify(deleteResult.data, null, 2));
    }

    // Verify deletion
    console.log('\n🔸 Verifying deletion (GET /:id after delete)');
    const verifyDeleteResult = await this.makeRequest('GET', `${this.baseUrl}/${testMunicipioId}`);
    console.log(`Status: ${verifyDeleteResult.status}`);
    if (verifyDeleteResult.status === 404) {
      console.log('✅ DELETE verified - municipio not found (expected)');
    } else {
      console.log('⚠️  DELETE verification issue - municipio still exists or unexpected error');
      console.log('Response:', JSON.stringify(verifyDeleteResult.data, null, 2));
    }
  }

  async testSpecialEndpoints() {
    console.log('\n🎯 3. TESTING SPECIAL ENDPOINTS');
    console.log('=' .repeat(60));

    // Test departamentos endpoint
    console.log('\n🔸 Testing GET /departamentos');
    const deptResult = await this.makeRequest('GET', `${this.baseUrl}/departamentos`);
    console.log(`Status: ${deptResult.status}`);
    if (deptResult.status === 200) {
      console.log('✅ GET /departamentos successful');
      console.log(`Found ${deptResult.data.data.length} departamentos`);
      deptResult.data.data.slice(0, 3).forEach(d => {
        console.log(`   - ${d.nombre} (ID: ${d.id_departamento}, Código: ${d.codigo_dane})`);
      });
    } else {
      console.log('❌ GET /departamentos failed');
    }

    // Test get by codigo DANE
    console.log('\n🔸 Testing GET /codigo-dane/:codigo_dane');
    const codeDaneResult = await this.makeRequest('GET', `${this.baseUrl}/codigo-dane/05001`);
    console.log(`Status: ${codeDaneResult.status}`);
    if (codeDaneResult.status === 200) {
      console.log('✅ GET /codigo-dane successful');
      console.log('Found municipio:', codeDaneResult.data.data.nombre_municipio);
    } else {
      console.log('❌ GET /codigo-dane failed or not found');
    }

    // Test get by departamento
    console.log('\n🔸 Testing GET /departamento/:id_departamento');
    const byDeptResult = await this.makeRequest('GET', `${this.baseUrl}/departamento/1`);
    console.log(`Status: ${byDeptResult.status}`);
    if (byDeptResult.status === 200) {
      console.log('✅ GET /departamento successful');
      console.log(`Found ${byDeptResult.data.data.municipios.length} municipios in departamento 1`);
    } else {
      console.log('❌ GET /departamento failed');
    }

    // Test search by codigo DANE pattern
    console.log('\n🔸 Testing GET /search/codigo-dane/:pattern');
    const searchResult = await this.makeRequest('GET', `${this.baseUrl}/search/codigo-dane/05`);
    console.log(`Status: ${searchResult.status}`);
    if (searchResult.status === 200) {
      console.log('✅ GET /search/codigo-dane successful');
      console.log(`Found ${searchResult.data.data.municipios.length} municipios with pattern "05"`);
    } else {
      console.log('❌ GET /search/codigo-dane failed');
    }
  }

  async testValidations() {
    console.log('\n✅ 4. TESTING VALIDATIONS AND ERROR HANDLING');
    console.log('=' .repeat(60));

    // Test invalid departamento
    console.log('\n🔸 Testing invalid departamento ID');
    const invalidDeptData = {
      nombre_municipio: 'Test Invalid Dept',
      codigo_dane: '88888',
      id_departamento: 99999
    };
    const invalidDeptResult = await this.makeRequest('POST', this.baseUrl, invalidDeptData);
    console.log(`Status: ${invalidDeptResult.status}`);
    if (invalidDeptResult.status === 500 && invalidDeptResult.data.error.details.includes('does not exist')) {
      console.log('✅ Invalid departamento validation working correctly');
      console.log('Error message:', invalidDeptResult.data.error.details);
    } else {
      console.log('⚠️  Invalid departamento validation not working as expected');
      console.log('Response:', JSON.stringify(invalidDeptResult.data, null, 2));
    }

    // Test missing required fields
    console.log('\n🔸 Testing missing required fields');
    const missingFieldsData = {
      nombre_municipio: 'Test Missing Fields'
      // Missing codigo_dane and id_departamento
    };
    const missingFieldsResult = await this.makeRequest('POST', this.baseUrl, missingFieldsData);
    console.log(`Status: ${missingFieldsResult.status}`);
    if (missingFieldsResult.status === 400) {
      console.log('✅ Missing required fields validation working correctly');
      console.log('Error message:', missingFieldsResult.data.error.message);
    } else {
      console.log('⚠️  Missing required fields validation not working as expected');
      console.log('Response:', JSON.stringify(missingFieldsResult.data, null, 2));
    }

    // Test duplicate codigo DANE
    console.log('\n🔸 Testing duplicate codigo DANE');
    const duplicateData = {
      nombre_municipio: 'Test Duplicate',
      codigo_dane: '05001', // Likely exists (Medellín)
      id_departamento: 1
    };
    const duplicateResult = await this.makeRequest('POST', this.baseUrl, duplicateData);
    console.log(`Status: ${duplicateResult.status}`);
    if (duplicateResult.status === 409) {
      console.log('✅ Duplicate validation working correctly');
      console.log('Error message:', duplicateResult.data.error.message);
    } else {
      console.log('⚠️  Duplicate validation response:', JSON.stringify(duplicateResult.data, null, 2));
    }
  }

  async runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE MUNICIPIO API TEST SUITE');
    console.log('=' .repeat(70));

    try {
      await this.testDatabaseModels();
      await this.testCRUD();
      await this.testSpecialEndpoints();
      await this.testValidations();

      console.log('\n🎉 TEST SUITE COMPLETED');
      console.log('=' .repeat(70));
      console.log('Check the results above for any failures or issues.');
      
    } catch (error) {
      console.error('\n💥 TEST SUITE FAILED:', error.message);
      console.error('Stack trace:', error.stack);
    }

    process.exit(0);
  }
}

// Add fetch polyfill for Node.js
global.fetch = (await import('node-fetch')).default;

// Run the test suite
const testSuite = new MunicipioTestSuite();
testSuite.runAllTests();
