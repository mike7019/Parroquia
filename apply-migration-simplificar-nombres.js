#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔧 Aplicando migración: Simplificar columnas de nombres');
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

    // Paso 1: Crear columna nombres si no existe
    console.log('📋 Paso 1: Crear columna nombres si no existe...');
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'personas' AND column_name = 'nombres') THEN
              ALTER TABLE personas ADD COLUMN nombres VARCHAR(255);
          END IF;
      END $$;
    `);
    console.log('  ✅ Columna nombres lista\n');

    // Paso 2: Migrar datos existentes
    console.log('📋 Paso 2: Migrar datos existentes a nombres...');
    const migrateResult = await client.query(`
      UPDATE personas 
      SET nombres = TRIM(
          CONCAT_WS(' ', 
              NULLIF(primer_nombre, ''),
              NULLIF(segundo_nombre, ''),
              NULLIF(primer_apellido, ''),
              NULLIF(segundo_apellido, '')
          )
      )
      WHERE nombres IS NULL OR nombres = ''
      RETURNING id_personas, nombres
    `);
    console.log(`  ✅ ${migrateResult.rowCount} registros migrados\n`);

    // Paso 3: Eliminar columnas antiguas
    console.log('📋 Paso 3: Eliminar columnas antiguas...');
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS primer_nombre');
    console.log('  ✅ primer_nombre eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS segundo_nombre');
    console.log('  ✅ segundo_nombre eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS primer_apellido');
    console.log('  ✅ primer_apellido eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS segundo_apellido');
    console.log('  ✅ segundo_apellido eliminado\n');

    // Verificación
    console.log('📊 Verificando cambios...\n');
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
        AND column_name IN ('nombres', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
      ORDER BY column_name
    `);
    
    console.log('Columnas actuales relacionadas con nombres:');
    console.table(result.rows);

    // Mostrar algunos ejemplos
    console.log('\n📝 Ejemplos de nombres migrados:');
    const ejemplos = await client.query(`
      SELECT id_personas, nombres 
      FROM personas 
      WHERE nombres IS NOT NULL 
      LIMIT 5
    `);
    console.table(ejemplos.rows);

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
