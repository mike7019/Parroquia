const { Pool } = require('pg');

async function fixMunicipiosData() {
    console.log('🔧 Corrigiendo datos de municipios...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Verificar estructura de tabla municipios
        console.log('🔍 Verificando estructura de tabla municipios:');
        const structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'municipios'
            ORDER BY ordinal_position;
        `);
        
        console.log('Columnas encontradas:');
        structure.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
        console.log();

        // 2. Ver datos actuales
        console.log('📊 Datos actuales en municipios:');
        const currentData = await pool.query('SELECT * FROM municipios LIMIT 5');
        console.log('Datos encontrados:');
        currentData.rows.forEach(row => {
            console.log(`   ${JSON.stringify(row)}`);
        });
        console.log();

        // 3. Actualizar los municipios con nombres correctos
        console.log('✏️  Actualizando nombres de municipios...');
        
        const updates = [
            { id: 1, nombre: 'Medellín', codigo: '05001' },
            { id: 2, nombre: 'Envigado', codigo: '05266' },
            { id: 3, nombre: 'Bogotá', codigo: '11001' },
            { id: 4, nombre: 'Cali', codigo: '76001' }
        ];

        for (const update of updates) {
            try {
                const result = await pool.query(`
                    UPDATE municipios 
                    SET nombre_municipio = $1, codigo_dane = $2, updated_at = NOW()
                    WHERE id_municipio = $3
                    RETURNING id_municipio, nombre_municipio, codigo_dane
                `, [update.nombre, update.codigo, update.id]);
                
                if (result.rows.length > 0) {
                    const row = result.rows[0];
                    console.log(`   ✅ ${row.nombre_municipio} (ID: ${row.id_municipio}, DANE: ${row.codigo_dane})`);
                } else {
                    console.log(`   ⚠️  No se encontró municipio con ID ${update.id}`);
                }
            } catch (e) {
                console.log(`   ❌ Error actualizando municipio ${update.id}: ${e.message}`);
            }
        }

        // 4. También actualizar departamentos
        console.log('\n✏️  Actualizando códigos DANE de departamentos...');
        
        const deptoUpdates = [
            { id: 1, codigo: '05' },
            { id: 2, codigo: '25' },
            { id: 3, codigo: '76' }
        ];

        for (const update of deptoUpdates) {
            try {
                await pool.query(`
                    UPDATE departamentos 
                    SET codigo_dane = $1, updated_at = NOW()
                    WHERE id_departamento = $2
                `, [update.codigo, update.id]);
                console.log(`   ✅ Departamento ${update.id} actualizado con código ${update.codigo}`);
            } catch (e) {
                console.log(`   ❌ Error actualizando departamento ${update.id}: ${e.message}`);
            }
        }

        // 5. Verificación final
        console.log('\n🔍 Verificación final:');
        const finalMunicipios = await pool.query(`
            SELECT m.id_municipio, m.nombre_municipio, m.codigo_dane, d.nombre as departamento_nombre
            FROM municipios m
            LEFT JOIN departamentos d ON m.id_departamento = d.id_departamento
            ORDER BY m.id_municipio
        `);

        console.log('Municipios corregidos:');
        finalMunicipios.rows.forEach(m => {
            console.log(`   - ${m.nombre_municipio} (${m.departamento_nombre}) - DANE: ${m.codigo_dane}`);
        });

        console.log('\n✅ Corrección completada. Los municipios ahora tienen nombres y códigos DANE.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixMunicipiosData();