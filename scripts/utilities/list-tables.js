const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(config.development);

async function listTables() {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas en la base de datos:');
    results.forEach(row => console.log('  -', row.table_name));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

listTables();
