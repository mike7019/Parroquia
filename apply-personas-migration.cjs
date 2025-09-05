/**
 * Script para aplicar migración de tabla personas para encuesta
 * Ejecutar: node apply-personas-migration.js
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

async function applyPersonasMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de tabla personas...');
    
    // 1. Modificar campos existentes para permitir NULL
    console.log('📝 Paso 1: Permitiendo NULL en telefono y correo_electronico...');
    await client.query(`
      ALTER TABLE personas 
        ALTER COLUMN telefono DROP NOT NULL,
        ALTER COLUMN correo_electronico DROP NOT NULL;
    `);
    
    // 2. Eliminar constraint unique en correo_electronico
    console.log('📝 Paso 2: Eliminando constraint unique de correo_electronico...');
    await client.query(`
      ALTER TABLE personas DROP CONSTRAINT IF EXISTS personas_correo_electronico_key;
    `);
    
    // 3. Agregar nuevos campos
    console.log('📝 Paso 3: Agregando nuevos campos...');
    await client.query(`
      ALTER TABLE personas 
        ADD COLUMN IF NOT EXISTS id_parentesco BIGINT NULL,
        ADD COLUMN IF NOT EXISTS id_comunidad_cultural BIGINT NULL,
        ADD COLUMN IF NOT EXISTS id_nivel_educativo BIGINT NULL,
        ADD COLUMN IF NOT EXISTS motivo_celebrar VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS dia_celebrar INTEGER NULL CHECK (dia_celebrar >= 1 AND dia_celebrar <= 31),
        ADD COLUMN IF NOT EXISTS mes_celebrar INTEGER NULL CHECK (mes_celebrar >= 1 AND mes_celebrar <= 12);
    `);
    
    // 4. Agregar foreign keys
    console.log('📝 Paso 4: Creando foreign keys...');
    try {
      await client.query(`
        ALTER TABLE personas 
          ADD CONSTRAINT fk_personas_parentesco 
            FOREIGN KEY (id_parentesco) REFERENCES parentescos(id_parentesco);
      `);
    } catch (err) {
      console.log('⚠️  FK parentesco ya existe o tabla no encontrada:', err.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE personas 
          ADD CONSTRAINT fk_personas_comunidad_cultural 
            FOREIGN KEY (id_comunidad_cultural) REFERENCES comunidades_culturales(id_comunidad_cultural);
      `);
    } catch (err) {
      console.log('⚠️  FK comunidad_cultural ya existe o tabla no encontrada:', err.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE personas 
          ADD CONSTRAINT fk_personas_nivel_educativo 
            FOREIGN KEY (id_nivel_educativo) REFERENCES niveles_educativos(id_niveles_educativos);
      `);
    } catch (err) {
      console.log('⚠️  FK nivel_educativo ya existe o tabla no encontrada:', err.message);
    }
    
    // 5. Crear índices
    console.log('📝 Paso 5: Creando índices...');
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_personas_parentesco ON personas(id_parentesco);',
      'CREATE INDEX IF NOT EXISTS idx_personas_comunidad_cultural ON personas(id_comunidad_cultural);',
      'CREATE INDEX IF NOT EXISTS idx_personas_nivel_educativo ON personas(id_nivel_educativo);',
      'CREATE INDEX IF NOT EXISTS idx_personas_celebracion ON personas(mes_celebrar, dia_celebrar);'
    ];
    
    for (const indexQuery of indices) {
      try {
        await client.query(indexQuery);
      } catch (err) {
        console.log('⚠️  Índice ya existe:', err.message);
      }
    }
    
    // 6. Verificar cambios
    console.log('📝 Paso 6: Verificando cambios aplicados...');
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
        AND column_name IN (
          'telefono', 'correo_electronico', 'id_parentesco', 
          'id_comunidad_cultural', 'id_nivel_educativo', 
          'motivo_celebrar', 'dia_celebrar', 'mes_celebrar'
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
      WHERE kcu.table_name = 'personas'
        AND kcu.column_name IN ('id_parentesco', 'id_comunidad_cultural', 'id_nivel_educativo');
    `);
    
    console.log('✅ Foreign Keys creadas:');
    console.table(fkResult.rows);
    
    console.log('🎉 Migración de personas completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar migración
if (require.main === module) {
  applyPersonasMigration()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { applyPersonasMigration };
