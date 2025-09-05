/**
 * Script para corregir la secuencia de id_difunto en difuntos_familia
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDifuntosSequence() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Corrigiendo secuencia de id_difunto...');
    
    // 1. Crear secuencia
    console.log('➕ Creando secuencia difuntos_familia_id_difunto_seq...');
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS difuntos_familia_id_difunto_seq
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
    `);
    
    // 2. Configurar la columna para usar la secuencia
    console.log('🔗 Configurando id_difunto para usar la secuencia...');
    await client.query(`
      ALTER TABLE difuntos_familia 
      ALTER COLUMN id_difunto SET DEFAULT nextval('difuntos_familia_id_difunto_seq'::regclass);
    `);
    
    // 3. Asociar la secuencia con la columna
    console.log('🔗 Asociando secuencia con la columna...');
    await client.query(`
      ALTER SEQUENCE difuntos_familia_id_difunto_seq OWNED BY difuntos_familia.id_difunto;
    `);
    
    // 4. Verificar configuración
    const verification = await client.query(`
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'difuntos_familia' AND column_name = 'id_difunto';
    `);
    
    console.log('✅ Configuración verificada:', verification.rows[0]);
    
    console.log('🎉 ¡Secuencia corregida exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar
if (require.main === module) {
  fixDifuntosSequence()
    .then(() => {
      console.log('✨ Corrección completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { fixDifuntosSequence };
