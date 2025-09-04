#!/usr/bin/env node

/**
 * VERIFICAR COLUMNAS DE TABLA FAMILIAS EN PRODUCCIÓN
 * ================================================
 * 
 * Este script verifica qué columnas de timestamp tiene la tabla familias
 * para corregir el script de producción.
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
};

async function checkFamiliasColumns() {
  console.log('🔍 VERIFICANDO COLUMNAS DE TABLA FAMILIAS');
  console.log('═══════════════════════════════════════════');
  
  const sequelize = new Sequelize(DB_CONFIG);

  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar todas las columnas de la tabla familias
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 COLUMNAS DE LA TABLA FAMILIAS:');
    console.log('─────────────────────────────────────────');
    
    let hasCreatedAt = false;
    let hasUpdatedAt = false;
    let hasCreated_at = false;
    let hasUpdated_at = false;

    columns.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | ${col.is_nullable}`);
      
      if (col.column_name === 'createdAt') hasCreatedAt = true;
      if (col.column_name === 'updatedAt') hasUpdatedAt = true;
      if (col.column_name === 'created_at') hasCreated_at = true;
      if (col.column_name === 'updated_at') hasUpdated_at = true;
    });

    console.log('\n🕒 ANÁLISIS DE TIMESTAMPS:');
    console.log('─────────────────────────────────────────');
    console.log(`createdAt:  ${hasCreatedAt ? '✅ Existe' : '❌ No existe'}`);
    console.log(`updatedAt:  ${hasUpdatedAt ? '✅ Existe' : '❌ No existe'}`);
    console.log(`created_at: ${hasCreated_at ? '✅ Existe' : '❌ No existe'}`);
    console.log(`updated_at: ${hasUpdated_at ? '✅ Existe' : '❌ No existe'}`);

    console.log('\n🎯 FORMATO DETECTADO:');
    if (hasCreated_at && hasUpdated_at) {
      console.log('✅ La tabla familias usa: created_at, updated_at');
    } else if (hasCreatedAt && hasUpdatedAt) {
      console.log('✅ La tabla familias usa: createdAt, updatedAt');
    } else {
      console.log('❌ Formato de timestamps inconsistente o inusual');
    }

    await sequelize.close();
    
  } catch (error) {
    console.error('💥 ERROR:', error.message);
    process.exit(1);
  }
}

checkFamiliasColumns();
