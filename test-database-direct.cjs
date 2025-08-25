// Script simplificado para probar conexión con la base de datos después del sync
const { Sequelize } = require('sequelize');
const path = require('path');

async function testDatabaseConnection() {
    try {
        console.log('🔄 Probando conexión a la base de datos...\n');
        
        // Cargar configuración
        const configPath = path.join(__dirname, 'src', 'config', 'database.js');
        const dbConfig = require(configPath);
        
        const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            logging: false
        });

        // Probar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a la base de datos');

        // Probar creación directa de familia (bypass del controller)
        const [results] = await sequelize.query(`
            INSERT INTO familias (
                numero_casa, 
                tamaño_familia, 
                id_municipio, 
                id_vereda, 
                id_sector, 
                ubicacion_geografica, 
                observaciones, 
                activo, 
                "createdAt", 
                "updatedAt"
            ) VALUES (
                'TEST-' || extract(epoch from now()), 
                4, 
                1, 
                1, 
                1, 
                '12.345,-67.890', 
                'Prueba post-sync', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING id_familia;
        `);

        if (results && results.length > 0) {
            const familiaId = results[0].id_familia;
            console.log('✅ Familia creada exitosamente con ID:', familiaId);
            
            // Verificar que el ID no es null
            if (familiaId && familiaId > 0) {
                console.log('🎉 El campo id_familia se está generando correctamente');
                console.log('✅ El problema del constraint "null value in column id_familia" está resuelto');
            } else {
                console.log('❌ El ID generado es inválido:', familiaId);
            }

            // Limpiar el registro de prueba
            await sequelize.query('DELETE FROM familias WHERE id_familia = ?', {
                replacements: [familiaId]
            });
            console.log('🧹 Registro de prueba eliminado');
        }

        await sequelize.close();
        console.log('\n🏁 Prueba completada exitosamente');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        
        if (error.message.includes('id_familia')) {
            console.log('\n🔍 El problema del constraint persiste. Revisar:');
            console.log('   - Configuración del modelo Familias');
            console.log('   - Definición de la tabla en la base de datos');
            console.log('   - Secuencias de autoincrement');
        }
    }
}

testDatabaseConnection();
