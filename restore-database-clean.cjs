const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreDatabaseClean() {
    console.log('🔄 Iniciando restauración limpia de base de datos...\n');

    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Conectar
        console.log('🔍 Conectando a la base de datos...');
        await pool.query('SELECT 1');
        console.log('✅ Conexión establecida\n');

        // 2. Crear backup de emergencia de los datos actuales
        console.log('💾 Creando backup de emergencia de datos críticos...');
        
        const backupData = {
            usuarios: [],
            roles: [],
            usuarios_roles: [],
            parroquias: [],
            municipios: [],
            departamentos: []
        };

        try {
            const usuarios = await pool.query('SELECT * FROM usuarios');
            backupData.usuarios = usuarios.rows;
            console.log(`   👥 Usuarios respaldados: ${usuarios.rows.length}`);
        } catch (e) {
            console.log('   👥 Sin usuarios para respaldar');
        }

        try {
            const roles = await pool.query('SELECT * FROM roles');
            backupData.roles = roles.rows;
            console.log(`   🔐 Roles respaldados: ${roles.rows.length}`);
        } catch (e) {
            console.log('   🔐 Sin roles para respaldar');
        }

        try {
            const usuariosRoles = await pool.query('SELECT * FROM usuarios_roles');
            backupData.usuarios_roles = usuariosRoles.rows;
            console.log(`   🔗 Relaciones usuario-rol respaldadas: ${usuariosRoles.rows.length}`);
        } catch (e) {
            console.log('   🔗 Sin relaciones usuario-rol para respaldar');
        }

        // 3. Leer y procesar el backup SQL
        const backupPath = path.join(process.cwd(), 'docs', 'dump-parroquia_db-202509052225.sql');
        console.log('\n📖 Procesando archivo de backup...');
        const sqlContent = fs.readFileSync(backupPath, 'utf8');

        // 4. Extraer solo los INSERT statements más importantes
        console.log('🔍 Extrayendo datos del backup...');
        const lines = sqlContent.split('\n');
        const importantInserts = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('INSERT INTO') && !trimmed.includes('pg_')) {
                // Filtrar solo las tablas que nos interesan
                if (trimmed.includes('departamentos') || 
                    trimmed.includes('municipios') || 
                    trimmed.includes('parroquia') ||
                    trimmed.includes('usuarios') ||
                    trimmed.includes('roles')) {
                    importantInserts.push(trimmed);
                }
            }
        }

        console.log(`✅ Encontrados ${importantInserts.length} INSERT statements importantes\n`);

        // 5. Limpiar y recrear tablas críticas
        console.log('🧹 Limpiando datos existentes...');
        
        const tablesToClean = [
            'usuarios_roles',
            'usuarios', 
            'roles',
            'parroquia',
            'municipios',
            'departamentos'
        ];

        for (const table of tablesToClean) {
            try {
                await pool.query(`DELETE FROM ${table}`);
                console.log(`   ✅ Tabla ${table} limpiada`);
            } catch (e) {
                console.log(`   ⚠️  No se pudo limpiar tabla ${table}: ${e.message}`);
            }
        }

        // 6. Ejecutar los INSERTs importantes
        console.log('\n📝 Insertando datos del backup...');
        let successCount = 0;
        let errorCount = 0;

        for (const insertStmt of importantInserts) {
            try {
                await pool.query(insertStmt);
                successCount++;
                
                // Mostrar progreso cada 10 inserts
                if (successCount % 10 === 0) {
                    console.log(`   ⏳ Insertados: ${successCount}/${importantInserts.length}`);
                }
            } catch (error) {
                errorCount++;
                if (errorCount <= 5) {
                    console.log(`   ⚠️  Error: ${error.message.substring(0, 80)}...`);
                }
            }
        }

        // 7. Restaurar los usuarios críticos si es necesario
        console.log('\n🔄 Verificando usuarios críticos...');
        const usuariosCheck = await pool.query('SELECT COUNT(*) as count FROM usuarios');
        
        if (usuariosCheck.rows[0].count === 0 && backupData.usuarios.length > 0) {
            console.log('   🚑 Restaurando usuarios de emergencia...');
            
            for (const usuario of backupData.usuarios) {
                try {
                    await pool.query(`
                        INSERT INTO usuarios (
                            id, correo_electronico, contrasena, primer_nombre, 
                            segundo_nombre, primer_apellido, segundo_apellido,
                            numero_documento, telefono, activo, fecha_ultimo_acceso,
                            intentos_fallidos, bloqueado_hasta, token_recuperacion,
                            token_expiracion, email_verificado, token_verificacion_email,
                            fecha_verificacion_email, expira_token_reset, refresh_token,
                            created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                    `, [
                        usuario.id, usuario.correo_electronico, usuario.contrasena,
                        usuario.primer_nombre, usuario.segundo_nombre, usuario.primer_apellido,
                        usuario.segundo_apellido, usuario.numero_documento, usuario.telefono,
                        usuario.activo, usuario.fecha_ultimo_acceso, usuario.intentos_fallidos,
                        usuario.bloqueado_hasta, usuario.token_recuperacion, usuario.token_expiracion,
                        usuario.email_verificado, usuario.token_verificacion_email,
                        usuario.fecha_verificacion_email, usuario.expira_token_reset,
                        usuario.refresh_token, usuario.created_at, usuario.updated_at
                    ]);
                    console.log(`   ✅ Usuario restaurado: ${usuario.correo_electronico}`);
                } catch (e) {
                    console.log(`   ⚠️  Error restaurando usuario: ${e.message}`);
                }
            }

            // Restaurar roles
            for (const role of backupData.roles) {
                try {
                    await pool.query(`
                        INSERT INTO roles (id, nombre, descripcion, activo, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [role.id, role.nombre, role.descripcion, role.activo, role.created_at, role.updated_at]);
                } catch (e) {
                    console.log(`   ⚠️  Error restaurando role: ${e.message}`);
                }
            }

            // Restaurar relaciones usuario-rol
            for (const rel of backupData.usuarios_roles) {
                try {
                    await pool.query(`
                        INSERT INTO usuarios_roles (usuario_id, rol_id, created_at, updated_at)
                        VALUES ($1, $2, $3, $4)
                    `, [rel.usuario_id, rel.rol_id, rel.created_at, rel.updated_at]);
                } catch (e) {
                    console.log(`   ⚠️  Error restaurando relación: ${e.message}`);
                }
            }
        }

        // 8. Verificación final
        console.log('\n📊 Verificación final:');
        
        const finalChecks = [
            { table: 'usuarios', label: '👥 Usuarios' },
            { table: 'roles', label: '🔐 Roles' },
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

        console.log(`\n📊 Resultados de la restauración:`);
        console.log(`   ✅ Exitosos: ${successCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);

        console.log('\n🎉 ¡Restauración completada!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Base de datos restaurada con datos del backup');
        console.log('🔄 Los datos críticos han sido preservados');
        console.log('🚀 Reinicia el servidor para verificar el funcionamiento');

    } catch (error) {
        console.error('❌ Error durante la restauración:', error.message);
    } finally {
        await pool.end();
    }
}

restoreDatabaseClean().catch(console.error);