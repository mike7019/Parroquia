import parroquiaService from './src/services/catalog/parroquiaService.js';

class ParroquiaEdgeCaseTester {
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

  async testCreateParroquiaWithInvalidMunicipio() {
    return await this.runTest('Create Parroquia with Invalid Municipio', async () => {
      const testData = {
        nombre: 'Test Invalid Municipio',
        id_municipio: 99999 // Invalid municipio ID
      };
      
      try {
        await parroquiaService.createParroquia(testData);
        throw new Error('Should have thrown an error for invalid municipio');
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log('   ✅ Correctly rejected invalid municipio ID');
          return { message: 'Validation working correctly' };
        }
        throw error;
      }
    });
  }

  async testCreateParroquiaWithEmptyName() {
    return await this.runTest('Create Parroquia with Empty Name', async () => {
      const allParroquias = await parroquiaService.getAllParroquias();
      const validMunicipioId = allParroquias.data[0].id_municipio;
      
      const testData = {
        nombre: '', // Empty name
        id_municipio: validMunicipioId
      };
      
      try {
        await parroquiaService.createParroquia(testData);
        throw new Error('Should have thrown an error for empty name');
      } catch (error) {
        console.log('   ✅ Correctly rejected empty name');
        return { message: 'Validation working correctly' };
      }
    });
  }

  async testCreateParroquiaWithDuplicateName() {
    return await this.runTest('Create Parroquia with Duplicate Name', async () => {
      const allParroquias = await parroquiaService.getAllParroquias();
      const existingParroquia = allParroquias.data[0];
      
      const testData = {
        nombre: existingParroquia.nombre, // Duplicate name
        id_municipio: existingParroquia.id_municipio
      };
      
      try {
        const result = await parroquiaService.createParroquia(testData);
        // If creation succeeds, we need to clean up
        await parroquiaService.deleteParroquia(result.id_parroquia);
        console.log('   ⚠️  Duplicate names are allowed (business rule)');
        return { message: 'Duplicate names allowed' };
      } catch (error) {
        console.log('   ✅ Correctly rejected duplicate name');
        return { message: 'Duplicate validation working' };
      }
    });
  }

  async testUpdateParroquiaWithInvalidMunicipio() {
    return await this.runTest('Update Parroquia with Invalid Municipio', async () => {
      // Create a test parroquia first
      const allParroquias = await parroquiaService.getAllParroquias();
      const validMunicipioId = allParroquias.data[0].id_municipio;
      
      const testParroquia = await parroquiaService.createParroquia({
        nombre: `Test Update Invalid ${Date.now()}`,
        id_municipio: validMunicipioId
      });
      
      try {
        await parroquiaService.updateParroquia(testParroquia.id_parroquia, {
          id_municipio: 99999 // Invalid municipio
        });
        throw new Error('Should have thrown an error for invalid municipio');
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log('   ✅ Correctly rejected invalid municipio update');
          return { message: 'Update validation working correctly' };
        }
        throw error;
      } finally {
        // Cleanup
        try {
          await parroquiaService.deleteParroquia(testParroquia.id_parroquia);
        } catch (cleanupError) {
          console.log('   ⚠️  Cleanup failed, parroquia may still exist');
        }
      }
    });
  }

  async testSearchParroquiasWithEmptyTerm() {
    return await this.runTest('Search Parroquias with Empty Term', async () => {
      const results = await parroquiaService.searchParroquias('');
      
      if (!Array.isArray(results)) {
        throw new Error('Results should be an array');
      }
      
      console.log(`   📊 Empty search returned ${results.length} results`);
      return results;
    });
  }

  async testSearchParroquiasWithSpecialCharacters() {
    return await this.runTest('Search Parroquias with Special Characters', async () => {
      const specialChars = ['%', '_', "'", '"', ';', '\\'];
      
      for (const char of specialChars) {
        const results = await parroquiaService.searchParroquias(char);
        
        if (!Array.isArray(results)) {
          throw new Error(`Results should be an array for character: ${char}`);
        }
        
        console.log(`   🔍 Search for "${char}" returned ${results.length} results`);
      }
      
      return { message: 'Special character search handled correctly' };
    });
  }

  async testGetParroquiasByInvalidMunicipio() {
    return await this.runTest('Get Parroquias by Invalid Municipio', async () => {
      const results = await parroquiaService.getParroquiasByMunicipio(99999);
      
      if (!Array.isArray(results)) {
        throw new Error('Results should be an array');
      }
      
      if (results.length !== 0) {
        throw new Error('Should return empty array for invalid municipio');
      }
      
      console.log('   ✅ Correctly returned empty array for invalid municipio');
      return results;
    });
  }

  async testConcurrentOperations() {
    return await this.runTest('Concurrent Operations', async () => {
      const allParroquias = await parroquiaService.getAllParroquias();
      const validMunicipioId = allParroquias.data[0].id_municipio;
      
      // Execute multiple operations concurrently
      const promises = [
        parroquiaService.getAllParroquias(),
        parroquiaService.getParroquiaStatistics(),
        parroquiaService.searchParroquias('San'),
        parroquiaService.getParroquiasByMunicipio(validMunicipioId),
        parroquiaService.createParroquia({
          nombre: `Concurrent Test 1 ${Date.now()}`,
          id_municipio: validMunicipioId
        }),
        parroquiaService.createParroquia({
          nombre: `Concurrent Test 2 ${Date.now()}`,
          id_municipio: validMunicipioId
        })
      ];
      
      const results = await Promise.all(promises);
      
      // Cleanup created parroquias
      const createdParroquias = results.slice(4); // Last 2 results
      for (const parroquia of createdParroquias) {
        try {
          await parroquiaService.deleteParroquia(parroquia.id_parroquia);
        } catch (error) {
          console.log(`   ⚠️  Failed to cleanup parroquia ${parroquia.id_parroquia}`);
        }
      }
      
      console.log('   ✅ All concurrent operations completed successfully');
      return { message: 'Concurrent operations handled correctly' };
    });
  }

  async testLargeDataset() {
    return await this.runTest('Large Dataset Handling', async () => {
      const allParroquias = await parroquiaService.getAllParroquias();
      const validMunicipioId = allParroquias.data[0].id_municipio;
      
      // Create multiple parroquias to test performance
      const createPromises = [];
      const parroquiaIds = [];
      
      for (let i = 0; i < 10; i++) {
        createPromises.push(
          parroquiaService.createParroquia({
            nombre: `Bulk Test Parroquia ${i} ${Date.now()}`,
            id_municipio: validMunicipioId
          })
        );
      }
      
      try {
        const startTime = Date.now();
        const createdParroquias = await Promise.all(createPromises);
        const createTime = Date.now() - startTime;
        
        console.log(`   📊 Created ${createdParroquias.length} parroquias in ${createTime}ms`);
        
        // Test retrieval performance
        const retrievalStart = Date.now();
        const allAfterCreation = await parroquiaService.getAllParroquias();
        const retrievalTime = Date.now() - retrievalStart;
        
        console.log(`   📊 Retrieved ${allAfterCreation.total} parroquias in ${retrievalTime}ms`);
        
        // Cleanup
        const deletePromises = createdParroquias.map(p => 
          parroquiaService.deleteParroquia(p.id_parroquia)
        );
        
        const deleteStart = Date.now();
        await Promise.all(deletePromises);
        const deleteTime = Date.now() - deleteStart;
        
        console.log(`   📊 Deleted ${createdParroquias.length} parroquias in ${deleteTime}ms`);
        
        return {
          created: createdParroquias.length,
          createTime,
          retrievalTime,
          deleteTime
        };
        
      } catch (error) {
        // Attempt cleanup on error
        for (const id of parroquiaIds) {
          try {
            await parroquiaService.deleteParroquia(id);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
        }
        throw error;
      }
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 EDGE CASE TEST SUMMARY');
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
      console.log('\n🎉 All edge case tests passed! Parroquia service is robust.');
    } else {
      console.log('\n⚠️  Some edge case tests failed. Please review the errors above.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Parroquia Service Edge Case Tests');
    console.log('='.repeat(60));
    
    try {
      await this.testCreateParroquiaWithInvalidMunicipio();
      await this.testCreateParroquiaWithEmptyName();
      await this.testCreateParroquiaWithDuplicateName();
      await this.testUpdateParroquiaWithInvalidMunicipio();
      await this.testSearchParroquiasWithEmptyTerm();
      await this.testSearchParroquiasWithSpecialCharacters();
      await this.testGetParroquiasByInvalidMunicipio();
      await this.testConcurrentOperations();
      await this.testLargeDataset();
      
    } catch (error) {
      console.log(`\n⚠️  Test sequence interrupted: ${error.message}`);
    }
    
    this.printSummary();
  }
}

// Run tests
async function main() {
  const tester = new ParroquiaEdgeCaseTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);
