/**
 * Script para completar migración de campo tipo_vivienda
 * Ejecutar: node fix-tipo-vivienda-migration.cjs
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
});

async function fixTipoViviendaMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Completando migración de tipo_vivienda...');
    
    // 1. Verificar estado actual
    console.log('📝 Paso 1: Verificando estado actual...');
    const currentState = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
        AND column_name IN ('tipo_vivienda', 'id_tipo_vivienda');
    `);
    
    console.log('Estado actual de campos tipo_vivienda:');
    console.table(currentState.rows);
    
    // 2. Permitir NULL en tipo_vivienda original
    console.log('📝 Paso 2: Permitiendo NULL en tipo_vivienda...');
    await client.query(`
      ALTER TABLE familias ALTER COLUMN tipo_vivienda DROP NOT NULL;
    `);
    
    // 3. Verificar si hay datos pendientes de migrar
    console.log('📝 Paso 3: Verificando datos pendientes...');
    const pendingData = await client.query(`
      SELECT 
        id_familia,
        tipo_vivienda,
        id_tipo_vivienda
      FROM familias 
      WHERE tipo_vivienda IS NOT NULL 
        AND (id_tipo_vivienda IS NULL OR id_tipo_vivienda = 0);
    `);
    
    if (pendingData.rows.length > 0) {
      console.log(`📊 Migrando ${pendingData.rows.length} registros pendientes...`);
      console.table(pendingData.rows);
      
      // Migrar cada registro individualmente
      for (const row of pendingData.rows) {
        try {
          // Intentar convertir a número
          const tipoViviendaId = parseInt(row.tipo_vivienda);
          if (!isNaN(tipoViviendaId)) {
            await client.query(`
              UPDATE familias 
              SET id_tipo_vivienda = $1 
              WHERE id_familia = $2;
            `, [tipoViviendaId, row.id_familia]);
            console.log(`✅ Migrado familia ${row.id_familia}: "${row.tipo_vivienda}" → ${tipoViviendaId}`);
          } else {
            console.log(`⚠️  No se pudo migrar familia ${row.id_familia}: "${row.tipo_vivienda}" no es numérico`);
          }
        } catch (err) {
          console.log(`❌ Error migrando familia ${row.id_familia}:`, err.message);
        }
      }
    }
    
    // 4. Ahora podemos hacer NULL el campo tipo_vivienda en los registros migrados
    console.log('📝 Paso 4: Limpiando campo tipo_vivienda migrado...');
    await client.query(`
      UPDATE familias 
      SET tipo_vivienda = NULL 
      WHERE id_tipo_vivienda IS NOT NULL;
    `);
    
    // 5. Verificar resultado final
    console.log('📝 Paso 5: Verificando resultado final...');
    const finalState = await client.query(`
      SELECT 
        COUNT(*) as total_familias,
        COUNT(tipo_vivienda) as con_tipo_vivienda_varchar,
        COUNT(id_tipo_vivienda) as con_id_tipo_vivienda,
        COUNT(CASE WHEN tipo_vivienda IS NOT NULL AND id_tipo_vivienda IS NULL THEN 1 END) as pendientes
      FROM familias;
    `);
    
    console.log('✅ Estado final:');
    console.table(finalState.rows);
    
    // 6. Mostrar algunos registros de ejemplo
    const examples = await client.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.tipo_vivienda,
        f.id_tipo_vivienda,
        tv.descripcion as tipo_vivienda_nombre
      FROM familias f
      LEFT JOIN tipos_viviendas tv ON f.id_tipo_vivienda = tv.id_tipo
      LIMIT 3;
    `);
    
    console.log('✅ Ejemplos de registros:');
    console.table(examples.rows);
    
    console.log('🎉 Migración de tipo_vivienda completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar migración
if (require.main === module) {
  fixTipoViviendaMigration()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { fixTipoViviendaMigration };
