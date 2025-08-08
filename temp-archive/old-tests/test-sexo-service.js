import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';
import sexoService from './src/services/catalog/sexoService.js';

async function testSexoService() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Load all models
    await loadAllModels();
    
    console.log('Testing sexoService.getAllSexos()...');
    
    // Test the service directly
    const result = await sexoService.getAllSexos();
    console.log('Result:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testSexoService();
