import sequelize from './config/sequelize.js';

async function test() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('Testing table count...');
    const [results] = await sequelize.query("SELECT COUNT(*) as count FROM tipos_vivienda");
    console.log('Tipos vivienda count:', results[0].count);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('Connection closed');
    process.exit(0);
  }
}

test();
