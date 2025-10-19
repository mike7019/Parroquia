/**
 * Script para crear la tabla corregimientos y agregar la columna id_corregimiento a familias
 * 
 * USO: node migracion-corregimientos.js
 * 
 * NOTA: Cambia host, database, username, password según tu entorno
 */

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  logging: console.log
});

async function crearTablaCorregimientos() {
  try {
    console.log('🔧 MIGRACIÓN: Crear tabla corregimientos y actualizar familias');
    console.log('='.repeat(70));
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Crear tabla corregimientos
    console.log('1️⃣ Creando tabla corregimientos...\n');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS corregimientos (
        id_corregimiento BIGSERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        codigo_corregimiento VARCHAR(50) UNIQUE,
        id_municipio_municipios BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_corregimiento_municipio
          FOREIGN KEY (id_municipio_municipios)
          REFERENCES municipios(id_municipio)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      );
    `);

    console.log('✅ Tabla corregimientos creada\n');

    // 2. Crear índices
    console.log('2️⃣ Creando índices...\n');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_corregimientos_municipio 
      ON corregimientos(id_municipio_municipios);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_corregimientos_nombre 
      ON corregimientos(nombre);
    `);

    console.log('✅ Índices creados\n');

    // 3. Agregar columna id_corregimiento a familias
    console.log('3️⃣ Agregando columna id_corregimiento a tabla familias...\n');
    
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='familias' AND column_name='id_corregimiento'
        ) THEN
          ALTER TABLE familias 
          ADD COLUMN id_corregimiento BIGINT;
        END IF;
      END $$;
    `);

    console.log('✅ Columna id_corregimiento agregada a familias\n');

    // 4. Crear foreign key y índice
    console.log('4️⃣ Creando foreign key e índice en familias...\n');
    
    await sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'fk_familias_corregimiento'
        ) THEN
          ALTER TABLE familias
          ADD CONSTRAINT fk_familias_corregimiento
          FOREIGN KEY (id_corregimiento)
          REFERENCES corregimientos(id_corregimiento)
          ON DELETE SET NULL
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_familias_corregimiento 
      ON familias(id_corregimiento);
    `);

    console.log('✅ Foreign key e índice creados\n');

    // 5. Insertar datos de prueba
    console.log('5️⃣ Insertando corregimientos de prueba...\n');
    
    // Obtener un municipio para la prueba
    const [municipios] = await sequelize.query(`
      SELECT id_municipio FROM municipios LIMIT 1;
    `);

    if (municipios.length > 0) {
      const municipioId = municipios[0].id_municipio;
      
      console.log(`   📍 Usando municipio ID: ${municipioId}\n`);

      // Insertar uno por uno para mejor control
      try {
        await sequelize.query(`
          INSERT INTO corregimientos (nombre, codigo_corregimiento, id_municipio_municipios)
          VALUES ('Corregimiento El Centro', 'COR-001', ${municipioId})
          ON CONFLICT (codigo_corregimiento) DO NOTHING;
        `);
        console.log('   ✅ Corregimiento 1 insertado');

        await sequelize.query(`
          INSERT INTO corregimientos (nombre, codigo_corregimiento, id_municipio_municipios)
          VALUES ('Corregimiento La Esperanza', 'COR-002', ${municipioId})
          ON CONFLICT (codigo_corregimiento) DO NOTHING;
        `);
        console.log('   ✅ Corregimiento 2 insertado');

        await sequelize.query(`
          INSERT INTO corregimientos (nombre, codigo_corregimiento, id_municipio_municipios)
          VALUES ('Corregimiento San Antonio', 'COR-003', ${municipioId})
          ON CONFLICT (codigo_corregimiento) DO NOTHING;
        `);
        console.log('   ✅ Corregimiento 3 insertado\n');
        
      } catch (insertError) {
        console.log('   ℹ️  Corregimientos ya existen (ok)\n');
      }
    } else {
      console.log('⚠️  No hay municipios para insertar datos de prueba\n');
    }

    // 6. Verificar resultado
    console.log('6️⃣ Verificando resultado...\n');
    
    const [corregimientos] = await sequelize.query(`
      SELECT c.*, m.nombre_municipio 
      FROM corregimientos c
      LEFT JOIN municipios m ON c.id_municipio_municipios = m.id_municipio
      ORDER BY c.id_corregimiento;
    `);

    console.log('📊 Corregimientos creados:');
    console.log('┌────┬─────────────────────────────┬──────────────┬──────────────────────┐');
    console.log('│ ID │ Nombre                      │ Código       │ Municipio            │');
    console.log('├────┼─────────────────────────────┼──────────────┼──────────────────────┤');
    corregimientos.forEach(c => {
      const id = String(c.id_corregimiento).padStart(2, ' ');
      const nombre = c.nombre.substring(0, 27).padEnd(27, ' ');
      const codigo = (c.codigo_corregimiento || 'N/A').substring(0, 12).padEnd(12, ' ');
      const municipio = (c.nombre_municipio || 'N/A').substring(0, 20).padEnd(20, ' ');
      console.log(`│ ${id} │ ${nombre} │ ${codigo} │ ${municipio} │`);
    });
    console.log('└────┴─────────────────────────────┴──────────────┴──────────────────────┘\n');

    console.log('='.repeat(70));
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');
    console.log('💡 PRÓXIMOS PASOS:');
    console.log('   1. Ejecutar: node test-corregimientos-crud.js');
    console.log('   2. Probar endpoints en Swagger: http://localhost:3000/api-docs');
    console.log('   3. Tag de Swagger: "Corregimientos"\n');

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

crearTablaCorregimientos();
