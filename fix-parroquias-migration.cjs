const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgresql',
  logging: console.log
});

async function fixParroquiasTable() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Crear la tabla parroquias con la estructura correcta
    console.log('\n🔄 Creando tabla "parroquias" con estructura correcta...');
    
    const createParroquiasTable = `
      CREATE TABLE IF NOT EXISTS "parroquias" (
        "id_parroquia" BIGSERIAL PRIMARY KEY,
        "nombre" VARCHAR(255),
        "id_municipio" BIGINT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    
    await sequelize.query(createParroquiasTable);
    console.log('✅ Tabla "parroquias" creada');

    // Migrar datos de la tabla parroquia (singular) si existe datos
    console.log('\n🔄 Migrando datos de "parroquia" a "parroquias"...');
    
    const migrateData = `
      INSERT INTO "parroquias" (id_parroquia, nombre, id_municipio, created_at, updated_at)
      SELECT id_parroquia, nombre, id_municipio, NOW(), NOW()
      FROM "parroquia"
      ON CONFLICT (id_parroquia) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        id_municipio = EXCLUDED.id_municipio,
        updated_at = NOW()
    `;
    
    await sequelize.query(migrateData);
    console.log('✅ Datos migrados exitosamente');

    // Verificar que los datos estén ahí
    console.log('\n📊 Verificando datos en tabla "parroquias"...');
    const countQuery = 'SELECT COUNT(*) as total FROM "parroquias"';
    const count = await sequelize.query(countQuery);
    console.log(`📈 Total de parroquias: ${count[0][0].total}`);

    // Mostrar algunos registros
    if (count[0][0].total > 0) {
      console.log('\n📋 Primeras parroquias migradas:');
      const sampleQuery = 'SELECT * FROM "parroquias" LIMIT 5';
      const sample = await sequelize.query(sampleQuery);
      console.table(sample[0]);
    }

    // Agregar foreign key constraint si no existe
    console.log('\n🔗 Agregando foreign key constraint...');
    try {
      const addForeignKey = `
        ALTER TABLE "parroquias" 
        ADD CONSTRAINT "fk_parroquias_municipio" 
        FOREIGN KEY ("id_municipio") REFERENCES "municipios"("id_municipio")
      `;
      await sequelize.query(addForeignKey);
      console.log('✅ Foreign key constraint agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraint ya existe');
      } else {
        console.log('⚠️ No se pudo agregar foreign key:', error.message);
      }
    }

    // Crear índice para mejor rendimiento
    console.log('\n📈 Creando índice para id_municipio...');
    try {
      const createIndex = `
        CREATE INDEX IF NOT EXISTS "idx_parroquias_municipio" 
        ON "parroquias"("id_municipio")
      `;
      await sequelize.query(createIndex);
      console.log('✅ Índice creado');
    } catch (error) {
      console.log('⚠️ Error creando índice:', error.message);
    }

    console.log('\n🎉 Migración de parroquias completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixParroquiasTable();
