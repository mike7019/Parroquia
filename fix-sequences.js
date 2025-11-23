import pkg from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'parroquia2024',
  database: process.env.DB_NAME || 'parroquia_db'
});

async function fixSequences() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Verificar y arreglar secuencia de personas
    console.log('\n🔧 Arreglando secuencia de personas...');
    const maxPersonaId = await client.query('SELECT MAX(id_personas) as max FROM personas');
    const currentMax = maxPersonaId.rows[0].max || 0;
    console.log(`   Máximo ID actual en personas: ${currentMax}`);
    
    await client.query(`SELECT setval('personas_id_personas_seq', ${currentMax}, true)`);
    console.log(`   ✅ Secuencia personas actualizada a ${currentMax}`);

    // 2. Verificar y arreglar secuencia de familias
    console.log('\n🔧 Arreglando secuencia de familias...');
    const maxFamiliaId = await client.query('SELECT MAX(id_familia) as max FROM familias');
    const currentMaxFamilia = maxFamiliaId.rows[0].max || 0;
    console.log(`   Máximo ID actual en familias: ${currentMaxFamilia}`);
    
    await client.query(`SELECT setval('familias_id_familia_seq', ${currentMaxFamilia}, true)`);
    console.log(`   ✅ Secuencia familias actualizada a ${currentMaxFamilia}`);

    // 3. Verificar y arreglar secuencia de difuntos
    console.log('\n🔧 Arreglando secuencia de difuntos...');
    const maxDifuntoId = await client.query('SELECT MAX(id_difunto) as max FROM difuntos_familia');
    const currentMaxDifunto = maxDifuntoId.rows[0].max || 0;
    console.log(`   Máximo ID actual en difuntos_familia: ${currentMaxDifunto}`);
    
    await client.query(`SELECT setval('difuntos_familia_id_difunto_seq', ${currentMaxDifunto}, true)`);
    console.log(`   ✅ Secuencia difuntos actualizada a ${currentMaxDifunto}`);

    console.log('\n✅ Todas las secuencias han sido arregladas');

    // 4. Verificar próximos valores
    console.log('\n📊 Próximos valores de secuencias:');
    const nextPersona = await client.query("SELECT nextval('personas_id_personas_seq')");
    console.log(`   Próximo ID de persona: ${nextPersona.rows[0].nextval}`);
    
    const nextFamilia = await client.query("SELECT nextval('familias_id_familia_seq')");
    console.log(`   Próximo ID de familia: ${nextFamilia.rows[0].nextval}`);
    
    const nextDifunto = await client.query("SELECT nextval('difuntos_familia_id_difunto_seq')");
    console.log(`   Próximo ID de difunto: ${nextDifunto.rows[0].nextval}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixSequences().catch(console.error);
