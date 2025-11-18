import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  user: 'parroquia_user',
  password: 'ParroquiaSecure2025'
});

async function addUsuarioCreadorColumn() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    console.log('🔄 Agregando columna id_usuario_creador a la tabla familias...');

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'id_usuario_creador'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️ La columna id_usuario_creador ya existe');
      return;
    }

    // Agregar la columna
    await client.query(`
      ALTER TABLE familias 
      ADD COLUMN id_usuario_creador UUID,
      ADD CONSTRAINT fk_familias_usuario_creador 
        FOREIGN KEY (id_usuario_creador) 
        REFERENCES usuarios(id) 
        ON DELETE SET NULL
    `);

    console.log('✅ Columna id_usuario_creador agregada exitosamente');

    // Crear índice para mejorar el rendimiento
    await client.query(`
      CREATE INDEX idx_familias_usuario_creador 
      ON familias(id_usuario_creador)
    `);

    console.log('✅ Índice creado exitosamente');

    // Verificar la estructura
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND column_name = 'id_usuario_creador'
    `);

    console.log('\n📊 Estructura de la nueva columna:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

addUsuarioCreadorColumn();
