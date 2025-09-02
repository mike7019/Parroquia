import pkg from 'pg';
const { Client } = pkg;

async function fixDuplicateIndexes() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        console.log('🔧 Conectando a PostgreSQL directamente...');
        await client.connect();
        console.log('✅ Conexión establecida');
        
        // Lista de índices problemáticos a eliminar
        const problematicIndexes = [
            'familia_disposicion_basura_id_familia_id_tipo_disposicion_basur',
            'familia_disposicion_basura_id_familia_id_tipo_disposicion_basura'
        ];
        
        for (const indexName of problematicIndexes) {
            try {
                console.log(`🗑️ Eliminando índice: ${indexName}`);
                await client.query(`DROP INDEX IF EXISTS "${indexName}"`);
                console.log(`✅ Índice ${indexName} eliminado`);
            } catch (error) {
                console.log(`⚠️ Error al eliminar ${indexName}:`, error.message);
            }
        }
        
        // Verificar índices actuales
        console.log('\n📋 Verificando índices actuales...');
        const result = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'familia_disposicion_basura'
            ORDER BY indexname
        `);
        
        console.log('📊 Índices actuales en familia_disposicion_basura:');
        result.rows.forEach(index => {
            console.log(`  - ${index.indexname}`);
        });
        
        console.log('\n✅ Proceso de limpieza completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
        console.log('🔄 Conexión cerrada');
    }
}

fixDuplicateIndexes();
