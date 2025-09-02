const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgresql',
  logging: console.log
});

async function fixIndexConflict() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Lista todos los índices que pueden estar causando problemas
    console.log('📋 Verificando todos los índices relacionados...');
    
    const allIndexesQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'familia_disposicion_basura'
      ORDER BY indexname
    `;
    
    const allIndexes = await sequelize.query(allIndexesQuery);
    console.log('📊 Índices actuales:');
    console.table(allIndexes[0]);

    // Eliminar todos los índices problemáticos
    const problematicIndexes = [
      'familia_disposicion_basura_id_familia_id_tipo_disposicion_basur',
      'familia_disposicion_basura_id_familia_id_tipo_disposicion_basura'
    ];

    for (const indexName of problematicIndexes) {
      console.log(`🗑️ Eliminando índice: ${indexName}`);
      await sequelize.query(`DROP INDEX IF EXISTS "${indexName}"`);
      console.log(`✅ Índice eliminado: ${indexName}`);
    }

    // Verificar que se eliminaron
    console.log('🔍 Verificando eliminación...');
    const remainingIndexes = await sequelize.query(allIndexesQuery);
    console.log('📊 Índices restantes:');
    console.table(remainingIndexes[0]);

    // Crear un índice único con nombre más corto para evitar truncamiento
    const shortIndexName = 'unique_familia_disposicion_idx';
    
    console.log(`🔄 Creando nuevo índice: ${shortIndexName}`);
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "${shortIndexName}"
      ON "familia_disposicion_basura" ("id_familia", "id_tipo_disposicion_basura")
    `);
    console.log(`✅ Índice creado: ${shortIndexName}`);

    // Verificación final
    console.log('📋 Verificación final de índices...');
    const finalIndexes = await sequelize.query(allIndexesQuery);
    console.log('📊 Índices finales:');
    console.table(finalIndexes[0]);

    console.log('🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixIndexConflict();
