/**
 * 🔄 MIGRACIÓN: Dirección Opcional en Personas
 *
 * Fecha: 2026-03-23
 * Descripción: Permite valores NULL en la columna direccion de la tabla personas
 *
 * Uso:
 *   npm run migrate:direccion-persona
 *   o directamente: node scripts/database/migrateDireccionPersonaOpcional.js
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
    console.log('🔧 Iniciando migración: Dirección Opcional en Personas');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('🖥️  Host:', process.env.DB_HOST);
    console.log('');

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    console.log('');

    // Verificar estado actual de la columna direccion
    console.log('📋 Verificando estado actual de la columna direccion...');
    const [columnCheck] = await sequelize.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'personas' 
        AND column_name = 'direccion'
      ORDER BY column_name;
    `);

    if (columnCheck.length === 0) {
      console.log('❌ Error: No se encontró la columna direccion en la tabla personas');
      process.exit(1);
    }

    const estadoActual = columnCheck[0];
    console.log('\n📊 Estado actual:');
    console.log(`   • ${estadoActual.column_name}: ${estadoActual.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'}`);
    console.log('');

    if (estadoActual.is_nullable === 'YES') {
      console.log('⚠️  La migración ya fue aplicada anteriormente: direccion ya permite valores NULL');
    } else {
      console.log('🚀 Ejecutando migración para permitir NULL en direccion...');
      await sequelize.query(`
        ALTER TABLE personas 
        ALTER COLUMN direccion DROP NOT NULL;
      `);

      await sequelize.query(`
        COMMENT ON COLUMN personas.direccion IS 'Dirección de la persona (opcional)';
      `);

      console.log('✅ Migración aplicada: direccion ahora permite valores NULL');
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
      WHERE table_name = 'personas' 
        AND column_name = 'direccion'
      ORDER BY column_name;
    `);

    const estadoFinal = columnCheckFinal[0];
    console.log('\n📊 Estado final:');
    console.log(`   • ${estadoFinal.column_name}: ${estadoFinal.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'} (${estadoFinal.data_type})`);

    console.log('');
    console.log('🎯 Resultado: Las personas ahora pueden guardarse sin dirección');

  } catch (error) {
    console.error('');
    console.error('❌ Error durante la migración de direccion en personas:', error.message);
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
console.log('  MIGRACIÓN: Dirección Opcional en Personas');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

ejecutarMigracion();
