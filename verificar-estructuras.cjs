/**
 * Script para verificar la estructura de todas las tablas de referencia
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

async function verificarEstructuras() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verificando estructura de tablas de referencia...\n');
    
    const tablas = [
      'personas',
      'familias',
      'difuntos_familia'
    ];
    
    for (const tabla of tablas) {
      console.log(`📋 Tabla: ${tabla}`);
      
      // Obtener columnas
      const cols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tabla]);
      
      console.log(`   Columnas: ${cols.rows.map(r => r.column_name).join(', ')}`);
      
      // Obtener algunos datos de ejemplo
      try {
        const sample = await client.query(`SELECT * FROM ${tabla} LIMIT 2`);
        if (sample.rows.length > 0) {
          console.log(`   Ejemplo 1:`, sample.rows[0]);
          if (sample.rows.length > 1) {
            console.log(`   Ejemplo 2:`, sample.rows[1]);
          }
        } else {
          console.log(`   Sin datos`);
        }
      } catch (error) {
        console.log(`   Error al obtener datos: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
  }
}

// Ejecutar
if (require.main === module) {
  verificarEstructuras()
    .then(() => {
      console.log('✨ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = { verificarEstructuras };
