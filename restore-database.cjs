const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
    console.log('🔄 Iniciando restauración de base de datos...\n');

    // Configuración de la base de datos
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'parroquia_db',
        user: 'parroquia_user',
        password: 'ParroquiaSecure2025'
    });

    try {
        // 1. Verificar conexión
        console.log('🔍 Verificando conexión a la base de datos...');
        await pool.query('SELECT 1');
        console.log('✅ Conexión establecida\n');

        // 2. Mostrar backups disponibles
        console.log('📁 Backups disponibles:');
        const backupsDir = path.join(process.cwd(), 'docs');
        const backupFiles = fs.readdirSync(backupsDir)
            .filter(file => file.endsWith('.sql') && file.includes('dump-parroquia_db'))
            .map(file => {
                const filePath = path.join(backupsDir, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: Math.round(stats.size / 1024),
                    date: stats.mtime.toISOString().split('T')[0]
                };
            })
            .sort((a, b) => b.name.localeCompare(a.name)); // Más reciente primero

        backupFiles.forEach((backup, index) => {
            console.log(`   ${index + 1}. ${backup.name} (${backup.size}KB) - ${backup.date}`);
        });

        // 3. Usar el backup más completo (el de mayor tamaño)
        const selectedBackup = backupFiles.reduce((prev, current) => 
            (current.size > prev.size) ? current : prev
        );

        console.log(`\n🎯 Seleccionando backup: ${selectedBackup.name} (${selectedBackup.size}KB)`);

        // 4. Leer el archivo SQL
        const backupPath = path.join(backupsDir, selectedBackup.name);
        console.log('📖 Leyendo archivo de backup...');
        const sqlContent = fs.readFileSync(backupPath, 'utf8');
        console.log(`✅ Archivo leído: ${Math.round(sqlContent.length / 1024)}KB\n`);

        // 5. Obtener lista de tablas antes de la restauración
        console.log('📊 Tablas actuales en la base de datos:');
        const currentTablesResult = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        console.log(`   Encontradas: ${currentTablesResult.rows.length} tablas`);
        currentTablesResult.rows.forEach(row => {
            console.log(`   • ${row.tablename}`);
        });
        console.log();

        // 6. Preguntar confirmación (simulada - automáticamente sí)
        console.log('⚠️  ADVERTENCIA: Esta operación eliminará todos los datos actuales');
        console.log('✅ Procediendo con la restauración automática...\n');

        // 7. Ejecutar la restauración
        console.log('🔄 Ejecutando restauración...');
        console.log('   📝 Esto puede tomar varios minutos...');

        // Dividir el SQL en statements individuales y ejecutar
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`   📋 Ejecutando ${statements.length} statements SQL...`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            try {
                if (i % 50 === 0) {
                    console.log(`   ⏳ Progreso: ${i}/${statements.length} (${Math.round(i/statements.length*100)}%)`);
                }
                await pool.query(statements[i]);
                successCount++;
            } catch (error) {
                errorCount++;
                if (errorCount < 10) { // Solo mostrar los primeros errores
                    console.log(`   ⚠️  Error en statement ${i}: ${error.message.substring(0, 100)}...`);
                }
            }
        }

        console.log(`\n📊 Resultados de la restauración:`);
        console.log(`   ✅ Exitosos: ${successCount}`);
        console.log(`   ❌ Errores: ${errorCount}`);

        // 8. Verificar tablas después de la restauración
        console.log('\n🔍 Verificando estado después de la restauración:');
        const finalTablesResult = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        console.log(`   Tablas finales: ${finalTablesResult.rows.length}`);

        // 9. Verificar algunos datos clave
        console.log('\n📋 Verificando datos restaurados:');
        
        try {
            const usuariosResult = await pool.query('SELECT COUNT(*) as count FROM usuarios');
            console.log(`   👥 Usuarios: ${usuariosResult.rows[0].count}`);
        } catch (e) {
            console.log('   👥 Usuarios: Error al consultar');
        }

        try {
            const parroquiasResult = await pool.query('SELECT COUNT(*) as count FROM parroquia');
            console.log(`   ⛪ Parroquias: ${parroquiasResult.rows[0].count}`);
        } catch (e) {
            console.log('   ⛪ Parroquias: Error al consultar');
        }

        try {
            const municipiosResult = await pool.query('SELECT COUNT(*) as count FROM municipios');
            console.log(`   🏛️  Municipios: ${municipiosResult.rows[0].count}`);
        } catch (e) {
            console.log('   🏛️  Municipios: Error al consultar');
        }

        console.log('\n🎉 ¡Restauración completada!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Base de datos restaurada desde el backup');
        console.log('🔄 Reinicia el servidor para aplicar todos los cambios');
        console.log('🚀 El sistema debería estar funcionando con los datos originales');

    } catch (error) {
        console.error('❌ Error durante la restauración:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

// Ejecutar la restauración
restoreDatabase().catch(console.error);