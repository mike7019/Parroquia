require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function checkTables() {
  try {
    // Check encuestas table structure
    const encuestasResult = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'encuestas'");
    console.log('=== ENCUESTAS TABLE COLUMNS ===');
    encuestasResult.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    
    // Check usuarios table structure
    const usuariosResult = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usuarios'");
    console.log('\n=== USUARIOS TABLE COLUMNS ===');
    usuariosResult.rows.forEach(row => console.log(`${row.column_name}: ${row.data_type}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
