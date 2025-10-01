const { Pool } = require('pg');

async function checkAndFixMunicipios() {
    console.log('🔍 Verificando y corrigiendo datos de municipios...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Verificar departamentos
        console.log('🏛️  Verificando departamentos...');
        const deptoResult = await pool.query('SELECT * FROM departamentos ORDER BY id_departamento');
        console.log(`   Encontrados: ${deptoResult.rows.length} departamentos`);
        deptoResult.rows.forEach(d => {
            console.log(`   - ${d.nombre} (ID: ${d.id_departamento}, DANE: ${d.codigo_dane})`);
        });
        console.log();

        // 2. Verificar municipios
        console.log('🏘️  Verificando municipios...');
        const munResult = await pool.query('SELECT * FROM municipios ORDER BY id_municipio');
        console.log(`   Encontrados: ${munResult.rows.length} municipios`);
        munResult.rows.forEach(m => {
            console.log(`   - ${m.nombre_municipio} (ID: ${m.id_municipio}, Depto: ${m.id_departamento})`);
        });
        console.log();

        // 3. Si no hay municipios, crearlos
        if (munResult.rows.length === 0) {
            console.log('➕ Creando municipios básicos...');
            
            const municipios = [
                { id: 1, nombre: 'Medellín', codigo_dane: '05001', id_departamento: 1 },
                { id: 2, nombre: 'Envigado', codigo_dane: '05266', id_departamento: 1 },
                { id: 3, nombre: 'Bogotá', codigo_dane: '11001', id_departamento: 2 },
                { id: 4, nombre: 'Cali', codigo_dane: '76001', id_departamento: 3 }
            ];

            for (const mun of municipios) {
                try {
                    await pool.query(`
                        INSERT INTO municipios (id_municipio, nombre_municipio, codigo_dane, id_departamento, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, NOW(), NOW())
                        ON CONFLICT (id_municipio) DO UPDATE SET
                            nombre_municipio = EXCLUDED.nombre_municipio,
                            updated_at = NOW()
                    `, [mun.id, mun.nombre, mun.codigo_dane, mun.id_departamento]);
                    console.log(`   ✅ Municipio creado: ${mun.nombre}`);
                } catch (e) {
                    console.log(`   ⚠️  Error creando ${mun.nombre}: ${e.message}`);
                }
            }
        }

        // 4. Verificar parroquias existentes
        console.log('\n⛪ Verificando parroquias existentes...');
        const parroquiasResult = await pool.query('SELECT * FROM parroquia ORDER BY id_parroquia');
        console.log(`   Encontradas: ${parroquiasResult.rows.length} parroquias`);
        parroquiasResult.rows.forEach(p => {
            console.log(`   - ${p.nombre} (ID: ${p.id_parroquia}, Municipio: ${p.id_municipio})`);
            console.log(`     📧 ${p.email || 'Sin email'} | 📞 ${p.telefono || 'Sin teléfono'}`);
        });

        // 5. Verificación final
        console.log('\n📊 Verificación final:');
        const finalMunResult = await pool.query('SELECT COUNT(*) as count FROM municipios');
        const finalParrResult = await pool.query('SELECT COUNT(*) as count FROM parroquia');
        
        console.log(`   🏘️  Municipios: ${finalMunResult.rows[0].count}`);
        console.log(`   ⛪ Parroquias: ${finalParrResult.rows[0].count}`);

        console.log('\n✅ Verificación completada');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkAndFixMunicipios();