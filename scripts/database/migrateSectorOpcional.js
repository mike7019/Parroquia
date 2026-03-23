/**
 * 🔄 MIGRACIÓN: Sector Opcional en Familias
 *
 * Fecha: 2026-03-22
 * Descripción: Permite valores NULL en la columna sector de la tabla familias
 *
 * Uso:
 *   npm run migrate:sector-opcional
 *   o directamente: node scripts/database/migrateSectorOpcional.js
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Sequelize
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'parroquia_db',
  port: parseInt(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: console.log
});

async function ejecutarMigracion() {
  try {
    console.log('🔧 Iniciando migración: Sector Opcional en Familias');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('🖥️  Host:', process.env.DB_HOST);
    console.log('');

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    console.log('');

    // Verificar estado actual de la columna sector
    console.log('📋 Verificando estado actual de la columna sector...');
    const [columnCheck] = await sequelize.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name = 'sector'
      ORDER BY column_name;
    `);

    if (columnCheck.length === 0) {
      console.log('❌ Error: No se encontró la columna sector en la tabla familias');
      process.exit(1);
    }

    const estadoActual = columnCheck[0];
    console.log('\n📊 Estado actual:');
    console.log(`   • ${estadoActual.column_name}: ${estadoActual.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'}`);
    console.log('');

    if (estadoActual.is_nullable === 'YES') {
      console.log('⚠️  La migración ya fue aplicada anteriormente: sector ya permite valores NULL');
    } else {
      console.log('🚀 Ejecutando migración para permitir NULL en sector...');
      await sequelize.query(`
        ALTER TABLE familias 
        ALTER COLUMN sector DROP NOT NULL;
      `);

      await sequelize.query(`
        COMMENT ON COLUMN familias.sector IS 'Sector de la familia (opcional)';
      `);

      console.log('✅ Migración aplicada: sector ahora permite valores NULL');
    }

    // Verificar resultado
    console.log('');
    console.log('🔍 Verificando resultado...');
    const [columnCheckFinal] = await sequelize.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name = 'sector'
      ORDER BY column_name;
    `);

    const estadoFinal = columnCheckFinal[0];
    console.log('\n📊 Estado final:');
    console.log(`   • ${estadoFinal.column_name}: ${estadoFinal.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'} (${estadoFinal.data_type})`);

    console.log('');
    console.log('🎯 Resultado: Las encuestas ahora pueden enviarse sin sector');

  } catch (error) {
    console.error('');
    console.error('❌ Error durante la migración de sector:', error.message);
    console.error('');

    if (error.original) {
      console.error('💡 Error de PostgreSQL:', error.original.message);
    }

    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  MIGRACIÓN: Sector Opcional en Familias');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

ejecutarMigracion();
