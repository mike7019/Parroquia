import parroquiaService from './src/services/catalog/parroquiaService.js';

class ParroquiaServiceTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n🧪 Ejecutando: ${testName}`);
    
    try {
      const result = await testFunction();
      this.passedTests++;
      this.testResults.push({ name: testName, status: '✅ PASSED', result });
      console.log(`✅ ${testName} - PASSED`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: '❌ FAILED', error: error.message });
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      throw error;
    }
  }

  async testGetAllParroquias() {
    return await this.runTest('getAllParroquias', async () => {
      const result = await parroquiaService.getAllParroquias();
      
      if (result.status !== 'success') {
        throw new Error(`Expected status 'success', got '${result.status}'`);
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Expected data to be an array');
      }
      
      if (result.total !== result.data.length) {
        throw new Error(`Total count mismatch: ${result.total} vs ${result.data.length}`);
      }
      
      console.log(`   📊 Found ${result.total} parroquias`);
      if (result.data.length > 0) {
        console.log(`   📋 First parroquia: ${result.data[0].nombre}`);
      }
      
      return result;
    });
  }

  async testGetParroquiaById() {
    return await this.runTest('getParroquiaById', async () => {
      // First get all parroquias to get a valid ID
      const allParroquias = await parroquiaService.getAllParroquias();
      if (allParroquias.data.length === 0) {
        throw new Error('No parroquias found to test with');
      }
      
      const testId = allParroquias.data[0].id_parroquia;
      const result = await parroquiaService.getParroquiaById(testId);
      
      if (!result) {
        throw new Error('No parroquia returned');
      }
      
      if (result.id_parroquia !== testId) {
        throw new Error(`ID mismatch: expected ${testId}, got ${result.id_parroquia}`);
      }
      
      console.log(`   📋 Retrieved parroquia: ${result.nombre} (ID: ${result.id_parroquia})`);
      if (result.municipio) {
        console.log(`   🏛️  Associated municipio: ${result.municipio.nombre_municipio}`);
      }
      
      return result;
    });
  }

  async testGetParroquiaByInvalidId() {
    return await this.runTest('getParroquiaById - Invalid ID', async () => {
      try {
        await parroquiaService.getParroquiaById(99999);
        throw new Error('Should have thrown an error for invalid ID');
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('   ✅ Correctly threw error for invalid ID');
          return { message: 'Error handling working correctly' };
        }
        throw error;
      }
    });
  }

  async testGetParroquiaStatistics() {
    return await this.runTest('getParroquiaStatistics', async () => {
      const result = await parroquiaService.getParroquiaStatistics();
      
      if (typeof result.totalParroquias !== 'number') {
        throw new Error('totalParroquias should be a number');
      }
      
      if (result.totalParroquias < 0) {
        throw new Error('totalParroquias should be non-negative');
      }
      
      console.log(`   📊 Total parroquias in statistics: ${result.totalParroquias}`);
      
      return result;
    });
  }

  async testSearchParroquias() {
    return await this.runTest('searchParroquias', async () => {
      const searchTerm = 'San';
      const results = await parroquiaService.searchParroquias(searchTerm);
      
      if (!Array.isArray(results)) {
        throw new Error('Search results should be an array');
      }
      
      // Check that results contain the search term
      for (const parroquia of results) {
        if (!parroquia.nombre.toLowerCase().includes(searchTerm.toLowerCase())) {
          throw new Error(`Search result "${parroquia.nombre}" doesn't contain "${searchTerm}"`);
        }
      }
      
      console.log(`   🔍 Search for "${searchTerm}" returned ${results.length} results`);
      if (results.length > 0) {
        console.log(`   📋 First result: ${results[0].nombre}`);
      }
      
      return results;
    });
  }

  async testGetParroquiasByMunicipio() {
    return await this.runTest('getParroquiasByMunicipio', async () => {
      // First get a parroquia to find its municipio
      const allParroquias = await parroquiaService.getAllParroquias();
      if (allParroquias.data.length === 0) {
        throw new Error('No parroquias found to test with');
      }
      
      const testMunicipioId = allParroquias.data[0].id_municipio;
      const results = await parroquiaService.getParroquiasByMunicipio(testMunicipioId);
      
      if (!Array.isArray(results)) {
        throw new Error('Results should be an array');
      }
      
      // Check that all results belong to the specified municipio
      for (const parroquia of results) {
        if (parroquia.id_municipio !== testMunicipioId) {
          throw new Error(`Parroquia ${parroquia.nombre} belongs to municipio ${parroquia.id_municipio}, not ${testMunicipioId}`);
        }
      }
      
      console.log(`   🏛️  Found ${results.length} parroquias in municipio ${testMunicipioId}`);
      
      return results;
    });
  }

  async testCreateParroquia() {
    return await this.runTest('createParroquia', async () => {
      // Get a valid municipio ID first
      const allParroquias = await parroquiaService.getAllParroquias();
      if (allParroquias.data.length === 0) {
        throw new Error('No parroquias found to get municipio reference');
      }
      
      const validMunicipioId = allParroquias.data[0].id_municipio;
      
      const testData = {
        nombre: `Test Parroquia ${Date.now()}`,
        id_municipio: validMunicipioId
      };
      
      const result = await parroquiaService.createParroquia(testData);
      
      if (!result) {
        throw new Error('No parroquia returned from create');
      }
      
      if (result.nombre !== testData.nombre) {
        throw new Error(`Name mismatch: expected ${testData.nombre}, got ${result.nombre}`);
      }
      
      if (result.id_municipio !== testData.id_municipio) {
        throw new Error(`Municipio mismatch: expected ${testData.id_municipio}, got ${result.id_municipio}`);
      }
      
      console.log(`   ✅ Created parroquia: ${result.nombre} (ID: ${result.id_parroquia})`);
      
      // Store for cleanup
      this.createdParroquiaId = result.id_parroquia;
      
      return result;
    });
  }

  async testUpdateParroquia() {
    return await this.runTest('updateParroquia', async () => {
      if (!this.createdParroquiaId) {
        throw new Error('No parroquia created to update');
      }
      
      const updateData = {
        nombre: `Updated Test Parroquia ${Date.now()}`
      };
      
      const result = await parroquiaService.updateParroquia(this.createdParroquiaId, updateData);
      
      if (!result) {
        throw new Error('No parroquia returned from update');
      }
      
      if (result.nombre !== updateData.nombre) {
        throw new Error(`Name not updated: expected ${updateData.nombre}, got ${result.nombre}`);
      }
      
      console.log(`   ✅ Updated parroquia: ${result.nombre} (ID: ${result.id_parroquia})`);
      
      return result;
    });
  }

  async testDeleteParroquia() {
    return await this.runTest('deleteParroquia', async () => {
      if (!this.createdParroquiaId) {
        throw new Error('No parroquia created to delete');
      }
      
      const result = await parroquiaService.deleteParroquia(this.createdParroquiaId);
      
      if (!result.message) {
        throw new Error('No confirmation message returned');
      }
      
      console.log(`   ✅ Deleted parroquia (ID: ${this.createdParroquiaId})`);
      console.log(`   📝 Message: ${result.message}`);
      
      // Try to get the deleted parroquia (should fail)
      try {
        await parroquiaService.getParroquiaById(this.createdParroquiaId);
        throw new Error('Parroquia should not exist after deletion');
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('   ✅ Confirmed parroquia was deleted');
        } else {
          throw error;
        }
      }
      
      return result;
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} - ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 All tests passed! Parroquia service is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Parroquia Service Tests');
    console.log('='.repeat(60));
    
    try {
      // Read-only tests
      await this.testGetAllParroquias();
      await this.testGetParroquiaById();
      await this.testGetParroquiaByInvalidId();
      await this.testGetParroquiaStatistics();
      await this.testSearchParroquias();
      await this.testGetParroquiasByMunicipio();
      
      // Write tests
      await this.testCreateParroquia();
      await this.testUpdateParroquia();
      await this.testDeleteParroquia();
      
    } catch (error) {
      console.log(`\n⚠️  Test sequence interrupted: ${error.message}`);
    }
    
    this.printSummary();
  }
}

// Run tests
async function main() {
  const tester = new ParroquiaServiceTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);
