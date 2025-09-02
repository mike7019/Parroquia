import sequelize from './config/sequelize.js';

async function fixIndexConflict() {
  try {
    console.log('🔧 Iniciando corrección de índices conflictivos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Verificar si existe el índice problemático
    const [results] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'familia_disposicion_basura' 
      AND indexname LIKE '%familia_disposicion_basura_id_familia_id_tipo_disposicion_basur%'
    `);
    
    if (results.length > 0) {
      console.log('🔍 Índices problemáticos encontrados:', results);
      
      // Eliminar índices con nombres truncados problemáticos
      for (const index of results) {
        try {
          await sequelize.query(`DROP INDEX IF EXISTS "${index.indexname}"`);
          console.log(`✅ Índice eliminado: ${index.indexname}`);
        } catch (error) {
          console.log(`⚠️ Error eliminando índice ${index.indexname}:`, error.message);
        }
      }
    } else {
      console.log('✅ No se encontraron índices problemáticos');
    }
    
    // Verificar si existe el índice único correcto
    const [correctIndex] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'familia_disposicion_basura' 
      AND indexname IN ('idx_familia_disp_basura_unique', 'unique_familia_disposicion_basura')
    `);
    
    if (correctIndex.length === 0) {
      console.log('🔨 Creando índice único correcto...');
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_familia_disp_basura_unique 
        ON familia_disposicion_basura (id_familia, id_tipo_disposicion_basura)
      `);
      console.log('✅ Índice único creado correctamente');
    } else {
      console.log('✅ Índice único ya existe:', correctIndex);
    }
    
    // Mostrar todos los índices de la tabla
    const [allIndexes] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'familia_disposicion_basura'
      ORDER BY indexname
    `);
    
    console.log('📋 Índices actuales en familia_disposicion_basura:');
    allIndexes.forEach(idx => {
      console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
    });
    
    console.log('✅ Corrección de índices completada');
    
  } catch (error) {
    console.error('❌ Error en corrección de índices:', error);
  } finally {
    await sequelize.close();
  }
}

fixIndexConflict();
