import 'dotenv/config';
import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

async function testLoadAllModels() {
  try {
    console.log('🔍 Testing loadAllModels...');
    
    // Test database connection first
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Now test loadAllModels
    console.log('📦 Loading all models...');
    await loadAllModels();
    console.log('✅ All models loaded successfully!');
    
    console.log('🔄 Testing sync...');
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized successfully!');
    
    await sequelize.close();
    console.log('🔚 Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testLoadAllModels();
