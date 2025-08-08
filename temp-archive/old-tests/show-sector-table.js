import pkg from 'pg';
const { Client } = pkg;

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'parroquia_db',
    user: process.env.DB_USER || 'parroquia_user',
    password: process.env.DB_PASSWORD || 'ParroquiaSecure2025'
};

async function showSectorTable() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Conectado a la base de datos');
        
        // Obtener estructura de la tabla
        console.log('\n📋 ESTRUCTURA DE LA TABLA SECTOR:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        const structureQuery = `
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns 
            WHERE table_name = 'sector' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        const structureResult = await client.query(structureQuery);
        
        if (structureResult.rows.length === 0) {
            console.log('❌ La tabla "sector" no existe o no se encontró');
            return;
        }
        
        console.log('COLUMNA\t\t\tTIPO\t\tNULO\tDEFAULT\t\tLONGITUD');
        console.log('───────────────────────────────────────────────────────────────');
        
        structureResult.rows.forEach(row => {
            const column = row.column_name.padEnd(20);
            const type = row.data_type.padEnd(15);
            const nullable = row.is_nullable.padEnd(8);
            const defaultVal = (row.column_default || 'NULL').padEnd(15);
            const length = row.character_maximum_length || 'N/A';
            
            console.log(`${column}\t${type}\t${nullable}\t${defaultVal}\t${length}`);
        });
        
        // Obtener datos de la tabla
        console.log('\n📊 DATOS DE LA TABLA SECTOR:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        const dataQuery = 'SELECT * FROM sector ORDER BY id_sector LIMIT 20;';
        const dataResult = await client.query(dataQuery);
        
        if (dataResult.rows.length === 0) {
            console.log('📝 La tabla está vacía');
        } else {
            console.log(`Total de registros mostrados: ${dataResult.rows.length}`);
            console.log('\nDATOS:');
            console.log('───────────────────────────────────────────────────────────────');
            
            dataResult.rows.forEach((row, index) => {
                console.log(`${index + 1}. ID: ${row.id_sector} | Nombre: ${row.nombre}`);
                if (row.created_at) {
                    console.log(`   Creado: ${row.created_at}`);
                }
                if (row.updated_at) {
                    console.log(`   Actualizado: ${row.updated_at}`);
                }
                console.log('');
            });
        }
        
        // Obtener conteo total
        const countQuery = 'SELECT COUNT(*) as total FROM sector;';
        const countResult = await client.query(countQuery);
        console.log(`📈 Total de sectores en la tabla: ${countResult.rows[0].total}`);
        
        // Verificar relaciones con otras tablas
        console.log('\n🔗 RELACIONES CON OTRAS TABLAS:');
        console.log('═══════════════════════════════════════════════════════════════');
        
        // Verificar si hay veredas relacionadas
        const veredasQuery = `
            SELECT COUNT(*) as total_veredas
            FROM veredas 
            WHERE id_sector_sector IS NOT NULL;
        `;
        
        try {
            const veredasResult = await client.query(veredasQuery);
            console.log(`🏘️  Veredas que tienen sector asignado: ${veredasResult.rows[0].total_veredas}`);
        } catch (error) {
            console.log('🏘️  No se pudo verificar relación con veredas:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📊 Código de error:', error.code);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 SUGERENCIAS:');
            console.log('• Verificar que PostgreSQL esté ejecutándose');
            console.log('• Verificar la configuración de host y puerto');
            console.log('• Comando para verificar: pg_isready -h localhost -p 5432');
        } else if (error.code === '28P01') {
            console.log('\n💡 SUGERENCIAS:');
            console.log('• Verificar usuario y contraseña de la base de datos');
            console.log('• Verificar permisos del usuario en la base de datos');
        } else if (error.code === '3D000') {
            console.log('\n💡 SUGERENCIAS:');
            console.log('• La base de datos "parroquia_db" no existe');
            console.log('• Verificar el nombre de la base de datos');
        }
    } finally {
        await client.end();
    }
}

showSectorTable();
