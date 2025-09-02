import sectorService from './src/services/catalog/sectorService.js';

class SectorServiceTester {
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

  async testGetAllSectors() {
    return await this.runTest('getAllSectors', async () => {
      const result = await sectorService.getAllSectors();
      
      if (result.status !== 'success') {
        throw new Error(`Expected status 'success', got '${result.status}'`);
      }
      
      if (!Array.isArray(result.data)) {
        throw new Error('Expected data to be an array');
      }
      
      if (result.total !== result.data.length) {
        throw new Error(`Total count mismatch: ${result.total} vs ${result.data.length}`);
      }
      
      console.log(`   📊 Found ${result.total} sectores`);
      if (result.data.length > 0) {
        console.log(`   📋 First sector: ${result.data[0].nombre}`);
      }
      
      return result;
    });
  }

  async testGetSectorById() {
    return await this.runTest('getSectorById', async () => {
      // First get all sectors to get a valid ID
      const allSectors = await sectorService.getAllSectors();
      if (allSectors.data.length === 0) {
        throw new Error('No sectors found to test with');
      }
      
      const testId = allSectors.data[0].id_sector;
      const result = await sectorService.getSectorById(testId);
      
      if (!result) {
        throw new Error('No sector returned');
      }
      
      if (result.id_sector !== testId) {
        throw new Error(`ID mismatch: expected ${testId}, got ${result.id_sector}`);
      }
      
      console.log(`   📋 Retrieved sector: ${result.nombre} (ID: ${result.id_sector})`);
      if (result.municipio) {
        console.log(`   🏛️  Associated municipio: ${result.municipio.nombre_municipio}`);
      }
      
      return result;
    });
  }

