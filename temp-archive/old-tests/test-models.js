import 'dotenv/config';
import sequelize from './config/sequelize.js';

async function testModelLoading() {
  try {
    console.log('🔍 Testing model loading...');
    
    // Import models one by one to identify problems
    console.log('📁 Loading models...');
    
    console.log('  - Loading Usuario model...');
    const { default: Usuario } = await import('./src/models/Usuario.js');
    console.log('  ✅ Usuario model loaded');
    
    console.log('  - Loading Role model...');
    const { default: Role } = await import('./src/models/Role.js');
    console.log('  ✅ Role model loaded');
    
    console.log('  - Loading catalog models...');
    const catalogModels = await import('./src/models/catalog/index.js');
    console.log('  ✅ Catalog models loaded');
    
    console.log('  - Loading main models...');
    const mainModels = await import('./src/models/main/index.js');
    console.log('  ✅ Main models loaded');
    
    console.log('🔄 Synchronizing models...');
    await sequelize.sync({ force: false });
    console.log('✅ Models synchronized successfully!');
    
    await sequelize.close();
    console.log('🔚 Connection closed');
    
  } catch (error) {
    console.error('❌ Model loading failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testModelLoading();
