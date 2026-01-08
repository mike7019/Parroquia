#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔧 Aplicando migración: Agregar timestamps a tabla familias');
console.log('======================================================================\n');

// Configuración para base de datos LOCAL
const clientLocal = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

// Configuración para base de datos REMOTA
const clientRemote = new Client({
  host: '206.62.139.100',
  port: 5433,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function applyMigration(client, environment) {
  try {
    console.log(`📡 Conectando a base de datos ${environment}...\n`);
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Paso 1: Agregar columnas
    console.log('📋 Paso 1: Agregar columnas created_at y updated_at...');
    await client.query(`
      ALTER TABLE familias 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ Columnas agregadas\n');

    // Paso 2: Actualizar registros existentes
    console.log('📋 Paso 2: Actualizar registros existentes...');
    const updateResult = await client.query(`
      UPDATE familias 
      SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
          updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
      WHERE created_at IS NULL OR updated_at IS NULL
    `);
    console.log(`  ✅ ${updateResult.rowCount} registros actualizados\n`);

    // Paso 3: Crear función para trigger
    console.log('📋 Paso 3: Crear función de trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_familias_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('  ✅ Función creada\n');

    // Paso 4: Aplicar trigger
    console.log('📋 Paso 4: Aplicar trigger...');
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_familias_timestamp ON familias
    `);
    await client.query(`
      CREATE TRIGGER trigger_update_familias_timestamp
          BEFORE UPDATE ON familias
          FOR EACH ROW
          EXECUTE FUNCTION update_familias_updated_at()
    `);
    console.log('  ✅ Trigger aplicado\n');

    // Verificación
    console.log('📋 Paso 5: Verificar estructura...');
    const verifyResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name IN ('created_at', 'updated_at')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Estructura actual de timestamps:');
    console.table(verifyResult.rows);

    console.log(`\n✅ ¡Migración completada exitosamente en ${environment}!`);
    console.log('======================================================================\n');

  } catch (error) {
    console.error(`\n❌ Error en ${environment}:`, error.message);
    throw error;
  } finally {
    await client.end();
    console.log(`📡 Conexión ${environment} cerrada\n`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'local'; // 'local', 'remote', o 'both'

  try {
    if (target === 'both' || target === 'local') {
      console.log('🔹 APLICANDO MIGRACIÓN EN BASE DE DATOS LOCAL\n');
      await applyMigration(clientLocal, 'LOCAL (localhost:5432)');
    }

    if (target === 'both' || target === 'remote') {
      console.log('\n🔹 APLICANDO MIGRACIÓN EN BASE DE DATOS REMOTA\n');
      await applyMigration(clientRemote, 'REMOTA (206.62.139.100:5433)');
    }

    console.log('\n✅ ¡Todas las migraciones completadas!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migración fallida\n');
    process.exit(1);
  }
}

main();