  async testGetSectorByInvalidId() {
    return await this.runTest('getSectorById - Invalid ID', async () => {
      try {
        await sectorService.getSectorById(99999);
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

  async testCreateSector() {
    return await this.runTest('createSector', async () => {
      // Get a valid municipio ID first
      const allSectors = await sectorService.getAllSectors();
      if (allSectors.data.length === 0) {
        throw new Error('No sectors found to get municipio reference');
      }
      
      const validMunicipioId = allSectors.data[0].id_municipio;
      
      const testData = {
        nombre: `Test Sector ${Date.now()}`,
        id_municipio: validMunicipioId
      };
      
      const result = await sectorService.createSector(testData);
      
      if (!result) {
        throw new Error('No sector returned from create');
      }
      
      if (result.nombre !== testData.nombre) {
        throw new Error(`Name mismatch: expected ${testData.nombre}, got ${result.nombre}`);
      }
      
      if (result.id_municipio !== testData.id_municipio) {
        throw new Error(`Municipio mismatch: expected ${testData.id_municipio}, got ${result.id_municipio}`);
      }
      
      console.log(`   ✅ Created sector: ${result.nombre} (ID: ${result.id_sector})`);
      if (result.municipio) {
        console.log(`   🏛️  In municipio: ${result.municipio.nombre_municipio}`);
      }
      
      // Store for cleanup
      this.createdSectorId = result.id_sector;
      
      return result;
    });
  }

  async testCreateSectorWithInvalidMunicipio() {
    return await this.runTest('createSector with Invalid Municipio', async () => {
      const testData = {
        nombre: 'Test Invalid Municipio Sector',
        id_municipio: 99999 // Invalid municipio ID
      };
      
      try {
        await sectorService.createSector(testData);
        throw new Error('Should have thrown an error for invalid municipio');
      } catch (error) {
        if (error.message.includes('no existe')) {
          console.log('   ✅ Correctly rejected invalid municipio ID');
          return { message: 'Validation working correctly' };
        }
        throw error;
      }
    });
  }

  async testCreateDuplicateSector() {
    return await this.runTest('createSector with Duplicate Name', async () => {
      if (!this.createdSectorId) {
        throw new Error('No sector created to test duplication with');
      }
      
      // Get the created sector's data
      const createdSector = await sectorService.getSectorById(this.createdSectorId);
      
      const duplicateData = {
        nombre: createdSector.nombre, // Same name
        id_municipio: createdSector.id_municipio // Same municipio
      };
      
      try {
        await sectorService.createSector(duplicateData);
        throw new Error('Should have thrown an error for duplicate sector');
      } catch (error) {
        if (error.message.includes('Ya existe')) {
          console.log('   ✅ Correctly rejected duplicate sector');
          return { message: 'Duplicate validation working correctly' };
        }
        throw error;
      }
    });
  }

  async testUpdateSector() {
    return await this.runTest('updateSector', async () => {
      if (!this.createdSectorId) {
        throw new Error('No sector created to update');
      }
      
      const updateData = {
        nombre: `Updated Test Sector ${Date.now()}`
      };
      
      const result = await sectorService.updateSector(this.createdSectorId, updateData);
      
      if (!result) {
        throw new Error('No sector returned from update');
      }
      
      if (result.nombre !== updateData.nombre) {
        throw new Error(`Name not updated: expected ${updateData.nombre}, got ${result.nombre}`);
      }
      
      console.log(`   ✅ Updated sector: ${result.nombre} (ID: ${result.id_sector})`);
      
      return result;
    });
  }

  async testUpdateSectorWithInvalidMunicipio() {
    return await this.runTest('updateSector with Invalid Municipio', async () => {
      if (!this.createdSectorId) {
        throw new Error('No sector created to update');
      }
      
      try {
        await sectorService.updateSector(this.createdSectorId, {
          id_municipio: 99999 // Invalid municipio
        });
        throw new Error('Should have thrown an error for invalid municipio');
      } catch (error) {
        if (error.message.includes('no existe')) {
          console.log('   ✅ Correctly rejected invalid municipio update');
          return { message: 'Update validation working correctly' };
        }
        throw error;
      }
    });
  }

  async testSectorExistsByName() {
    return await this.runTest('sectorExistsByName', async () => {
      if (!this.createdSectorId) {
        throw new Error('No sector created to test existence with');
      }
      
      const createdSector = await sectorService.getSectorById(this.createdSectorId);
      
      // Test with existing name
      const exists = await sectorService.sectorExistsByName(createdSector.nombre);
      if (!exists) {
        throw new Error('Should return true for existing sector name');
      }
      console.log(`   ✅ Correctly found existing sector: ${createdSector.nombre}`);
      
      // Test with non-existing name
      const notExists = await sectorService.sectorExistsByName('NonExistentSectorName123');
      if (notExists) {
        throw new Error('Should return false for non-existing sector name');
      }
      console.log('   ✅ Correctly returned false for non-existing sector');
      
      // Test excluding current ID
      const excludedExists = await sectorService.sectorExistsByName(createdSector.nombre, this.createdSectorId);
      if (excludedExists) {
        throw new Error('Should return false when excluding the sector with same name');
      }
      console.log('   ✅ Correctly excluded current sector from existence check');
      
      return { exists, notExists, excludedExists };
    });
  }

  async testFindOrCreateSector() {
    return await this.runTest('findOrCreateSector', async () => {
      // Get a valid municipio ID
      const allSectors = await sectorService.getAllSectors();
      const validMunicipioId = allSectors.data[0].id_municipio;
      let foundSector = null;
      
      // Test finding existing sector
      if (this.createdSectorId) {
        const createdSector = await sectorService.getSectorById(this.createdSectorId);
        const { sector: existingSector, created } = await sectorService.findOrCreateSector({
          nombre: createdSector.nombre,
          id_municipio: createdSector.id_municipio
        });
        
        if (created) {
          throw new Error('Should have found existing sector, not created new one');
        }
        
        if (existingSector.id_sector !== this.createdSectorId) {
          throw new Error('Found different sector than expected');
        }
        
        foundSector = existingSector;
        console.log(`   ✅ Found existing sector: ${foundSector.nombre}`);
      }
      
      // Test creating new sector
      const { sector: newSector, created: wasCreated } = await sectorService.findOrCreateSector({
        nombre: `New Sector ${Date.now()}`,
        id_municipio: validMunicipioId
      });
      
      if (!wasCreated) {
        throw new Error('Should have created new sector');
      }
      
      console.log(`   ✅ Created new sector: ${newSector.nombre} (ID: ${newSector.id_sector})`);
      
      // Cleanup the new sector
      try {
        await sectorService.deleteSector(newSector.id_sector);
        console.log('   🗑️  Cleaned up created sector');
      } catch (error) {
        console.log('   ⚠️  Failed to cleanup created sector');
      }
      
      return { foundSector, newSector, wasCreated };
    });
  }

  async testDeleteSector() {
    return await this.runTest('deleteSector', async () => {
      if (!this.createdSectorId) {
        throw new Error('No sector created to delete');
      }
      
      const result = await sectorService.deleteSector(this.createdSectorId);
      
      if (!result) {
        throw new Error('Delete operation should return true');
      }
      
      console.log(`   ✅ Deleted sector (ID: ${this.createdSectorId})`);
      
      // Try to get the deleted sector (should fail)
      try {
        await sectorService.getSectorById(this.createdSectorId);
        throw new Error('Sector should not exist after deletion');
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('   ✅ Confirmed sector was deleted');
        } else {
          throw error;
        }
      }
      
      return result;
    });
  }

  async testDeleteNonExistentSector() {
    return await this.runTest('deleteSector - Non-existent ID', async () => {
      try {
        await sectorService.deleteSector(99999);
        throw new Error('Should have thrown an error for non-existent sector');
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('   ✅ Correctly threw error for non-existent sector');
          return { message: 'Error handling working correctly' };
        }
        throw error;
      }
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECTOR SERVICE TEST SUMMARY');
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
      console.log('\n🎉 All tests passed! Sector service is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Sector Service Tests');
    console.log('='.repeat(60));
    
    try {
      // Read-only tests
      await this.testGetAllSectors();
      await this.testGetSectorById();
      await this.testGetSectorByInvalidId();
      
      // Write tests
      await this.testCreateSector();
      await this.testCreateSectorWithInvalidMunicipio();
      await this.testCreateDuplicateSector();
      await this.testUpdateSector();
      await this.testUpdateSectorWithInvalidMunicipio();
      await this.testSectorExistsByName();
      await this.testFindOrCreateSector();
      await this.testDeleteSector();
      await this.testDeleteNonExistentSector();
      
    } catch (error) {
      console.log(`\n⚠️  Test sequence interrupted: ${error.message}`);
    }
    
    this.printSummary();
  }
}

// Run tests
async function main() {
  const tester = new SectorServiceTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);
