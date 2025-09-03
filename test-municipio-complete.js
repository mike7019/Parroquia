import municipioService from './src/services/catalog/municipioService.js';

class MunicipioServiceTester {
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

  async testGetAllMunicipios() {
    return await this.runTest('getAllMunicipios', async () => {
      const result = await municipioService.getAllMunicipios();
      
      if (result.status !== 'success') {
        throw new Error(`Expected status 'success', got '${result.status}'`);
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Expected data to be an array');
      }
      
      if (result.total !== result.data.length) {
        throw new Error(`Total count mismatch: ${result.total} vs ${result.data.length}`);
      }
      
      console.log(`   📊 Found ${result.total} municipios`);
      if (result.data.length > 0) {
        console.log(`   📋 First municipio: ${result.data[0].nombre_municipio} (${result.data[0].codigo_dane})`);
        if (result.data[0].departamento) {
          console.log(`   🏛️  Departamento: ${result.data[0].departamento.nombre}`);
        }
      }
      
      return result;
    });
  }

  async testGetAllMunicipiosWithFilters() {
    return await this.runTest('getAllMunicipios with Filters', async () => {
      // Test with search filter
      const searchResult = await municipioService.getAllMunicipios({ search: 'Bogotá' });
      
      if (searchResult.status !== 'success') {
        throw new Error(`Search failed: ${searchResult.message}`);
      }
      
      console.log(`   🔍 Search for 'Bogotá' returned ${searchResult.total} results`);
      
      // Test with departamento filter (get first municipio's departamento)
      const allMunicipios = await municipioService.getAllMunicipios();
      if (allMunicipios.data.length > 0) {
        const departamentoId = allMunicipios.data[0].id_departamento;
        const deptResult = await municipioService.getAllMunicipios({ id_departamento: departamentoId });
        
        if (deptResult.status !== 'success') {
          throw new Error(`Departamento filter failed: ${deptResult.message}`);
        }
        
        console.log(`   🏛️  Filter by departamento ${departamentoId} returned ${deptResult.total} results`);
        
        // Verify all results belong to the same departamento
        for (const municipio of deptResult.data) {
          if (municipio.id_departamento !== departamentoId) {
            throw new Error(`Municipio ${municipio.nombre_municipio} belongs to different departamento`);
          }
        }
      }
      
      return { searchResult, allMunicipios };
    });
  }

  async testGetMunicipioById() {
    return await this.runTest('getMunicipioById', async () => {
      // First get all municipios to get a valid ID
      const allMunicipios = await municipioService.getAllMunicipios();
      if (allMunicipios.data.length === 0) {
        throw new Error('No municipios found to test with');
      }
      
      const testId = allMunicipios.data[0].id_municipio;
      const result = await municipioService.getMunicipioById(testId);
      
      if (!result) {
        throw new Error('No municipio returned');
      }
      
      if (result.id_municipio !== testId) {
        throw new Error(`ID mismatch: expected ${testId}, got ${result.id_municipio}`);
      }
      
      console.log(`   📋 Retrieved municipio: ${result.nombre_municipio} (ID: ${result.id_municipio})`);
      console.log(`   🏷️  Código DANE: ${result.codigo_dane}`);
      if (result.departamento) {
        console.log(`   🏛️  Departamento: ${result.departamento.nombre}`);
      }
      
      return result;
    });
  }

