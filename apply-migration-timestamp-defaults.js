#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔧 Aplicando migración: Agregar DEFAULT a columnas timestamp');
console.log('======================================================================\n');

const client = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function applyMigration() {
  try {
    console.log('📡 Conectando a 206.62.139.100:5433...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Migración persona_destreza
    console.log('📋 Aplicando cambios a persona_destreza...');
    await client.query(`
      ALTER TABLE persona_destreza 
        ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ DEFAULT agregado a createdAt');

    await client.query(`
      ALTER TABLE persona_destreza 
        ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ DEFAULT agregado a updatedAt\n');

    // Migración persona_enfermedad
    console.log('📋 Aplicando cambios a persona_enfermedad...');
    await client.query(`
      ALTER TABLE persona_enfermedad 
        ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ DEFAULT agregado a created_at');

    await client.query(`
      ALTER TABLE persona_enfermedad 
        ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ DEFAULT agregado a updated_at\n');

    // Verificación
    console.log('📊 Verificando cambios...\n');
    
    console.log('Tabla: persona_destreza');
    const destrezaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'persona_destreza' 
        AND column_name IN ('createdAt', 'updatedAt')
      ORDER BY column_name
    `);
    console.table(destrezaResult.rows);

    console.log('\nTabla: persona_enfermedad');
    const enfermedadResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'persona_enfermedad' 
        AND column_name IN ('created_at', 'updated_at')
      ORDER BY column_name
    `);
    console.table(enfermedadResult.rows);

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
