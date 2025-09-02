const { sequelize } = require('./src/config/database');

async function fixDuplicateIndexes() {
    try {
        console.log('🔧 Solucionando índices duplicados específicos...');
        
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos establecida');
        
        // Lista de índices problemáticos a eliminar
        const problematicIndexes = [
            'familia_disposicion_basura_id_familia_id_tipo_disposicion_basur',
            'familia_disposicion_basura_id_familia_id_tipo_disposicion_basura'
        ];
        
        for (const indexName of problematicIndexes) {
            try {
                console.log(`🗑️ Intentando eliminar índice: ${indexName}`);
                
                // Verificar si el índice existe
                const checkQuery = `
                    SELECT indexname 
                    FROM pg_indexes
                    WHERE tablename = 'familia_disposicion_basura'
                    AND indexname = '${indexName}'
                `;
                
                const [results] = await sequelize.query(checkQuery);
                
                if (results.length > 0) {
                    // Eliminar el índice
                    await sequelize.query(`DROP INDEX IF EXISTS "${indexName}"`);
                    console.log(`✅ Índice ${indexName} eliminado exitosamente`);
                } else {
                    console.log(`ℹ️ Índice ${indexName} no encontrado`);
                }
            } catch (error) {
                console.log(`⚠️ Error al procesar índice ${indexName}:`, error.message);
            }
        }
        
        // Verificar estado actual de los índices
        console.log('\n📋 Verificando índices actuales...');
        const currentIndexesQuery = `
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'familia_disposicion_basura'
            ORDER BY indexname
        `;
        
        const [currentIndexes] = await sequelize.query(currentIndexesQuery);
        console.log('📊 Índices actuales en familia_disposicion_basura:');
        currentIndexes.forEach(index => {
            console.log(`  - ${index.indexname}`);
        });
        
        // Crear el índice correcto si no existe
        console.log('\n🔨 Creando índice correcto...');
        try {
            await sequelize.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS "familia_disposicion_basura_unique_constraint"
                ON "familia_disposicion_basura" ("id_familia", "id_tipo_disposicion_basura")
            `);
            console.log('✅ Índice único creado correctamente');
        } catch (error) {
            console.log('⚠️ Error al crear índice único:', error.message);
        }
        
        console.log('\n✅ Proceso de limpieza completado');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await sequelize.close();
        console.log('🔄 Conexión cerrada');
    }
}

fixDuplicateIndexes();
