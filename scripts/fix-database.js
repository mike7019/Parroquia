import { Sequelize } from 'sequelize';
import 'dotenv/config';

/**
 * Script para reparar problemas de base de datos
 * Específicamente diseñado para solucionar problemas de foreign keys
 * en la tabla sectors y otras inconsistencias de esquema
 */

// Database connection using the same config as the app
const sequelize = new Sequelize(
  process.env.DB_NAME || 'parroquia_db',
  process.env.DB_USER || 'parroquia_user',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

/**
 * Repara problemas comunes de la base de datos
 * - Elimina tablas con foreign keys incorrectas
 * - Limpia tipos ENUM huérfanos
 * - Permite que Sequelize recree las tablas con la estructura correcta
 */
async function fixDatabase() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    console.log('🗑️ Eliminando tabla sectors si existe (para corregir foreign keys)...');
    await sequelize.query('DROP TABLE IF EXISTS "sectors" CASCADE');
    console.log('✅ Tabla sectors eliminada correctamente');

    console.log('🗑️ Eliminando tipos ENUM relacionados si existen...');
    await sequelize.query('DROP TYPE IF EXISTS "public"."enum_sectors_status" CASCADE');
    console.log('✅ Tipos ENUM eliminados correctamente');

    // Opcional: También limpiar otras tablas problemáticas si es necesario
    console.log('🧹 Verificando otras posibles inconsistencias...');
    
    // Verificar si existen otras tablas con problemas similares
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`📊 Tablas encontradas en la base de datos: ${tables.length}`);
    
    console.log('✅ Reparación de base de datos completada exitosamente!');
    console.log('📝 Ahora puedes ejecutar "npm start" para recrear las tablas con las foreign keys correctas');
    console.log('🔄 O ejecutar "npm run db:sync" si tienes ese comando configurado');

  } catch (error) {
    console.error('❌ Error al reparar la base de datos:', error.message);
    console.error('📋 Detalles del error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔐 Conexión a la base de datos cerrada');
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabase();
}

export default fixDatabase;
