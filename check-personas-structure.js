#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function checkPersonasStructure() {
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'personas'
      ORDER BY ordinal_position
    `);
    
    console.log('Estructura de tabla personas:');
    console.table(result.rows);
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPersonasStructure();
