import 'dotenv/config';
import sequelize from './config/sequelize.js';

console.log('🔍 Testing database connection...');

try {
  await sequelize.authenticate();
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

console.log('🔄 Closing connection...');
await sequelize.close();
console.log('✅ Test completed');
