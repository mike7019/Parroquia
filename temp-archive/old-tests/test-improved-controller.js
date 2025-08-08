import express from 'express';
import sequelize from './config/sequelize.js';
import veredaController from './src/controllers/catalog/veredaController.js';

const app = express();
app.use(express.json());

async function testImprovedController() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Test cases for the improved controller
    const testCases = [
      {
        name: 'Valid municipio ID',
        data: {
          nombre: 'Controller Test Valid ' + Date.now(),
          codigo_vereda: 'CTV' + Date.now(),
          id_municipio: 5 // Valid ID
        },
        expectedStatus: 201
      },
      {
        name: 'Invalid municipio ID',
        data: {
          nombre: 'Controller Test Invalid ' + Date.now(),
          codigo_vereda: 'CTI' + Date.now(),
          id_municipio: 999 // Invalid ID
        },
        expectedStatus: 400
      },
      {
        name: 'Missing nombre',
        data: {
          codigo_vereda: 'CTM' + Date.now(),
          id_municipio: 5
        },
        expectedStatus: 400
      },
      {
        name: 'No municipio ID (should work)',
        data: {
          nombre: 'Controller Test No Municipio ' + Date.now(),
          codigo_vereda: 'CTN' + Date.now()
          // No id_municipio provided
        },
        expectedStatus: 201
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing: ${testCase.name} ---`);
      console.log('Request data:', testCase.data);

      const mockReq = { body: testCase.data };
      let responseStatus, responseData;

      const mockRes = {
        status: function(code) {
          responseStatus = code;
          return this;
        },
        json: function(data) {
          responseData = data;
          
          console.log(`Response status: ${responseStatus}`);
          console.log('Response data:', JSON.stringify(data, null, 2));
          
          if (responseStatus === testCase.expectedStatus) {
            console.log('✓ Test passed - Expected status received');
          } else {
            console.log(`❌ Test failed - Expected ${testCase.expectedStatus}, got ${responseStatus}`);
          }
        }
      };

      await veredaController.createVereda(mockReq, mockRes);
    }

    await sequelize.close();
    console.log('\n--- All tests completed ---');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testImprovedController();
