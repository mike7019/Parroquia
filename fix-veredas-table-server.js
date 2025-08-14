/**
 * Script para corregir la estructura de veredas en el servidor
 * Agrega la columna nombre_vereda y migra los datos
 */
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function fixVeredasTable() {
  console.log('🔧 Corrigiendo estructura de tabla veredas en el servidor...\n');
  
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

    // 1. Verificar estado actual
    console.log('\n📊 Estado actual de la tabla:');
    const currentData = await client.query('SELECT id_vereda, nombre, codigo_vereda FROM veredas LIMIT 5');
    console.table(currentData.rows);

    // 2. Agregar columna nombre_vereda si no existe
    console.log('\n🔧 Agregando columna nombre_vereda...');
    try {
      await client.query('ALTER TABLE veredas ADD COLUMN nombre_vereda VARCHAR(255)');
      console.log('✅ Columna nombre_vereda agregada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ La columna nombre_vereda ya existe');
      } else {
        throw error;
      }
    }

    // 3. Migrar datos de 'nombre' a 'nombre_vereda'
    console.log('\n📋 Migrando datos de "nombre" a "nombre_vereda"...');
    await client.query('UPDATE veredas SET nombre_vereda = nombre WHERE nombre_vereda IS NULL');
    console.log('✅ Datos migrados');

    // 4. Hacer nombre_vereda NOT NULL después de migrar datos
    console.log('\n🔒 Configurando nombre_vereda como NOT NULL...');
    await client.query('ALTER TABLE veredas ALTER COLUMN nombre_vereda SET NOT NULL');
    console.log('✅ Columna configurada como NOT NULL');

    // 5. Verificar resultado final
    console.log('\n📊 Estado final de la tabla:');
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'veredas' 
      ORDER BY ordinal_position
    `);
    console.table(finalStructure.rows);

    console.log('\n📋 Datos verificados:');
    const verifiedData = await client.query('SELECT id_vereda, nombre, nombre_vereda, codigo_vereda FROM veredas LIMIT 3');
    console.table(verifiedData.rows);

    console.log('\n✅ ¡Corrección completada exitosamente!');
    console.log('🚀 El servicio de veredas debería funcionar ahora correctamente');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await client.end();
  }
}

fixVeredasTable().catch(console.error);
