#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔧 Aplicando migración REMOTA: Simplificar columnas de nombres');
console.log('======================================================================\n');

// CONFIGURACIÓN PARA BASE DE DATOS REMOTA
const client = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function applyMigration() {
  try {
    console.log('📡 Conectando a base de datos REMOTA (206.62.139.100:5433)...\n');
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

    // Paso 3: Hacer nombres NOT NULL
    console.log('📋 Paso 3: Establecer nombres como NOT NULL...');
    await client.query('ALTER TABLE personas ALTER COLUMN nombres SET NOT NULL');
    console.log('  ✅ Constraint NOT NULL agregado\n');

    // Paso 4: Eliminar columnas antiguas
    console.log('📋 Paso 4: Eliminar columnas antiguas...');
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS primer_nombre');
    console.log('  ✅ primer_nombre eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS segundo_nombre');
    console.log('  ✅ segundo_nombre eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS primer_apellido');
    console.log('  ✅ primer_apellido eliminado');
    
    await client.query('ALTER TABLE personas DROP COLUMN IF EXISTS segundo_apellido');
    console.log('  ✅ segundo_apellido eliminado\n');

    // Paso 5: Verificar estructura final
    console.log('📋 Paso 5: Verificar estructura final...');
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
        AND column_name IN ('nombres', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Estructura actual de la tabla personas:');
    console.table(verifyResult.rows);

    console.log('\n✅ ¡Migración completada exitosamente en servidor REMOTO!');
    console.log('======================================================================\n');

  } catch (error) {
    console.error('\n❌ Error aplicando la migración:', error.message);
    console.error('\n🔍 Detalles del error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('📡 Conexión cerrada\n');
  }
}

applyMigration();
