import sequelize from './config/sequelize.js';
import { runConfigSeeders } from './src/seeders/configSeeder.js';

async function testSeeders() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected');

    console.log('🌱 Testing seeders...');
    const results = await runConfigSeeders();
    console.log('✅ Seeders completed:', results);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  }
}

testSeeders();
