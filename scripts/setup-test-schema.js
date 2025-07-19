import { Client } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno de test
dotenv.config({ path: '.env.test' });

const setupTestDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME + '_test'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a base de datos de prueba');

    // Crear ENUM para roles de usuario
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE enum_users_role AS ENUM ('admin', 'user', 'moderator');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla users si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        role enum_users_role DEFAULT 'user',
        "isActive" BOOLEAN DEFAULT true,
        "emailVerified" BOOLEAN DEFAULT false,
        "emailVerificationToken" VARCHAR(255),
        "passwordResetToken" VARCHAR(255),
        "passwordResetExpires" TIMESTAMP WITH TIME ZONE,
        "lastLoginAt" TIMESTAMP WITH TIME ZONE,
        "refreshToken" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Esquema de base de datos de prueba configurado');

  } catch (error) {
    console.error('❌ Error configurando base de datos de prueba:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

setupTestDatabase();
