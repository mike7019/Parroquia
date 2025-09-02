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

async function checkParroquiasTable() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar qué tablas existen relacionadas con parroquias
    console.log('🔍 Verificando tablas relacionadas con parroquias...');
    
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE '%parroquia%'
      ORDER BY table_name
    `;
    
    const tables = await sequelize.query(tablesQuery);
    console.log('📊 Tablas encontradas relacionadas con parroquias:');
    console.table(tables[0]);

    // Verificar todas las tablas de la BD
    console.log('\n📋 Verificando todas las tablas de la base de datos...');
    const allTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const allTables = await sequelize.query(allTablesQuery);
    console.log('📊 Todas las tablas:');
    console.table(allTables[0]);

    // Verificar la estructura de la tabla parroquia si existe
    const parroquiaTableCheck = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'parroquia'
    `;
    
    const parroquiaExists = await sequelize.query(parroquiaTableCheck);
    
    if (parroquiaExists[0].length > 0) {
      console.log('\n🔍 Verificando estructura de la tabla "parroquia"...');
      
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parroquia'
        ORDER BY ordinal_position
      `;
      
      const columns = await sequelize.query(columnsQuery);
      console.log('📊 Columnas de la tabla "parroquia":');
      console.table(columns[0]);
    } else {
      console.log('❌ La tabla "parroquia" no existe');
    }

    // Crear la tabla parroquias si no existe
    console.log('\n🔄 Intentando crear tabla "parroquias" si no existe...');
    
    const createParroquiasTable = `
      CREATE TABLE IF NOT EXISTS "parroquias" (
        "id_parroquia" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(255) NOT NULL,
        "id_municipio" INTEGER NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY ("id_municipio") REFERENCES "municipios"("id_municipio")
      )
    `;
    
    await sequelize.query(createParroquiasTable);
    console.log('✅ Tabla "parroquias" creada/verificada');

    // Si existe la tabla "parroquia" (singular), migrar datos
    if (parroquiaExists[0].length > 0) {
      console.log('\n🔄 Migrando datos de "parroquia" a "parroquias"...');
      
      const migrateData = `
        INSERT INTO "parroquias" (id_parroquia, nombre, id_municipio, created_at, updated_at)
        SELECT id_parroquia, nombre, id_municipio, 
               COALESCE(created_at, NOW()), 
               COALESCE(updated_at, NOW())
        FROM "parroquia"
        ON CONFLICT (id_parroquia) DO NOTHING
      `;
      
      await sequelize.query(migrateData);
      console.log('✅ Datos migrados de "parroquia" a "parroquias"');
    }

    // Verificar que los datos estén ahí
    console.log('\n📊 Verificando datos en tabla "parroquias"...');
    const countQuery = 'SELECT COUNT(*) as total FROM "parroquias"';
    const count = await sequelize.query(countQuery);
    console.log(`📈 Total de parroquias: ${count[0][0].total}`);

    console.log('\n🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkParroquiasTable();
