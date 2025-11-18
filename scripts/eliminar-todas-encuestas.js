import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function eliminarTodasLasEncuestas() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Obtener todas las familias
    const familiasResult = await client.query(`
      SELECT id_familia, apellido_familiar 
      FROM familias 
      ORDER BY id_familia
    `);

    const familias = familiasResult.rows;
    console.log(`\n📊 Total de familias/encuestas encontradas: ${familias.length}\n`);

    if (familias.length === 0) {
      console.log('✅ No hay encuestas para eliminar');
      return;
    }

    console.log('🗑️ Eliminando encuestas...\n');

    // 2. Eliminar cada familia con sus relaciones
    for (const familia of familias) {
      console.log(`Eliminando familia ${familia.id_familia}: ${familia.apellido_familiar}`);

      try {
        // Iniciar transacción
        await client.query('BEGIN');

        // Contar personas antes de eliminar
        const personasResult = await client.query(
          'SELECT COUNT(*) as total FROM personas WHERE id_familia_familias = $1',
          [familia.id_familia]
        );
        const totalPersonas = parseInt(personasResult.rows[0].total) || 0;

        // Eliminar difuntos_familia
        const difuntosResult = await client.query(
          'DELETE FROM difuntos_familia WHERE id_familia_familias = $1',
          [familia.id_familia]
        );
        
        // Eliminar personas
        const personasDelResult = await client.query(
          'DELETE FROM personas WHERE id_familia_familias = $1',
          [familia.id_familia]
        );

        // Eliminar servicios
        await client.query('DELETE FROM familia_disposicion_basura WHERE id_familia = $1', [familia.id_familia]);
        await client.query('DELETE FROM familia_sistema_acueducto WHERE id_familia = $1', [familia.id_familia]);
        await client.query('DELETE FROM familia_sistema_aguas_residuales WHERE id_familia = $1', [familia.id_familia]);
        await client.query('DELETE FROM familia_tipo_vivienda WHERE id_familia = $1', [familia.id_familia]);

        // Eliminar familia
        await client.query('DELETE FROM familias WHERE id_familia = $1', [familia.id_familia]);

        // Confirmar transacción
        await client.query('COMMIT');

        console.log(`  ✅ Eliminada - ${totalPersonas} personas, ${difuntosResult.rowCount} difuntos\n`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Error eliminando familia ${familia.id_familia}:`, error.message);
      }
    }

    // 3. Verificar que se eliminaron todas
    const verificacionResult = await client.query('SELECT COUNT(*) as total FROM familias');
    const totalRestante = parseInt(verificacionResult.rows[0].total) || 0;

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Proceso completado`);
    console.log(`📊 Familias eliminadas: ${familias.length}`);
    console.log(`📊 Familias restantes: ${totalRestante}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

eliminarTodasLasEncuestas();
