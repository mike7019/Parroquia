#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔧 Aplicando migración: Agregar columna nombres completos');
console.log('======================================================================\n');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function applyMigration() {
  try {
    console.log('📡 Conectando a base de datos local...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Agregar columna nombres
    console.log('📋 Agregando columna nombres a tabla personas...');
    await client.query(`
      ALTER TABLE personas ADD COLUMN IF NOT EXISTS nombres VARCHAR(200)
    `);
    console.log('  ✅ Columna nombres agregada\n');

    // Verificación
    console.log('📊 Verificando cambios...\n');
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'personas' AND column_name = 'nombres'
    `);
    
    console.table(result.rows);

    await client.end();
    console.log('\n======================================================================');
    console.log('✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

applyMigration();
