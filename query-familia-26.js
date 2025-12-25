#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;

console.log('🔍 Consultando familia con ID 26');
console.log('======================================================================\n');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function getFamilia26() {
  try {
    console.log('📡 Conectando a base de datos local...\n');
    await client.connect();
    console.log('✅ Conexión establecida\n');

    // Consultar información de la familia
    console.log('📋 Información de la familia:\n');
    const familiaResult = await client.query(`
      SELECT * FROM familias WHERE id_familia = 26
    `);
    
    if (familiaResult.rows.length === 0) {
      console.log('❌ Familia no encontrada');
      await client.end();
      return;
    }

    console.log('FAMILIA:');
    console.log(JSON.stringify(familiaResult.rows[0], null, 2));

    // Consultar personas de la familia
    console.log('\n\n📋 Personas en la familia:\n');
    const personasResult = await client.query(`
      SELECT *
      FROM personas p
      WHERE p.id_familia = 26
      ORDER BY p.id_personas
    `);

    console.log(`Total de personas: ${personasResult.rows.length}\n`);
    personasResult.rows.forEach((persona, index) => {
      console.log(`\n--- PERSONA ${index + 1} ---`);
      console.log(JSON.stringify(persona, null, 2));
    });

    // Consultar habilidades de las personas
    console.log('\n\n📋 Habilidades de las personas:\n');
    const habilidadesResult = await client.query(`
      SELECT ph.*
      FROM persona_habilidad ph
      JOIN personas p ON ph.id_persona = p.id_personas
      WHERE p.id_familia = 26
    `);

    if (habilidadesResult.rows.length > 0) {
      console.log(JSON.stringify(habilidadesResult.rows, null, 2));
    } else {
      console.log('Sin habilidades registradas');
    }

    // Consultar destrezas
    console.log('\n\n📋 Destrezas de las personas:\n');
    const destrezasResult = await client.query(`
      SELECT pd.*
      FROM persona_destreza pd
      JOIN personas p ON pd.id_personas_personas = p.id_personas
      WHERE p.id_familia = 26
    `);

    if (destrezasResult.rows.length > 0) {
      console.log(JSON.stringify(destrezasResult.rows, null, 2));
    } else {
      console.log('Sin destrezas registradas');
    }

    await client.end();
    console.log('\n======================================================================');
    console.log('✅ Consulta completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

getFamilia26();
