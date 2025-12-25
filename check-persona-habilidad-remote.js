#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Verificando tabla persona_habilidad en BD remota');
console.log('======================================================================\n');

const client = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function checkPersonaHabilidad() {
  try {
    console.log('📡 Conectando a 206.62.139.100:5433...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Verificar todas las columnas de persona_habilidad
    console.log('📋 Estructura completa de persona_habilidad:\n');
    
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'persona_habilidad'
      ORDER BY ordinal_position
    `);

    console.table(result.rows);

    // Buscar columnas relacionadas con timestamp
    console.log('\n🔍 Buscando columnas de timestamp:\n');
    const timestampCols = result.rows.filter(col => 
      col.column_name.toLowerCase().includes('created') || 
      col.column_name.toLowerCase().includes('updated') ||
      col.column_name.toLowerCase().includes('at')
    );

    if (timestampCols.length === 0) {
      console.log('❌ No se encontraron columnas de timestamp');
    } else {
      console.log('Columnas encontradas:');
      timestampCols.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }

    await client.end();
    console.log('\n======================================================================');
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPersonaHabilidad();
