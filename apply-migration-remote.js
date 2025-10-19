/**
 * Script para aplicar migración de corregimientos en base de datos remota
 * Uso: node apply-migration-remote.js
 */

import { Client } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config();

const REMOTE_DB_CONFIG = {
  host: process.env.REMOTE_DB_HOST || '206.62.139.11',
  port: process.env.REMOTE_DB_PORT || 5432,
  database: process.env.REMOTE_DB_NAME || 'parroquia_db',
  user: process.env.REMOTE_DB_USER || 'parroquia_user',
  password: process.env.REMOTE_DB_PASSWORD,
  ssl: false // Cambiar a true si el servidor requiere SSL
};

async function applyMigration() {
  console.log('═'.repeat(80));
  console.log('🗃️  APLICANDO MIGRACIÓN DE CORREGIMIENTOS EN BASE DE DATOS REMOTA');
  console.log('═'.repeat(80));
  console.log('');

  // Validar que tengamos las credenciales
  if (!REMOTE_DB_CONFIG.password) {
    console.error('❌ ERROR: No se encontró REMOTE_DB_PASSWORD en las variables de entorno');
    console.log('');
    console.log('Por favor, configura las variables de entorno:');
    console.log('  REMOTE_DB_HOST=206.62.139.11');
    console.log('  REMOTE_DB_PORT=5432');
    console.log('  REMOTE_DB_NAME=parroquia_db');
    console.log('  REMOTE_DB_USER=parroquia_user');
    console.log('  REMOTE_DB_PASSWORD=tu_contraseña');
    console.log('');
    process.exit(1);
  }

  console.log('📋 Configuración de conexión:');
  console.log(`   Host: ${REMOTE_DB_CONFIG.host}`);
  console.log(`   Puerto: ${REMOTE_DB_CONFIG.port}`);
  console.log(`   Base de datos: ${REMOTE_DB_CONFIG.database}`);
  console.log(`   Usuario: ${REMOTE_DB_CONFIG.user}`);
  console.log('');

  const client = new Client(REMOTE_DB_CONFIG);

  try {
    console.log('🔌 Conectando a la base de datos remota...');
    await client.connect();
    console.log('✅ Conexión establecida');
    console.log('');

    // Leer el archivo SQL de migración
    const sqlFile = join(__dirname, 'migrations', 'add-corregimientos-table.sql');
    console.log(`📄 Leyendo migración desde: ${sqlFile}`);
    const migrationSQL = readFileSync(sqlFile, 'utf8');
    console.log('');

    console.log('⚙️  Ejecutando migración...');
    console.log('─'.repeat(80));
    
    // Ejecutar la migración
    await client.query(migrationSQL);
    
    console.log('─'.repeat(80));
    console.log('✅ Migración ejecutada exitosamente');
    console.log('');

    // Verificar que la tabla existe
    console.log('🔍 Verificando tabla corregimientos...');
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'corregimientos'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('✅ Tabla corregimientos existe');
      
      // Contar registros
      const count = await client.query('SELECT COUNT(*) as total FROM corregimientos');
      console.log(`📊 Registros en corregimientos: ${count.rows[0].total}`);
    } else {
      console.log('❌ La tabla corregimientos NO existe');
    }
    console.log('');

    // Verificar columna en familias
    console.log('🔍 Verificando columna id_corregimiento en familias...');
    const checkColumn = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'familias' 
        AND column_name = 'id_corregimiento'
      );
    `);
    
    if (checkColumn.rows[0].exists) {
      console.log('✅ Columna id_corregimiento existe en tabla familias');
    } else {
      console.log('❌ La columna id_corregimiento NO existe en familias');
    }
    console.log('');

    // Verificar foreign key
    console.log('🔍 Verificando foreign key...');
    const checkFK = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'familias'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'fk_familias_corregimiento';
    `);
    
    if (checkFK.rows.length > 0) {
      console.log('✅ Foreign key fk_familias_corregimiento configurada');
    } else {
      console.log('⚠️  Foreign key no encontrada (puede ser normal si usa otro nombre)');
    }
    console.log('');

    console.log('═'.repeat(80));
    console.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('═'.repeat(80));
    console.log('');
    console.log('📝 Próximos pasos:');
    console.log('1. Reinicia la aplicación en el servidor: pm2 restart parroquia-api');
    console.log('2. Verifica los endpoints:');
    console.log('   - GET http://206.62.139.11:3000/api/catalog/corregimientos');
    console.log('   - POST http://206.62.139.11:3000/api/encuesta (con campo corregimiento)');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═'.repeat(80));
    console.error('❌ ERROR AL APLICAR MIGRACIÓN');
    console.error('═'.repeat(80));
    console.error('');
    console.error('Mensaje:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 No se pudo conectar al servidor de base de datos');
      console.error('   Verifica que:');
      console.error('   - El servidor esté accesible desde tu red');
      console.error('   - El puerto 5432 esté abierto');
      console.error('   - Las credenciales sean correctas');
    } else if (error.code === '42P07') {
      console.error('ℹ️  La tabla ya existe - esto es normal');
      console.error('   La migración es idempotente y no eliminará datos');
    }
    
    console.error('');
    process.exit(1);
    
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
applyMigration().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
