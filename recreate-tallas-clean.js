#!/usr/bin/env node
/**
 * Script para recrear completamente la tabla tallas sin comentarios problemáticos
 */

import sequelize from './config/sequelize.js';

async function recreateTallasTable() {
  try {
    console.log('🔧 Recreando tabla tallas completamente...');
    
    // 1. Eliminar la tabla completamente
    await sequelize.query('DROP TABLE IF EXISTS "tallas" CASCADE;');
    console.log('✅ Tabla tallas eliminada');
    
    // 2. Eliminar enums si existen
    await sequelize.query('DROP TYPE IF EXISTS "enum_tallas_tipo_prenda" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_tallas_genero" CASCADE;');
    console.log('✅ Enums eliminados');
    
    // 3. Crear solo el enum que necesitamos
    await sequelize.query(`
      CREATE TYPE "enum_tallas_tipo_prenda" AS ENUM('zapato', 'camisa', 'pantalon');
    `);
    console.log('✅ Enum tipo_prenda creado');
    
    // 4. Crear la tabla manualmente SIN comentarios
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
    console.log('✅ Tabla tallas creada sin comentarios');
    
    // 5. Crear índices únicos
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
    
    // 6. Insertar datos base
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
    console.log('✅ Datos base insertados');
    
    console.log('🎉 Tabla tallas recreada exitosamente sin comentarios problemáticos');
    
  } catch (error) {
    console.error('❌ Error recreando tabla tallas:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
recreateTallasTable()
  .then(() => {
    console.log('✅ Recreación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
