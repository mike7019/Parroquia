#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Verificando estructura de base de datos REMOTA');
console.log('======================================================================\n');

const client = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

const tables = [
  'persona_habilidad',
  'persona_destreza',
  'persona_celebracion',
  'persona_enfermedad'
];

async function checkTableStructure() {
  try {
    console.log('📡 Conectando a 206.62.139.100:5433...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    for (const table of tables) {
      console.log(`\n📋 Tabla: ${table}`);
      console.log('----------------------------------------------------------------------');
      
      try {
        const query = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `;
        
        const result = await client.query(query, [table]);
        
        if (result.rows.length === 0) {
          console.log('⚠️  Tabla no encontrada o sin columnas');
        } else {
          console.table(result.rows);
        }
      } catch (error) {
        console.error(`❌ Error al consultar tabla ${table}:`, error.message);
      }
    }

    await client.end();
    console.log('\n======================================================================');
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

checkTableStructure();
