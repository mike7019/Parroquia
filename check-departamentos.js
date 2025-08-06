import { Client } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'admin'
});

async function checkDepartamentosTable() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');
    
    console.log('\n📋 Estructura de la tabla departamentos:');
    console.log('=' .repeat(80));
    
    // Obtener estructura de la tabla
    const tableStructure = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'departamentos' 
      ORDER BY ordinal_position;
    `);
    
    if (tableStructure.rows.length === 0) {
      console.log('❌ La tabla "departamentos" no existe');
      return;
    }
    
    console.table(tableStructure.rows);
    
    // Mostrar algunos registros de ejemplo
    console.log('\n📊 Datos existentes:');
    const countResult = await client.query('SELECT COUNT(*) as total FROM departamentos');
    console.log(`Total de departamentos: ${countResult.rows[0].total}`);
    
    if (parseInt(countResult.rows[0].total) > 0) {
      console.log('\n📄 Primeros 3 registros:');
      const sampleData = await client.query('SELECT * FROM departamentos LIMIT 3');
      console.table(sampleData.rows);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Conexión cerrada');
  }
}

// Ejecutar la verificación
checkDepartamentosTable().catch(console.error);
