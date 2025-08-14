/**
 * Script para agregar la columna nombre_vereda a la tabla veredas
 * y poblarla con los datos existentes de la columna nombre
 */
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function addNombreVeredaColumn() {
  console.log('🔧 Agregando columna nombre_vereda a la tabla veredas...\n');
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar si la columna ya existe
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'veredas' AND column_name = 'nombre_vereda'
    `);

    if (columnExists.rows.length > 0) {
      console.log('ℹ️ La columna nombre_vereda ya existe');
    } else {
      // 2. Agregar la columna
      console.log('📝 Agregando columna nombre_vereda...');
      await client.query('ALTER TABLE veredas ADD COLUMN nombre_vereda VARCHAR(255)');
      console.log('✅ Columna nombre_vereda agregada');
    }

    // 3. Poblar la nueva columna con datos de la columna nombre
    console.log('📋 Poblando nombre_vereda con datos de nombre...');
    const result = await client.query(`
      UPDATE veredas 
      SET nombre_vereda = nombre 
      WHERE nombre_vereda IS NULL OR nombre_vereda = ''
    `);
    console.log(`✅ ${result.rowCount} registros actualizados`);

    // 4. Verificar resultado
    console.log('\n📊 Verificando resultado...');
    const verification = await client.query(`
      SELECT id_vereda, nombre, nombre_vereda, codigo_vereda 
      FROM veredas 
      ORDER BY id_vereda 
      LIMIT 5
    `);
    
    console.table(verification.rows);

    console.log('\n✅ ¡Columna agregada y datos migrados exitosamente!');
    console.log('🚀 Ahora el servicio de veredas debería funcionar correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

addNombreVeredaColumn().catch(console.error);
