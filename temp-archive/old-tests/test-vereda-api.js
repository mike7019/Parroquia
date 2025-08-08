import express from 'express';
import sequelize from './config/sequelize.js';
import veredaController from './src/controllers/catalog/veredaController.js';

const app = express();
app.use(express.json());

// Test vereda creation endpoint
app.post('/test-vereda', (req, res) => {
  veredaController.createVereda(req, res);
});

async function testAPI() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const server = app.listen(3001, () => {
      console.log('Test server running on port 3001');
    });

    // Test the API endpoint
    const testData = {
      nombre: 'API Test Vereda ' + Date.now(),
      codigo_vereda: 'API' + Date.now(),
      id_municipio: 5
    };

    console.log('\n--- Testing API endpoint ---');
    console.log('Test data:', testData);

    // Simulate a request
    const mockReq = {
      body: testData
    };

    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log('Response status:', this.statusCode);
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (this.statusCode === 201) {
          console.log('✓ API test successful - Vereda created');
        } else {
          console.log('❌ API test failed');
        }
        
        server.close();
        sequelize.close();
      }
    };

    await veredaController.createVereda(mockReq, mockRes);

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

testAPI();
