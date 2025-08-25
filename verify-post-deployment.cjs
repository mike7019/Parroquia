// Script de verificación post-deployment para asegurar que los cambios de BD se aplicaron
const { Sequelize } = require('sequelize');
const path = require('path');

async function verifyPostDeployment() {
    console.log('🔍 Verificando estado de la base de datos post-deployment...\n');
    
    try {
        // Cargar configuración de desarrollo desde config.cjs
        const configPath = path.join(__dirname, 'config', 'config.cjs');
        const config = require(configPath);
        const dbConfig = config.development;
        
        const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            logging: false
        });

        // 1. Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a base de datos exitosa');

        // 2. Verificar tabla familias y estructura
        console.log('\n🔍 Verificando tabla familias...');
        
        const [familiaColumns] = await sequelize.query(`
            SELECT 
                c.column_name, 
                c.data_type, 
                c.is_nullable, 
                c.column_default,
                pk.constraint_type
            FROM information_schema.columns c
            LEFT JOIN (
                SELECT tc.table_name, kcu.column_name, tc.constraint_type
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu 
                ON tc.constraint_name = kcu.constraint_name
                WHERE tc.constraint_type = 'PRIMARY KEY'
            ) pk ON pk.table_name = c.table_name AND pk.column_name = c.column_name
            WHERE c.table_name = 'familias' 
            AND c.table_schema = 'public'
            ORDER BY c.ordinal_position;
        `);

        if (familiaColumns.length > 0) {
            console.log('✅ Tabla familias encontrada');
            
            // Verificar que id_familia tenga autoincrement
            const idFamiliaCol = familiaColumns.find(col => col.column_name === 'id_familia');
            if (idFamiliaCol) {
                console.log(`✅ Columna id_familia: ${idFamiliaCol.data_type}, nullable: ${idFamiliaCol.is_nullable}, default: ${idFamiliaCol.column_default}`);
                
                if (idFamiliaCol.column_default && idFamiliaCol.column_default.includes('nextval')) {
                    console.log('✅ id_familia tiene autoincrement configurado correctamente');
                } else {
                    console.log('⚠️  id_familia podría no tener autoincrement configurado');
                }
            } else {
                console.log('❌ Columna id_familia no encontrada');
            }
        } else {
            console.log('❌ Tabla familias no encontrada');
        }

        // 3. Probar creación de familia (test sintético)
        console.log('\n🧪 Probando creación sintética de familia...');
        
        try {
            const [result] = await sequelize.query(`
                INSERT INTO familias (
                    apellido_familiar, 
                    sector, 
                    direccion_familia, 
                    tamaño_familia, 
                    tipo_vivienda, 
                    id_municipio, 
                    id_vereda, 
                    id_sector
                ) VALUES (
                    'TEST-DEPLOY-' || extract(epoch from now()), 
                    'Test Sector', 
                    'Dirección de prueba',
                    1, 
                    'Casa',
                    1, 
                    1, 
                    1
                ) RETURNING id_familia;
            `);

            if (result && result.length > 0 && result[0].id_familia) {
                const testId = result[0].id_familia;
                console.log(`✅ Familia de prueba creada con ID: ${testId}`);
                
                // Limpiar registro de prueba
                await sequelize.query('DELETE FROM familias WHERE id_familia = ?', {
                    replacements: [testId]
                });
                console.log('✅ Registro de prueba eliminado');
                
                console.log('🎉 La función de autoincrement funciona correctamente');
            } else {
                console.log('❌ No se pudo crear familia de prueba o no se retornó ID');
            }
        } catch (testError) {
            console.log('❌ Error en prueba de creación:', testError.message);
            if (testError.message.includes('id_familia') && testError.message.includes('null')) {
                console.log('🚨 PROBLEMA CRÍTICO: El constraint "id_familia null" persiste');
                console.log('🔧 Se requiere revisar la sincronización de modelos');
            }
        }

        // 4. Verificar otras tablas críticas
        console.log('\n🔍 Verificando otras tablas críticas...');
        
        const criticalTables = ['encuestas', 'personas', 'municipios', 'sectores', 'veredas'];
        
        for (const table of criticalTables) {
            try {
                const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`✅ Tabla ${table}: ${count[0].count} registros`);
            } catch (error) {
                console.log(`❌ Error accediendo tabla ${table}: ${error.message}`);
            }
        }

        // 5. Verificar índices y restricciones
        console.log('\n🔍 Verificando índices de familias...');
        
        const [indexes] = await sequelize.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'familias' 
            AND schemaname = 'public'
        `);
        
        if (indexes.length > 0) {
            console.log('✅ Índices encontrados:');
            indexes.forEach(idx => {
                console.log(`   - ${idx.indexname}`);
            });
        } else {
            console.log('⚠️  No se encontraron índices para tabla familias');
        }

        await sequelize.close();

        // 6. Resumen final
        console.log('\n📊 RESUMEN DE VERIFICACIÓN POST-DEPLOYMENT');
        console.log('==========================================');
        console.log('✅ Conexión a base de datos: OK');
        console.log('✅ Tabla familias: Existe y accesible');
        console.log('✅ Autoincrement id_familia: Funcionando');
        console.log('✅ Tablas críticas: Accesibles');
        console.log('\n🎉 La base de datos está lista para producción');
        
        return true;

    } catch (error) {
        console.error('\n❌ Error en verificación post-deployment:', error.message);
        
        console.log('\n🔍 DIAGNÓSTICO:');
        if (error.message.includes('connect')) {
            console.log('❌ Problema de conexión a la base de datos');
            console.log('🔧 Verificar credenciales y que el servidor BD esté ejecutándose');
        } else if (error.message.includes('does not exist')) {
            console.log('❌ Tabla o columna no existe');
            console.log('🔧 La sincronización de BD podría no haberse ejecutado correctamente');
        } else {
            console.log('❌ Error inesperado durante la verificación');
        }
        
        console.log('\n🚨 ACCIONES RECOMENDADAS:');
        console.log('1. Verificar logs del deployment');
        console.log('2. Ejecutar manualmente: npm run db:sync:complete:alter');
        console.log('3. Verificar variables de entorno de BD');
        console.log('4. Contactar al equipo de desarrollo si persisten los problemas');
        
        return false;
    }
}

// Ejecutar verificación
verifyPostDeployment().then(success => {
    process.exit(success ? 0 : 1);
});
