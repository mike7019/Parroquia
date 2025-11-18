import pkg from 'pg';
const { Client } = pkg;

async function verificarUsuarioCreador() {
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

    // Verificar la familia 11
    const result = await client.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_usuario_creador,
        u.correo_electronico,
        u.primer_nombre,
        u.primer_apellido
      FROM familias f
      LEFT JOIN usuarios u ON f.id_usuario_creador = u.id
      WHERE f.id_familia = 11
    `);

    if (result.rows.length > 0) {
      const familia = result.rows[0];
      console.log('📋 Familia 11:');
      console.log('  Apellido:', familia.apellido_familiar);
      console.log('  ID Usuario Creador:', familia.id_usuario_creador || '❌ NULL');
      console.log('  Email Usuario:', familia.correo_electronico || 'N/A');
      console.log('  Nombre Usuario:', familia.primer_nombre || 'N/A', familia.primer_apellido || '');
    } else {
      console.log('❌ No se encontró la familia 11');
    }

    // Verificar últimas 3 familias
    console.log('\n📊 Últimas 3 familias creadas:');
    const lastFamilias = await client.query(`
      SELECT 
        f.id_familia,
        f.apellido_familiar,
        f.id_usuario_creador,
        u.primer_nombre,
        u.primer_apellido
      FROM familias f
      LEFT JOIN usuarios u ON f.id_usuario_creador = u.id
      ORDER BY f.id_familia DESC
      LIMIT 3
    `);

    lastFamilias.rows.forEach(fam => {
      console.log(`\n  Familia ${fam.id_familia} (${fam.apellido_familiar}):`);
      console.log(`    id_usuario_creador: ${fam.id_usuario_creador || '❌ NULL'}`);
      console.log(`    Usuario: ${fam.primer_nombre || 'N/A'} ${fam.primer_apellido || ''}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Conexión cerrada');
  }
}

verificarUsuarioCreador();
