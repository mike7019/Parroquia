/**
 * Script para agregar la columna 'comunionEnCasa' a la tabla 'familias'
 * Ejecutar con: node add-comunion-en-casa-column.js
 */

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔧 Iniciando script para agregar columna comunionEnCasa...');

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function addComunionEnCasaColumn() {
  try {
    console.log('📡 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar si la columna ya existe
    console.log('🔍 Verificando si la columna comunionEnCasa ya existe...');
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'comunionEnCasa'
    `);

    if (results.length > 0) {
      console.log('⚠️ La columna comunionEnCasa ya existe en la tabla familias');
      return;
    }

    // Agregar la columna
    console.log('➕ Agregando columna comunionEnCasa a la tabla familias...');
    await sequelize.query(`
      ALTER TABLE familias 
      ADD COLUMN "comunionEnCasa" BOOLEAN DEFAULT FALSE;
    `);

    console.log('✅ Columna comunionEnCasa agregada exitosamente');

    // Agregar comentario a la columna
    console.log('📝 Agregando comentario a la columna...');
    await sequelize.query(`
      COMMENT ON COLUMN familias."comunionEnCasa" IS 'Indica si la familia realiza comunión en casa';
    `);

    console.log('✅ Comentario agregado exitosamente');

    // Verificar que la columna se agregó correctamente
    console.log('🔍 Verificando que la columna se agregó correctamente...');
    const [verification] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'comunionEnCasa'
    `);

    if (verification.length > 0) {
      console.log('✅ Verificación exitosa. Detalles de la columna:');
      console.log(verification[0]);
    } else {
      console.log('❌ Error: No se pudo verificar la columna');
    }

    console.log('🎉 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error al agregar la columna:', error);
    
    if (error.original) {
      console.error('💡 Error original:', error.original.message);
    }
    
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar el script
addComunionEnCasaColumn();
