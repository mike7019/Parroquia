const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  config.development
);

async function checkTables() {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%destreza%' 
      ORDER BY table_name;
    `;
    
    const [results] = await sequelize.query(query);
    
    console.log('=== Tablas relacionadas con destreza ===');
    if (results.length === 0) {
      console.log('No se encontraron tablas relacionadas con "destreza"');
    } else {
      results.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
