const { Pool } = require('pg');

async function diagnoseLoginError() {
    console.log('🔍 Diagnosticando error de login...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Verificar estructura de tabla usuarios
        console.log('👥 Verificando estructura de tabla usuarios:');
        const usuariosStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'usuarios'
            ORDER BY ordinal_position;
        `);
        
        if (usuariosStructure.rows.length === 0) {
            console.log('❌ Tabla usuarios no existe!');
        } else {
            console.log('Columnas encontradas:');
            usuariosStructure.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
            });
        }
        console.log();

        // 2. Verificar estructura de tabla roles
        console.log('🔐 Verificando estructura de tabla roles:');
        const rolesStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'roles'
            ORDER BY ordinal_position;
        `);
        
        if (rolesStructure.rows.length === 0) {
            console.log('❌ Tabla roles no existe!');
        } else {
            console.log('Columnas encontradas:');
            rolesStructure.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
            });
        }
        console.log();

        // 3. Verificar estructura de tabla usuarios_roles
        console.log('🔗 Verificando estructura de tabla usuarios_roles:');
        const usuariosRolesStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'usuarios_roles'
            ORDER BY ordinal_position;
        `);
        
        if (usuariosRolesStructure.rows.length === 0) {
            console.log('❌ Tabla usuarios_roles no existe!');
        } else {
            console.log('Columnas encontradas:');
            usuariosRolesStructure.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
            });
        }
        console.log();

        // 4. Verificar si existen datos en las tablas
        console.log('📊 Verificando datos existentes:');
        
        try {
            const usuariosCount = await pool.query('SELECT COUNT(*) as count FROM usuarios');
            console.log(`   👥 Usuarios: ${usuariosCount.rows[0].count}`);
            
            if (usuariosCount.rows[0].count > 0) {
                const usuarioSample = await pool.query('SELECT correo_electronico, primer_nombre, activo FROM usuarios LIMIT 1');
                console.log(`   📧 Ejemplo: ${usuarioSample.rows[0].correo_electronico} (${usuarioSample.rows[0].primer_nombre})`);
            }
        } catch (e) {
            console.log(`   ❌ Error consultando usuarios: ${e.message}`);
        }

        try {
            const rolesCount = await pool.query('SELECT COUNT(*) as count FROM roles');
            console.log(`   🔐 Roles: ${rolesCount.rows[0].count}`);
            
            if (rolesCount.rows[0].count > 0) {
                const rolesSample = await pool.query('SELECT nombre FROM roles');
                console.log(`   📋 Roles disponibles: ${rolesSample.rows.map(r => r.nombre).join(', ')}`);
            }
        } catch (e) {
            console.log(`   ❌ Error consultando roles: ${e.message}`);
        }

        try {
            const usuariosRolesCount = await pool.query('SELECT COUNT(*) as count FROM usuarios_roles');
            console.log(`   🔗 Relaciones Usuario-Role: ${usuariosRolesCount.rows[0].count}`);
        } catch (e) {
            console.log(`   ❌ Error consultando usuarios_roles: ${e.message}`);
        }
        console.log();

        // 5. Probar una consulta similar a la que hace el login
        console.log('🔍 Probando consulta de login:');
        try {
            const loginQuery = `
                SELECT u.id, u.correo_electronico, u.contrasena, u.primer_nombre, 
                       u.activo, r.nombre as role_name
                FROM usuarios u
                LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
                LEFT JOIN roles r ON ur.rol_id = r.id
                WHERE u.correo_electronico = $1
            `;
            
            const result = await pool.query(loginQuery, ['admin@parroquia.com']);
            
            if (result.rows.length > 0) {
                console.log('✅ Consulta de login exitosa');
                console.log(`   Usuario encontrado: ${result.rows[0].primer_nombre}`);
                console.log(`   Role: ${result.rows[0].role_name || 'Sin role'}`);
                console.log(`   Activo: ${result.rows[0].activo}`);
            } else {
                console.log('⚠️  Usuario admin@parroquia.com no encontrado');
            }
        } catch (e) {
            console.log(`❌ Error en consulta de login: ${e.message}`);
            console.log(`   Código de error: ${e.code}`);
            console.log(`   Detalle: ${e.detail || 'N/A'}`);
        }
        console.log();

        // 6. Verificar las foreign keys
        console.log('🔗 Verificando foreign keys:');
        const foreignKeys = await pool.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_name IN ('usuarios_roles')
        `);

        if (foreignKeys.rows.length > 0) {
            foreignKeys.rows.forEach(fk => {
                console.log(`   ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        } else {
            console.log('   ⚠️  No se encontraron foreign keys para usuarios_roles');
        }

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error.message);
        console.error('Código:', error.code);
    } finally {
        await pool.end();
    }
}

diagnoseLoginError();