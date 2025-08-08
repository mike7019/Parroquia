import 'dotenv/config';
import sequelize from './config/sequelize.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('Connection config:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'parroquia_db',
      username: process.env.DB_USER || 'parroquia_user'
    });
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT NOW() as current_time');
    console.log('📅 Database time:', result[0][0].current_time);
    
    await sequelize.close();
    console.log('🔚 Connection closed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testDatabaseConnection();
