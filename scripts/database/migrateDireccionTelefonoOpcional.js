/**
 * 🔄 MIGRACIÓN: Dirección y Teléfono Opcionales en Familias
 * 
 * Fecha: 2026-03-09
 * Descripción: Permite valores NULL en direccion_familia y numero_contacto
 * 
 * Uso:
 *   npm run migrate:direccion-telefono
 *   o directamente: node scripts/database/migrateDireccionTelefonoOpcional.js
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.log('🔧 Iniciando migración: Dirección y Teléfono Opcionales');
    console.log('📊 Base de datos:', process.env.DB_NAME);
    console.log('🖥️  Host:', process.env.DB_HOST);
    console.log('');

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    console.log('');

    // Verificar estado actual de la columna
    console.log('📋 Verificando estado actual de las columnas...');
    const [columnCheck] = await sequelize.query(`
      SELECT 
        column_name,
        is_nullable,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'familias' 
        AND column_name IN ('direccion_familia', 'numero_contacto')
      ORDER BY column_name;
    `);

    if (columnCheck.length === 0) {
      console.log('❌ Error: No se encontraron las columnas en la tabla familias');
      process.exit(1);
    }

    console.log('\n📊 Estado actual:');
    columnCheck.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'}`);
    });
    console.log('');

    // Verificar si ya se aplicó la migración
    const direccionActual = columnCheck.find(c => c.column_name === 'direccion_familia');
    if (direccionActual && direccionActual.is_nullable === 'YES') {
      console.log('⚠️  La migración ya fue aplicada anteriormente');
      console.log('   direccion_familia ya permite valores NULL');
      
      // Preguntar si desea continuar de todas formas
      console.log('\n¿Desea actualizar los comentarios de las columnas de todas formas? (continuar en 3 segundos...)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Ejecutar migración
    console.log('🚀 Ejecutando migración...');
    console.log('');

    // 1. Permitir NULL en direccion_familia
    console.log('   1️⃣  Modificando columna direccion_familia...');
    await sequelize.query(`
      ALTER TABLE familias 
      ALTER COLUMN direccion_familia DROP NOT NULL;
    `);
    console.log('      ✅ direccion_familia ahora permite NULL');

    // 2. Actualizar comentarios (documentación)
    console.log('   2️⃣  Actualizando comentarios de columnas...');
    await sequelize.query(`
      COMMENT ON COLUMN familias.direccion_familia IS 'Dirección de la familia (opcional)';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN familias.numero_contacto IS 'Número de contacto de la familia (opcional)';
    `);
    console.log('      ✅ Comentarios actualizados');

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
        AND column_name IN ('direccion_familia', 'numero_contacto')
      ORDER BY column_name;
    `);

    console.log('\n📊 Estado final:');
    columnCheckFinal.forEach(col => {
      console.log(`   • ${col.column_name}: ${col.is_nullable === 'YES' ? '✅ NULL permitido' : '❌ NOT NULL'} (${col.data_type})`);
    });

    // Verificar si hay registros con valores NULL
    const [countCheck] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(direccion_familia) as con_direccion,
        COUNT(*) - COUNT(direccion_familia) as sin_direccion,
        COUNT(numero_contacto) as con_telefono,
        COUNT(*) - COUNT(numero_contacto) as sin_telefono
      FROM familias;
    `);

    if (countCheck.length > 0) {
      const stats = countCheck[0];
      console.log('\n📊 Estadísticas de familias:');
      console.log(`   • Total de familias: ${stats.total}`);
      console.log(`   • Con dirección: ${stats.con_direccion}`);
      console.log(`   • Sin dirección: ${stats.sin_direccion}`);
      console.log(`   • Con teléfono: ${stats.con_telefono}`);
      console.log(`   • Sin teléfono: ${stats.sin_telefono}`);
    }

    console.log('');
    console.log('✅ Migración completada exitosamente');
    console.log('');
    console.log('📝 Cambios aplicados:');
    console.log('   • direccion_familia: Ahora acepta valores NULL');
    console.log('   • numero_contacto: Ya aceptaba NULL (sin cambios)');
    console.log('   • Comentarios actualizados para ambas columnas');
    console.log('');
    console.log('🎯 Resultado: Las encuestas ahora pueden enviarse sin dirección ni teléfono');

  } catch (error) {
    console.error('');
    console.error('❌ Error durante la migración:', error.message);
    console.error('');
    
    if (error.original) {
      console.error('💡 Error de PostgreSQL:', error.original.message);
    }
    
    console.error('');
    console.error('📋 Verifique:');
    console.error('   1. Las credenciales de base de datos en el archivo .env');
    console.error('   2. Que la tabla "familias" existe');
    console.error('   3. Que tiene permisos para modificar la tabla');
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
console.log('═══════════════════════════════════════════════════════════');
console.log('  MIGRACIÓN: Dirección y Teléfono Opcionales');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

ejecutarMigracion();
