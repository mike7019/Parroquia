import { Client } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.test' });

const createTestDatabase = async () => {
  // Conectar como postgres sin especificar base de datos
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'password',
    database: 'postgres' // Usar postgres por defecto
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Verificar si la base de datos existe
    const testDbName = process.env.DB_NAME + '_test';
    const checkDb = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [testDbName]);

    if (checkDb.rows.length === 0) {
      // Crear la base de datos de test
      await client.query(`CREATE DATABASE "${testDbName}"`);
      console.log(`✅ Base de datos de prueba "${testDbName}" creada exitosamente`);
    } else {
      console.log(`ℹ️  Base de datos de prueba "${testDbName}" ya existe`);
    }

  } catch (error) {
    console.error('❌ Error creando base de datos de prueba:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

createTestDatabase();
