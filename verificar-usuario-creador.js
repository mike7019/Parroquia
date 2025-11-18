import pkg from 'pg';
const { Client } = pkg;

async function verificarAguasResiduales() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'parroquia_db',
    user: 'parroquia_user',
    password: 'ParroquiaSecure2025'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Verificar la familia 13
    const result = await client.query(`
      SELECT 
        fsar.id,
        fsar.id_familia,
        fsar.id_tipo_aguas_residuales,
        tar.nombre,
        f.apellido_familiar
      FROM familia_sistema_aguas_residuales fsar
      JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
      JOIN familias f ON fsar.id_familia = f.id_familia
      WHERE fsar.id_familia = 13
      ORDER BY fsar.id
    `);

    console.log('🚰 Aguas residuales de la familia 13:');
    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`  - ${row.nombre} (ID tipo: ${row.id_tipo_aguas_residuales}, ID registro: ${row.id})`);
      });
      console.log(`\n  Total registros: ${result.rows.length}`);
    } else {
      console.log('  ❌ No hay registros de aguas residuales');
    }
    
    // Verificar también el id_usuario_creador
    console.log('\n👤 Usuario creador de la familia 13:');
    const usuario = await client.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_usuario_creador,
        u.primer_nombre,
        u.primer_apellido,
        u.correo_electronico
      FROM familias f
      LEFT JOIN usuarios u ON f.id_usuario_creador = u.id
      WHERE f.id_familia = 13
    `);
    
    if (usuario.rows.length > 0) {
      const fam = usuario.rows[0];
      console.log(`  Familia: ${fam.apellido_familiar}`);
      console.log(`  ID Usuario: ${fam.id_usuario_creador || '❌ NULL'}`);
      console.log(`  Usuario: ${fam.primer_nombre || 'N/A'} ${fam.primer_apellido || ''}`);
      console.log(`  Email: ${fam.correo_electronico || 'N/A'}`);
    }

    // Verificar todos los tipos disponibles
    console.log('\n📋 Tipos de aguas residuales disponibles:');
    const tipos = await client.query(`
      SELECT id_tipo_aguas_residuales, nombre
      FROM tipos_aguas_residuales
      ORDER BY id_tipo_aguas_residuales
    `);
    
    tipos.rows.forEach(tipo => {
      console.log(`  - ${tipo.nombre} (ID: ${tipo.id_tipo_aguas_residuales})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

verificarAguasResiduales();
