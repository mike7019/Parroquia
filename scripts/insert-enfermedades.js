const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function insertEnfermedades() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'proyecto_parroquia',
    password: 'password',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlContent = fs.readFileSync(path.join(__dirname, 'insert-enfermedades.sql'), 'utf8');
    
    // Ejecutar la consulta
    const result = await client.query(sqlContent);
    console.log('✅ Enfermedades insertadas exitosamente');
    console.log(`Filas insertadas: ${result.rowCount}`);

    // Verificar la inserción
    const countResult = await client.query('SELECT COUNT(*) FROM enfermedades');
    console.log(`Total de enfermedades en la base de datos: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detalle:', error.detail);
    }
  } finally {
    await client.end();
  }
}

insertEnfermedades();
