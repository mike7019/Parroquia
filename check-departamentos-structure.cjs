const { Pool } = require('pg');

async function checkDepartamentosStructure() {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        console.log('🔍 Verificando estructura de tabla departamentos:');
        const structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'departamentos'
            ORDER BY ordinal_position;
        `);
        
        console.log('Columnas encontradas:');
        structure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        console.log('\n📊 Datos actuales:');
        const data = await pool.query('SELECT * FROM departamentos');
        data.rows.forEach(row => {
            console.log(`   ${JSON.stringify(row)}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDepartamentosStructure();