#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Verificando columnas de tabla personas en BD remota');
console.log('======================================================================\n');

const client = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function checkPersonasColumns() {
  try {
    console.log('📡 Conectando a 206.62.139.100:5433...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Verificar columnas críticas
    const columnsToCheck = [
      'id_tipo_identificacion_tipo_identificacion',
      'id_estado_civil_estado_civil',
      'solicitud_comunion_casa'
    ];

    console.log('📋 Verificando columnas críticas en tabla personas:\n');
    
    for (const column of columnsToCheck) {
      const result = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = 'personas' 
          AND column_name = $1
      `, [column]);

      if (result.rows.length === 0) {
        console.log(`❌ ${column} - NO EXISTE`);
      } else {
        const col = result.rows[0];
        console.log(`✅ ${column}`);
        console.log(`   Tipo: ${col.data_type}`);
        console.log(`   Nullable: ${col.is_nullable}`);
        console.log(`   Default: ${col.column_default || 'NULL'}\n`);
      }
    }

    await client.end();
    console.log('======================================================================');
    console.log('✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPersonasColumns();
