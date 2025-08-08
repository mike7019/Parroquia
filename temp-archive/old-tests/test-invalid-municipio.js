import sequelize from './config/sequelize.js';
import { Veredas, Municipios } from './src/models/index.js';
import veredaService from './src/services/catalog/veredaService.js';

async function testInvalidMunicipioId() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Test with invalid municipio IDs that would cause the foreign key error
    const invalidTestCases = [
      {
        name: 'Non-existent ID (1)',
        data: {
          nombre: 'Invalid Test 1 ' + Date.now(),
          codigo_vereda: 'INV1' + Date.now(),
          id_municipio: 1 // This ID doesn't exist
        }
      },
      {
        name: 'Non-existent ID (999)',
        data: {
          nombre: 'Invalid Test 2 ' + Date.now(),
          codigo_vereda: 'INV2' + Date.now(),
          id_municipio: 999 // This ID doesn't exist
        }
      },
      {
        name: 'Null ID',
        data: {
          nombre: 'Invalid Test 3 ' + Date.now(),
          codigo_vereda: 'INV3' + Date.now(),
          id_municipio: null
        }
      }
    ];

    for (const testCase of invalidTestCases) {
      console.log(`\n--- Testing ${testCase.name} ---`);
      try {
        console.log('Test data:', testCase.data);
        const result = await veredaService.findOrCreateVereda(testCase.data);
        console.log('✓ Unexpected success:', result);
      } catch (error) {
        console.log('❌ Expected error:', error.message);
        if (error.message.includes('foreign key constraint')) {
          console.log('  ↳ This matches the original error!');
        }
      }
    }

    await sequelize.close();
    console.log('\n--- Test completed ---');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testInvalidMunicipioId();
