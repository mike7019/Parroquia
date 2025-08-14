#!/usr/bin/env node
/**
 * Script para arreglar la tabla tallas y su enum tipo_prenda
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  }
);

async function fixTallasTable() {
  try {
    console.log('🔧 Arreglando tabla tallas...');
    
    // 1. Eliminar la tabla si existe
    await sequelize.query('DROP TABLE IF EXISTS "tallas" CASCADE;');
    console.log('✅ Tabla tallas eliminada');
    
    // 2. Eliminar el enum si existe
    await sequelize.query('DROP TYPE IF EXISTS "enum_tallas_tipo_prenda" CASCADE;');
    console.log('✅ Enum tipo_prenda eliminado');
    
    // 3. Crear el enum correctamente
    await sequelize.query(`
      CREATE TYPE "enum_tallas_tipo_prenda" AS ENUM('zapato', 'camisa', 'pantalon');
    `);
    console.log('✅ Enum tipo_prenda creado');
    
    // 4. Crear la tabla desde cero
    await sequelize.query(`
      CREATE TABLE "tallas" (
        "id_talla" BIGSERIAL PRIMARY KEY,
        "tipo_prenda" "enum_tallas_tipo_prenda" NOT NULL,
        "talla" VARCHAR(20) NOT NULL,
        "descripcion" TEXT,
        "genero" VARCHAR(20) NOT NULL DEFAULT 'unisex',
        "equivalencia_numerica" INTEGER,
        "activo" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla tallas creada');
    
    // 5. Crear índices
    await sequelize.query(`
      CREATE UNIQUE INDEX "unique_talla_tipo_genero" ON "tallas" ("tipo_prenda", "talla", "genero");
    `);
    await sequelize.query(`
      CREATE INDEX "idx_tallas_tipo_prenda" ON "tallas" ("tipo_prenda");
    `);
    await sequelize.query(`
      CREATE INDEX "idx_tallas_genero" ON "tallas" ("genero");
    `);
    await sequelize.query(`
      CREATE INDEX "idx_tallas_activo" ON "tallas" ("activo");
    `);
    console.log('✅ Índices creados');
    
    // 6. Insertar algunos datos de ejemplo
    await sequelize.query(`
      INSERT INTO "tallas" ("tipo_prenda", "talla", "genero", "equivalencia_numerica") VALUES
      ('zapato', '35', 'femenino', 35),
      ('zapato', '36', 'femenino', 36),
      ('zapato', '37', 'femenino', 37),
      ('zapato', '38', 'femenino', 38),
      ('zapato', '39', 'femenino', 39),
      ('zapato', '40', 'masculino', 40),
      ('zapato', '41', 'masculino', 41),
      ('zapato', '42', 'masculino', 42),
      ('zapato', '43', 'masculino', 43),
      ('camisa', 'XS', 'unisex', 1),
      ('camisa', 'S', 'unisex', 2),
      ('camisa', 'M', 'unisex', 3),
      ('camisa', 'L', 'unisex', 4),
      ('camisa', 'XL', 'unisex', 5),
      ('pantalon', '28', 'unisex', 28),
      ('pantalon', '30', 'unisex', 30),
      ('pantalon', '32', 'unisex', 32),
      ('pantalon', '34', 'unisex', 34),
      ('pantalon', '36', 'unisex', 36);
    `);
    console.log('✅ Datos de ejemplo insertados');
    
    console.log('🎉 Tabla tallas arreglada exitosamente');
    
  } catch (error) {
    console.error('❌ Error arreglando tabla tallas:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
fixTallasTable()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el script:', error.message);
    process.exit(1);
  });
