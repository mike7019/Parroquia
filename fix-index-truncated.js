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

async function fixTruncatedIndex() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar y eliminar el índice truncado problemático
    console.log('🔍 Buscando índice truncado...');
    
    const truncatedIndexName = 'familia_disposicion_basura_id_familia_id_tipo_disposicion_basur';
    
    const checkTruncatedQuery = `
      SELECT indexname 
      FROM pg_indexes
      WHERE tablename = 'familia_disposicion_basura'
      AND indexname = '${truncatedIndexName}'
    `;
    
    const truncatedResults = await sequelize.query(checkTruncatedQuery);
    
    if (truncatedResults[0].length > 0) {
      console.log('❌ Encontrado índice truncado problemático:', truncatedIndexName);
      
      console.log('🗑️ Eliminando índice truncado...');
      await sequelize.query(`DROP INDEX IF EXISTS "${truncatedIndexName}"`);
      console.log('✅ Índice truncado eliminado');
    } else {
      console.log('✅ No se encontró el índice truncado problemático');
    }

    // Verificar todos los índices actuales
    console.log('📋 Verificando índices actuales...');
    const allIndexesQuery = `
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'familia_disposicion_basura'
      ORDER BY indexname
    `;
    
    const allIndexes = await sequelize.query(allIndexesQuery);
    console.log('📊 Índices actuales en familia_disposicion_basura:');
    console.table(allIndexes[0]);

    // Crear el índice correcto si no existe
    const correctIndexName = 'familia_disposicion_basura_id_familia_id_tipo_disposicion_basura';
    
    const checkCorrectQuery = `
      SELECT indexname 
      FROM pg_indexes
      WHERE tablename = 'familia_disposicion_basura'
      AND indexname = '${correctIndexName}'
    `;
    
    const correctResults = await sequelize.query(checkCorrectQuery);
    
    if (correctResults[0].length === 0) {
      console.log('🔄 Creando índice correcto...');
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "${correctIndexName}"
        ON "familia_disposicion_basura" ("id_familia", "id_tipo_disposicion_basura")
      `);
      console.log('✅ Índice correcto creado');
    } else {
      console.log('✅ Índice correcto ya existe');
    }

    console.log('🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixTruncatedIndex();
