const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function recreateBasicData() {
    console.log('🔄 Recreando datos básicos de la base de datos...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        await pool.query('SELECT 1');
        console.log('✅ Conexión establecida\n');

        // 1. Crear roles básicos
        console.log('🔐 Creando roles básicos...');
        
        const roles = [
            { id: 1, nombre: 'admin', descripcion: 'Administrador del sistema', activo: true },
            { id: 2, nombre: 'user', descripcion: 'Usuario normal', activo: true }
        ];

        for (const role of roles) {
            try {
                await pool.query(`
                    INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        nombre = EXCLUDED.nombre,
                        descripcion = EXCLUDED.descripcion,
                        updated_at = NOW()
                `, [role.id, role.nombre, role.descripcion, role.activo]);
                console.log(`   ✅ Role creado/actualizado: ${role.nombre}`);
            } catch (e) {
                console.log(`   ⚠️  Error con role ${role.nombre}: ${e.message}`);
            }
        }

        // 2. Crear usuario admin
        console.log('\n👤 Creando usuario administrador...');
        
        const adminId = uuidv4();
        const hashedPassword = await bcrypt.hash('admin123', 10);

        try {
            await pool.query(`
                INSERT INTO usuarios (
                    id, correo_electronico, contrasena, primer_nombre,
                    activo, email_verificado, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                ON CONFLICT (correo_electronico) DO UPDATE SET
                    contrasena = EXCLUDED.contrasena,
                    updated_at = NOW()
                RETURNING id
            `, [adminId, 'admin@parroquia.com', hashedPassword, 'Administrador', true, true]);
            
            console.log(`   ✅ Usuario admin creado: admin@parroquia.com`);
            console.log(`   🔑 Password: admin123`);
            console.log(`   🆔 ID: ${adminId}`);

            // Asignar role admin
            await pool.query(`
                INSERT INTO usuarios_roles (usuario_id, rol_id, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW())
                ON CONFLICT (usuario_id, rol_id) DO NOTHING
            `, [adminId, 1]);
            
            console.log(`   ✅ Role admin asignado`);

        } catch (e) {
            console.log(`   ⚠️  Error creando admin: ${e.message}`);
        }

        // 3. Verificar departamentos existentes o crear básicos
        console.log('\n🏛️  Verificando departamentos...');
        const deptResult = await pool.query('SELECT COUNT(*) as count FROM departamentos');
        
        if (deptResult.rows[0].count === 0) {
            const departamentos = [
                { id: 1, nombre: 'Antioquia', codigo_dane: '05' },
                { id: 2, nombre: 'Cundinamarca', codigo_dane: '25' },
                { id: 3, nombre: 'Valle del Cauca', codigo_dane: '76' }
            ];

            for (const dept of departamentos) {
                try {
                    await pool.query(`
                        INSERT INTO departamentos (id_departamento, nombre, codigo_dane, created_at, updated_at)
                        VALUES ($1, $2, $3, NOW(), NOW())
                        ON CONFLICT (id_departamento) DO NOTHING
                    `, [dept.id, dept.nombre, dept.codigo_dane]);
                    console.log(`   ✅ Departamento: ${dept.nombre}`);
                } catch (e) {
                    console.log(`   ⚠️  Error con departamento ${dept.nombre}: ${e.message}`);
                }
            }
        } else {
            console.log(`   ✅ Ya existen ${deptResult.rows[0].count} departamentos`);
        }

        // 4. Verificar municipios existentes o crear básicos
        console.log('\n🏘️  Verificando municipios...');
        const munResult = await pool.query('SELECT COUNT(*) as count FROM municipios');
        
        if (munResult.rows[0].count === 0) {
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
                        ON CONFLICT (id_municipio) DO NOTHING
                    `, [mun.id, mun.nombre, mun.codigo_dane, mun.id_departamento]);
                    console.log(`   ✅ Municipio: ${mun.nombre}`);
                } catch (e) {
                    console.log(`   ⚠️  Error con municipio ${mun.nombre}: ${e.message}`);
                }
            }
        } else {
            console.log(`   ✅ Ya existen ${munResult.rows[0].count} municipios`);
        }

        // 5. Crear parroquias de ejemplo con los nuevos campos
        console.log('\n⛪ Creando parroquias de ejemplo...');
        
        const parroquias = [
            {
                nombre: 'Parroquia San José',
                direccion: 'Carrera 50 # 45-32, El Poblado',
                telefono: '+57 4 123-4567',
                email: 'contacto@parroquiasanjose.com',
                id_municipio: 1
            },
            {
                nombre: 'Parroquia Sagrado Corazón',
                direccion: 'Calle 10 # 23-45, Centro',
                telefono: '+57 4 567-8910',
                email: 'info@sagradocorazon.com',
                id_municipio: 1
            },
            {
                nombre: 'Parroquia La Inmaculada',
                direccion: 'Avenida 80 # 12-34, Laureles',
                telefono: '+57 4 890-1234',
                email: 'inmaculada@parroquia.org',
                id_municipio: 2
            }
        ];

        for (const parroquia of parroquias) {
            try {
                const result = await pool.query(`
                    INSERT INTO parroquia (nombre, direccion, telefono, email, id_municipio, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                    RETURNING id_parroquia
                `, [parroquia.nombre, parroquia.direccion, parroquia.telefono, parroquia.email, parroquia.id_municipio]);
                
                console.log(`   ✅ Parroquia: ${parroquia.nombre} (ID: ${result.rows[0].id_parroquia})`);
                console.log(`      📧 ${parroquia.email}`);
                console.log(`      📞 ${parroquia.telefono}`);
                console.log(`      🏠 ${parroquia.direccion}`);
            } catch (e) {
                console.log(`   ⚠️  Error con parroquia ${parroquia.nombre}: ${e.message}`);
            }
        }

        // 6. Verificación final
        console.log('\n📊 Verificación final del sistema:');
        
        const finalChecks = [
            { table: 'usuarios', label: '👥 Usuarios' },
            { table: 'roles', label: '🔐 Roles' },
            { table: 'usuarios_roles', label: '🔗 Relaciones Usuario-Role' },
            { table: 'departamentos', label: '🏛️  Departamentos' },
            { table: 'municipios', label: '🏘️  Municipios' },
            { table: 'parroquia', label: '⛪ Parroquias' }
        ];

        for (const check of finalChecks) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${check.table}`);
                console.log(`   ${check.label}: ${result.rows[0].count} registros`);
            } catch (e) {
                console.log(`   ${check.label}: Error al consultar`);
            }
        }

        // 7. Mostrar ejemplos de parroquias con nuevos campos
        console.log('\n📋 Ejemplo de parroquias con nuevos campos:');
        try {
            const parroquiasResult = await pool.query(`
                SELECT p.id_parroquia, p.nombre, p.direccion, p.telefono, p.email, 
                       p.created_at, m.nombre_municipio
                FROM parroquia p
                JOIN municipios m ON p.id_municipio = m.id_municipio
                LIMIT 3
            `);

            parroquiasResult.rows.forEach(p => {
                console.log(`   • ${p.nombre}`);
                console.log(`     📧 ${p.email || 'Sin email'}`);
                console.log(`     📞 ${p.telefono || 'Sin teléfono'}`);
                console.log(`     🏠 ${p.direccion || 'Sin dirección'}`);
                console.log(`     🏘️  ${p.nombre_municipio}`);
                console.log(`     📅 ${p.created_at?.toISOString().split('T')[0]}`);
                console.log();
            });
        } catch (e) {
            console.log('   ⚠️  Error consultando parroquias');
        }

        console.log('🎉 ¡Sistema recreado exitosamente!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Datos básicos recreados');
        console.log('🔑 Usuario admin: admin@parroquia.com / admin123');
        console.log('⛪ Parroquias con nuevos campos creadas');
        console.log('🚀 Sistema listo para usar');

    } catch (error) {
        console.error('❌ Error recreando datos:', error.message);
    } finally {
        await pool.end();
    }
}

recreateBasicData().catch(console.error);