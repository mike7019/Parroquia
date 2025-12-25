import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function verificarFamilia() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar datos de la familia
    console.log('📋 DATOS DE LA FAMILIA:');
    const familia = await client.query(`
      SELECT 
        id_familia, apellido_familiar, codigo_familia, 
        id_tipo_vivienda, id_sector, 
        pozo_septico, letrina, campo_abierto,
        disposicion_recolector, disposicion_quemada, 
        disposicion_enterrada, disposicion_recicla, disposicion_aire_libre
      FROM familias 
      WHERE id_familia = 32
    `);
    console.log(familia.rows[0]);

    // Verificar tipo de vivienda
    console.log('\n🏠 TIPO DE VIVIENDA:');
    const tipoVivienda = await client.query(`
      SELECT ftv.*, tv.nombre 
      FROM familia_tipo_vivienda ftv
      LEFT JOIN tipos_vivienda tv ON ftv.id_tipo_vivienda = tv.id_tipo_vivienda
      WHERE ftv.id_familia = 32
    `);
    console.log(tipoVivienda.rows);

    // Verificar disposición de basuras
    console.log('\n🗑️ DISPOSICIÓN DE BASURAS:');
    const basuras = await client.query(`
      SELECT * 
      FROM familia_disposicion_basura
      WHERE id_familia = 32
    `);
    console.log(basuras.rows);

    // Verificar sistema acueducto
    console.log('\n💧 SISTEMA ACUEDUCTO:');
    const acueducto = await client.query(`
      SELECT fsa.*, sa.nombre 
      FROM familia_sistema_acueducto fsa
      LEFT JOIN sistema_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
      WHERE fsa.id_familia = 32
    `);
    console.log(acueducto.rows);

    // Verificar aguas residuales
    console.log('\n🚰 AGUAS RESIDUALES:');
    const aguasResiduales = await client.query(`
      SELECT fsar.*, tar.nombre 
      FROM familia_sistema_aguas_residuales fsar
      LEFT JOIN tipo_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
      WHERE fsar.id_familia = 32
    `);
    console.log(aguasResiduales.rows);

    // Verificar personas
    console.log('\n👥 PERSONAS:');
    const personas = await client.query(`
      SELECT id_personas, nombres, identificacion, id_sexo, id_parentesco, id_profesion
      FROM personas
      WHERE id_familia = 32
      ORDER BY id_personas
    `);
    console.log(personas.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verificarFamilia();
