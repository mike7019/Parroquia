const { Sequelize } = require('sequelize');
const path = require('path');

// Importar configuración
const config = require('./config/database.js');
const sequelize = new Sequelize(config.development);

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Consultar todas las tablas
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tablas existentes en la base de datos:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Verificar específicamente las tablas que necesitamos
    const requiredTables = ['sectores', 'parroquias', 'municipios', 'veredas'];
    console.log('\n🔍 Verificando tablas requeridas:');
    
    for (const table of requiredTables) {
      const exists = results.some(row => row.table_name === table);
      console.log(`${exists ? '✅' : '❌'} ${table}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
