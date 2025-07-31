import pg from 'pg';

const client = new pg.Client({
  user: 'parroquia_user',
  password: 'admin',
  host: 'localhost',
  database: 'parroquia_db',
  port: 5432
});

async function completeMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Clean up invalid records
    await client.query("DELETE FROM tipo_identificacion WHERE descripcion = 'Contraseña' OR codigo IS NULL");
    console.log('Cleaned up invalid records');

    // Define missing identification types
    const newTypes = [
      { descripcion: 'Cédula de Extranjería', codigo: 'CE' },
      { descripcion: 'Permiso Especial de Permanencia', codigo: 'PEP' },
      { descripcion: 'Documento de Identificación Extranjero', codigo: 'DIE' },
      { descripcion: 'Cédula de Ciudadanía Digital', codigo: 'CCD' }
    ];

    // Insert new types
    for (const type of newTypes) {
      try {
        await client.query(
          'INSERT INTO tipo_identificacion (descripcion, codigo) VALUES ($1, $2)',
          [type.descripcion, type.codigo]
        );
        console.log(`Added: ${type.codigo} - ${type.descripcion}`);
      } catch (e) {
        if (e.code === '23505') { // Unique constraint violation
          console.log(`Skipping ${type.codigo} - already exists`);
        } else {
          throw e;
        }
      }
    }

    // Mark migration as completed
    await client.query(
      "INSERT INTO \"SequelizeMeta\" (name) VALUES ('20250730000000-update-tipo-identificacion-table.cjs') ON CONFLICT (name) DO NOTHING"
    );
    console.log('Migration marked as completed');

    // Show final state
    const result = await client.query('SELECT * FROM tipo_identificacion ORDER BY id_tipo_identificacion');
    console.log('\nFinal identification types:');
    result.rows.forEach(row => {
      console.log(`${row.id_tipo_identificacion}: ${row.codigo} - ${row.descripcion}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

completeMigration();
