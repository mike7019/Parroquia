/**
 * Script para aplicar migración de tabla familias para encuesta
 * Ejecutar: node apply-familias-migration.cjs
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

async function applyFamiliasMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de tabla familias...');
    
    // 1. Agregar nuevos campos básicos
    console.log('📝 Paso 1: Agregando campos básicos de encuesta...');
    await client.query(`
      ALTER TABLE familias 
        ADD COLUMN IF NOT EXISTS id_parroquia BIGINT NULL,
        ADD COLUMN IF NOT EXISTS numero_contrato_epm VARCHAR(50) NULL,
        ADD COLUMN IF NOT EXISTS comunionEnCasa BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS fecha_encuesta DATE NULL,
        ADD COLUMN IF NOT EXISTS sustento_familia TEXT NULL,
        ADD COLUMN IF NOT EXISTS observaciones_encuestador TEXT NULL,
        ADD COLUMN IF NOT EXISTS autorizacion_datos BOOLEAN DEFAULT FALSE;
    `);
    
    // 2. Agregar campos de servicios de agua
    console.log('📝 Paso 2: Agregando campos de servicios de agua...');
    await client.query(`
      ALTER TABLE familias 
        ADD COLUMN IF NOT EXISTS pozo_septico BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS letrina BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS campo_abierto BOOLEAN DEFAULT FALSE;
    `);
    
    // 3. Agregar campos de disposición de basuras
    console.log('📝 Paso 3: Agregando campos de disposición de basuras...');
    await client.query(`
      ALTER TABLE familias 
        ADD COLUMN IF NOT EXISTS disposicion_recolector BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS disposicion_quemada BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS disposicion_enterrada BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS disposicion_recicla BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS disposicion_aire_libre BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS disposicion_no_aplica BOOLEAN DEFAULT FALSE;
    `);
    
    // 4. Agregar nuevo campo id_tipo_vivienda como FK
    console.log('📝 Paso 4: Agregando id_tipo_vivienda como FK...');
    await client.query(`
      ALTER TABLE familias 
        ADD COLUMN IF NOT EXISTS id_tipo_vivienda BIGINT NULL;
    `);
    
    // 5. Migrar datos existentes de tipo_vivienda (VARCHAR) a id_tipo_vivienda (BIGINT)
    console.log('📝 Paso 5: Migrando datos de tipo_vivienda existentes...');
    
    // Verificar si hay datos que migrar
    const checkData = await client.query(`
      SELECT COUNT(*) as count FROM familias WHERE tipo_vivienda IS NOT NULL AND id_tipo_vivienda IS NULL;
    `);
    
    if (parseInt(checkData.rows[0].count) > 0) {
      console.log(`📊 Migrando ${checkData.rows[0].count} registros...`);
      
      // Migrar los IDs que estén como string en tipo_vivienda
      await client.query(`
        UPDATE familias 
        SET id_tipo_vivienda = CASE 
          WHEN tipo_vivienda ~ '^[0-9]+$' THEN tipo_vivienda::BIGINT
          ELSE NULL
        END
        WHERE tipo_vivienda IS NOT NULL AND id_tipo_vivienda IS NULL;
      `);
      
      const migratedCount = await client.query(`
        SELECT COUNT(*) as count FROM familias WHERE id_tipo_vivienda IS NOT NULL;
      `);
      console.log(`✅ ${migratedCount.rows[0].count} registros migrados exitosamente`);
    }
    
    // 6. Agregar foreign keys
    console.log('📝 Paso 6: Creando foreign keys...');
    
    try {
      await client.query(`
        ALTER TABLE familias 
          ADD CONSTRAINT fk_familias_parroquia 
            FOREIGN KEY (id_parroquia) REFERENCES parroquias(id_parroquia);
      `);
    } catch (err) {
      console.log('⚠️  FK parroquia ya existe o tabla no encontrada:', err.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE familias 
          ADD CONSTRAINT fk_familias_tipo_vivienda 
            FOREIGN KEY (id_tipo_vivienda) REFERENCES tipos_viviendas(id_tipo);
      `);
    } catch (err) {
      console.log('⚠️  FK tipo_vivienda ya existe o tabla no encontrada:', err.message);
    }
    
    // 7. Crear índices
    console.log('📝 Paso 7: Creando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_familias_parroquia ON familias(id_parroquia);',
      'CREATE INDEX IF NOT EXISTS idx_familias_tipo_vivienda ON familias(id_tipo_vivienda);',
      'CREATE INDEX IF NOT EXISTS idx_familias_fecha_encuesta ON familias(fecha_encuesta);',
      'CREATE INDEX IF NOT EXISTS idx_familias_autorizacion ON familias(autorizacion_datos);'
    ];
    
    for (const indexQuery of indices) {
      try {
        await client.query(indexQuery);
      } catch (err) {
        console.log('⚠️  Índice ya existe:', err.message);
      }
    }
    
    // 8. Verificar cambios
    console.log('📝 Paso 8: Verificando cambios aplicados...');
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
        AND column_name IN (
          'id_parroquia', 'numero_contrato_epm', 'comunionEnCasa', 
          'fecha_encuesta', 'sustento_familia', 'observaciones_encuestador', 
          'autorizacion_datos', 'pozo_septico', 'letrina', 'campo_abierto',
          'disposicion_recolector', 'disposicion_quemada', 'disposicion_enterrada',
          'disposicion_recicla', 'disposicion_aire_libre', 'disposicion_no_aplica',
          'id_tipo_vivienda'
        )
      ORDER BY ordinal_position;
    `);
    
    console.log('✅ Campos verificados:');
    console.table(result.rows);
    
    // Verificar foreign keys
    const fkResult = await client.query(`
      SELECT 
        kcu.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.constraint_column_usage ccu
        ON kcu.constraint_name = ccu.constraint_name
      WHERE kcu.table_name = 'familias'
        AND kcu.column_name IN ('id_parroquia', 'id_tipo_vivienda');
    `);
    
    console.log('✅ Foreign Keys creadas:');
    console.table(fkResult.rows);
    
    // Verificar migración de datos
    const dataCheck = await client.query(`
      SELECT 
        COUNT(*) as total_familias,
        COUNT(id_tipo_vivienda) as con_tipo_vivienda,
        COUNT(CASE WHEN tipo_vivienda IS NOT NULL AND id_tipo_vivienda IS NULL THEN 1 END) as pendientes_migrar
      FROM familias;
    `);
    
    console.log('✅ Estado de datos:');
    console.table(dataCheck.rows);
    
    console.log('🎉 Migración de familias completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar migración
if (require.main === module) {
  applyFamiliasMigration()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { applyFamiliasMigration };
