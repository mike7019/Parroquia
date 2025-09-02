// Script para limpiar índices duplicados en la base de datos
import sequelize from './config/sequelize.js';

async function cleanDuplicateIndexes() {
  try {
    console.log('🔧 Limpiando índices duplicados...');
    
    // Eliminar el índice duplicado problemático
    const indexName = 'familia_disposicion_basura_id_familia_id_tipo_disposicion_basura';
    
    console.log(`📋 Verificando si existe el índice: ${indexName}`);
    
    const [results] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'familia_disposicion_basura' 
      AND indexname = '${indexName}'
    `);
    
    if (results.length > 0) {
      console.log(`❌ Índice duplicado encontrado: ${indexName}`);
      console.log('🗑️ Eliminando índice duplicado...');
      
      await sequelize.query(`DROP INDEX IF EXISTS "${indexName}"`);
      console.log('✅ Índice duplicado eliminado exitosamente');
    } else {
      console.log('✅ No se encontró el índice duplicado');
    }
    
    // Verificar otros posibles índices problemáticos
    console.log('🔍 Verificando otros índices en la tabla familia_disposicion_basura...');
    
    const [allIndexes] = await sequelize.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'familia_disposicion_basura'
      ORDER BY indexname
    `);
    
    console.log('📊 Índices actuales en familia_disposicion_basura:');
    console.table(allIndexes);
    
    // Ahora probar la sincronización
    console.log('🔄 Probando sincronización de la tabla...');
    
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "familia_disposicion_basura_unique_idx" 
      ON "familia_disposicion_basura" ("id_familia", "id_tipo_disposicion_basura")
    `);
    
    console.log('✅ Nuevo índice creado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al limpiar índices:', error.message);
  } finally {
    await sequelize.close();
  }
}

cleanDuplicateIndexes();