  async testGetMunicipioByInvalidId() {
    return await this.runTest('getMunicipioById - Invalid ID', async () => {
      try {
        await municipioService.getMunicipioById(99999);
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

  async testGetMunicipioByCodigoDane() {
    return await this.runTest('getMunicipioByCodigoDane', async () => {
      // Get a valid codigo DANE first
      const allMunicipios = await municipioService.getAllMunicipios();
      if (allMunicipios.data.length === 0) {
        throw new Error('No municipios found to test with');
      }
      
      const testCodigoDane = allMunicipios.data[0].codigo_dane;
      const result = await municipioService.getMunicipioByCodigoDane(testCodigoDane);
      
      if (!result) {
        throw new Error('No municipio returned');
      }
      
      if (result.codigo_dane !== testCodigoDane) {
        throw new Error(`Codigo DANE mismatch: expected ${testCodigoDane}, got ${result.codigo_dane}`);
      }
      
      console.log(`   📋 Retrieved municipio by DANE: ${result.nombre_municipio} (${result.codigo_dane})`);
      if (result.departamento) {
        console.log(`   🏛️  Departamento: ${result.departamento.nombre}`);
      }
      
      return result;
    });
  }

  async testGetMunicipioByInvalidCodigoDane() {
    return await this.runTest('getMunicipioByCodigoDane - Invalid Code', async () => {
      try {
        await municipioService.getMunicipioByCodigoDane('99999');
        throw new Error('Should have thrown an error for invalid codigo DANE');
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('   ✅ Correctly threw error for invalid codigo DANE');
          return { message: 'Error handling working correctly' };
        }
        throw error;
      }
    });
  }

  async testSearchMunicipiosByName() {
    return await this.runTest('searchMunicipiosByName', async () => {
      // Test with common search terms
      const searchTerms = ['Bogotá', 'Medellín', 'Cali', 'San', 'La'];
      
      for (const term of searchTerms) {
        const results = await municipioService.searchMunicipiosByName(term);
        
        if (!Array.isArray(results)) {
          throw new Error(`Search results should be an array for term: ${term}`);
        }
        
        // Verify results contain the search term
        for (const municipio of results) {
          if (!municipio.nombre_municipio.toLowerCase().includes(term.toLowerCase())) {
            throw new Error(`Search result "${municipio.nombre_municipio}" doesn't contain "${term}"`);
          }
        }
        
        console.log(`   🔍 Search for "${term}" returned ${results.length} results`);
        if (results.length > 0) {
          console.log(`   📋 First result: ${results[0].nombre_municipio}`);
        }
      }
      
      return { message: 'All search terms tested successfully' };
    });
  }

  async testGetStatistics() {
    return await this.runTest('getStatistics', async () => {
      const result = await municipioService.getStatistics();
      
      if (typeof result.totalMunicipios !== 'number') {
        throw new Error('totalMunicipios should be a number');
      }
      
      if (result.totalMunicipios < 0) {
        throw new Error('totalMunicipios should be non-negative');
      }
      
      console.log(`   📊 Total municipios in statistics: ${result.totalMunicipios}`);
      
      // Cross-verify with getAllMunicipios
      const allMunicipios = await municipioService.getAllMunicipios();
      if (result.totalMunicipios !== allMunicipios.total) {
        throw new Error(`Statistics mismatch: ${result.totalMunicipios} vs ${allMunicipios.total}`);
      }
      
      console.log('   ✅ Statistics match getAllMunicipios count');
      
      return result;
    });
  }

  async testGetMunicipiosByDepartamento() {
    return await this.runTest('getMunicipiosByDepartamento', async () => {
      // Get a departamento ID first
      const allMunicipios = await municipioService.getAllMunicipios();
      if (allMunicipios.data.length === 0) {
        throw new Error('No municipios found to test with');
      }
      
      const testDepartamentoId = allMunicipios.data[0].id_departamento;
      const results = await municipioService.getMunicipiosByDepartamento(testDepartamentoId);
      
      if (!Array.isArray(results)) {
        throw new Error('Results should be an array');
      }
      
      // Verify all results belong to the specified departamento
      for (const municipio of results) {
        if (municipio.id_departamento !== testDepartamentoId) {
          throw new Error(`Municipio ${municipio.nombre_municipio} belongs to departamento ${municipio.id_departamento}, not ${testDepartamentoId}`);
        }
      }
      
      console.log(`   🏛️  Found ${results.length} municipios in departamento ${testDepartamentoId}`);
      if (results.length > 0) {
        console.log(`   📋 First municipio: ${results[0].nombre_municipio}`);
        if (results[0].departamento) {
          console.log(`   🏛️  Departamento name: ${results[0].departamento.nombre}`);
        }
      }
      
      return results;
    });
  }

  async testGetMunicipiosByInvalidDepartamento() {
    return await this.runTest('getMunicipiosByDepartamento - Invalid ID', async () => {
      const results = await municipioService.getMunicipiosByDepartamento(99999);
      
      if (!Array.isArray(results)) {
        throw new Error('Results should be an array');
      }
      
      if (results.length !== 0) {
        throw new Error('Should return empty array for invalid departamento');
      }
      
      console.log('   ✅ Correctly returned empty array for invalid departamento');
      return results;
    });
  }

  async testConcurrentOperations() {
    return await this.runTest('Concurrent Operations', async () => {
      // Execute multiple operations concurrently
      const promises = [
        municipioService.getAllMunicipios(),
        municipioService.getStatistics(),
        municipioService.searchMunicipiosByName('San'),
        municipioService.getAllMunicipios({ search: 'Bogotá' })
      ];
      
      const results = await Promise.all(promises);
      
      // Verify all operations completed successfully
      for (let i = 0; i < results.length; i++) {
        if (i === 0 || i === 3) { // getAllMunicipios operations
          if (results[i].status !== 'success') {
            throw new Error(`Operation ${i} failed: ${results[i].message}`);
          }
        }
      }
      
      console.log('   ✅ All concurrent operations completed successfully');
      console.log(`   📊 Results: ${results[0].total} total, ${results[2].length} with 'San', ${results[3].total} with 'Bogotá'`);
      
      return { message: 'Concurrent operations handled correctly' };
    });
  }

  async testDataIntegrity() {
    return await this.runTest('Data Integrity', async () => {
      const allMunicipios = await municipioService.getAllMunicipios();
      
      if (allMunicipios.data.length === 0) {
        throw new Error('No municipios found for integrity test');
      }
      
      // Test first 10 municipios for data integrity
      const testMunicipios = allMunicipios.data.slice(0, 10);
      
      for (const municipio of testMunicipios) {
        // Check required fields
        if (!municipio.id_municipio) {
          throw new Error(`Municipio missing id_municipio: ${municipio.nombre_municipio}`);
        }
        
        if (!municipio.nombre_municipio || municipio.nombre_municipio.trim() === '') {
          throw new Error(`Municipio missing or empty nombre_municipio: ID ${municipio.id_municipio}`);
        }
        
        if (!municipio.codigo_dane || municipio.codigo_dane.length !== 5) {
          throw new Error(`Municipio has invalid codigo_dane: ${municipio.nombre_municipio} - ${municipio.codigo_dane}`);
        }
        
        if (!municipio.id_departamento) {
          throw new Error(`Municipio missing id_departamento: ${municipio.nombre_municipio}`);
        }
        
        // Verify we can retrieve by ID
        const byId = await municipioService.getMunicipioById(municipio.id_municipio);
        if (byId.nombre_municipio !== municipio.nombre_municipio) {
          throw new Error(`Data mismatch when retrieving by ID: ${municipio.id_municipio}`);
        }
        
        // Verify we can retrieve by codigo DANE
        const byDane = await municipioService.getMunicipioByCodigoDane(municipio.codigo_dane);
        if (byDane.id_municipio !== municipio.id_municipio) {
          throw new Error(`Data mismatch when retrieving by DANE: ${municipio.codigo_dane}`);
        }
      }
      
      console.log(`   ✅ Verified data integrity for ${testMunicipios.length} municipios`);
      console.log('   📊 All required fields present and valid');
      console.log('   🔗 Cross-references working correctly');
      
      return { verified: testMunicipios.length };
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MUNICIPIO SERVICE TEST SUMMARY');
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
      console.log('\n🎉 All tests passed! Municipio service is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Municipio Service Tests');
    console.log('='.repeat(60));
    
    try {
      // Basic functionality tests
      await this.testGetAllMunicipios();
      await this.testGetAllMunicipiosWithFilters();
      await this.testGetMunicipioById();
      await this.testGetMunicipioByInvalidId();
      await this.testGetMunicipioByCodigoDane();
      await this.testGetMunicipioByInvalidCodigoDane();
      await this.testSearchMunicipiosByName();
      await this.testGetStatistics();
      await this.testGetMunicipiosByDepartamento();
      await this.testGetMunicipiosByInvalidDepartamento();
      
      // Advanced tests
      await this.testConcurrentOperations();
      await this.testDataIntegrity();
      
    } catch (error) {
      console.log(`\n⚠️  Test sequence interrupted: ${error.message}`);
    }
    
    this.printSummary();
  }
}

// Run tests
async function main() {
  const tester = new MunicipioServiceTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);
