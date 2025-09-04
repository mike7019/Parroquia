import sequelize from './config/sequelize.js';

async function verificarTablasDestrezas() {
    try {
        console.log('🔍 Verificando tablas relacionadas con destrezas...');
        
        // Verificar tabla destrezas
        console.log('\n📋 Verificando tabla "destrezas":');
        const [destrezasExists] = await sequelize.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'destrezas'
            );
        `);
        console.log(`   Existe: ${destrezasExists[0].exists ? '✅' : '❌'}`);
        
        // Verificar tabla persona_destreza
        console.log('\n🔗 Verificando tabla "persona_destreza":');
        const [personaDestrezaExists] = await sequelize.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'persona_destreza'
            );
        `);
        console.log(`   Existe: ${personaDestrezaExists[0].exists ? '✅' : '❌'}`);
        
        // Si la tabla persona_destreza no existe, crearla
        if (!personaDestrezaExists[0].exists) {
            console.log('\n🛠️  Creando tabla "persona_destreza"...');
            await sequelize.query(`
                CREATE TABLE "persona_destreza" (
                    "id_personas_personas" BIGINT NOT NULL,
                    "id_destrezas_destrezas" BIGINT NOT NULL,
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    PRIMARY KEY ("id_personas_personas", "id_destrezas_destrezas"),
                    FOREIGN KEY ("id_personas_personas") REFERENCES "personas"("id_personas") ON DELETE CASCADE,
                    FOREIGN KEY ("id_destrezas_destrezas") REFERENCES "destrezas"("id_destreza") ON DELETE CASCADE
                );
            `);
            console.log('   ✅ Tabla "persona_destreza" creada exitosamente');
        }
        
        // Verificar si existe la tabla destrezas, si no crearla
        if (!destrezasExists[0].exists) {
            console.log('\n🛠️  Creando tabla "destrezas"...');
            await sequelize.query(`
                CREATE TABLE "destrezas" (
                    "id_destreza" BIGSERIAL PRIMARY KEY,
                    "nombre" VARCHAR(255) NOT NULL UNIQUE,
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                );
            `);
            console.log('   ✅ Tabla "destrezas" creada exitosamente');
            
            // Insertar algunas destrezas de ejemplo
            console.log('\n📦 Insertando destrezas de ejemplo...');
            await sequelize.query(`
                INSERT INTO "destrezas" ("nombre") VALUES 
                ('Programación'),
                ('Diseño Gráfico'),
                ('Cocina'),
                ('Carpintería'),
                ('Música'),
                ('Enseñanza'),
                ('Agricultura'),
                ('Mecánica'),
                ('Costura'),
                ('Electricidad')
                ON CONFLICT (nombre) DO NOTHING;
            `);
            console.log('   ✅ Destrezas de ejemplo insertadas');
        }
        
        // Verificar conteo de destrezas
        const [countDestrezas] = await sequelize.query('SELECT COUNT(*) as total FROM destrezas;');
        console.log(`\n📊 Total destrezas en la base de datos: ${countDestrezas[0].total}`);
        
        // Verificar conteo de asociaciones
        if (personaDestrezaExists[0].exists || !personaDestrezaExists[0].exists) {
            try {
                const [countAsociaciones] = await sequelize.query('SELECT COUNT(*) as total FROM persona_destreza;');
                console.log(`📊 Total asociaciones persona-destreza: ${countAsociaciones[0].total}`);
            } catch (err) {
                console.log('⚠️  No se pudo verificar asociaciones (tabla puede no existir aún)');
            }
        }
        
        console.log('\n✅ Verificación completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
}

// Ejecutar verificación
verificarTablasDestrezas()
    .then(() => {
        console.log('🎉 Script de verificación finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script falló:', error.message);
        process.exit(1);
    });
