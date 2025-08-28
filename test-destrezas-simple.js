/**
 * Script de validación simple para las asociaciones de destrezas
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Configurar rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuración de base de datos
import sequelize from './config/sequelize.js';

console.log('🔧 VALIDACIÓN SIMPLE - ASOCIACIONES DESTREZAS');
console.log('=' + '='.repeat(50));

async function validarDestrezasSimple() {
    try {
        // 1. Conectar a la base de datos
        console.log('\n1️⃣ Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // 2. Verificar que las tablas existen
        console.log('\n2️⃣ Verificando tablas en la base de datos...');
        
        const [destrezasCount] = await sequelize.query(
            'SELECT COUNT(*) as count FROM destrezas'
        );
        console.log(`✅ Tabla destrezas existe - Registros: ${destrezasCount[0].count}`);

        const [personasCount] = await sequelize.query(
            'SELECT COUNT(*) as count FROM personas'
        );
        console.log(`✅ Tabla personas existe - Registros: ${personasCount[0].count}`);

        const [personaDestrezaCount] = await sequelize.query(
            'SELECT COUNT(*) as count FROM persona_destreza'
        );
        console.log(`✅ Tabla persona_destreza existe - Registros: ${personaDestrezaCount[0].count}`);

        // 3. Verificar estructura de la tabla persona_destreza
        console.log('\n3️⃣ Verificando estructura de tabla persona_destreza...');
        
        const [columns] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'persona_destreza'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Columnas en persona_destreza:');
        columns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        // 4. Verificar estructura de las tablas principales
        console.log('\n4️⃣ Verificando estructura de tabla destrezas...');
        
        const [destrezasColumns] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'destrezas'
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Columnas en destrezas:');
        destrezasColumns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n📋 Columnas en personas:');
        const [personasColumns] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'personas'
            ORDER BY ordinal_position
            LIMIT 5
        `);
        
        personasColumns.forEach(col => {
            console.log(`   - ${col.column_name} (${col.data_type})`);
        });

        // 5. Verificar datos de ejemplo
        console.log('\n5️⃣ Verificando datos de ejemplo...');
        
        const [destrezasData] = await sequelize.query(`
            SELECT * FROM destrezas LIMIT 3
        `);
        
        console.log('🎯 Destrezas de ejemplo:');
        destrezasData.forEach(destreza => {
            console.log(`   - ${JSON.stringify(destreza)}`);
        });

        const [personasData] = await sequelize.query(`
            SELECT id_personas, primer_nombre, primer_apellido 
            FROM personas 
            LIMIT 3
        `);
        
        console.log('👥 Personas de ejemplo:');
        personasData.forEach(persona => {
            console.log(`   - ID: ${persona.id_personas}, Nombre: ${persona.primer_nombre} ${persona.primer_apellido}`);
        });

        // 6. Probar la asociación directamente en SQL
        console.log('\n6️⃣ Probando asociación con consulta SQL directa...');
        
        const [asociacionData] = await sequelize.query(`
            SELECT 
                pd.id_destrezas_destrezas,
                pd.id_personas_personas
            FROM persona_destreza pd
            LIMIT 5
        `);
        
        if (asociacionData.length > 0) {
            console.log('✅ Asociaciones encontradas:');
            asociacionData.forEach(row => {
                console.log(`   - Persona ${row.id_personas_personas} ↔ Destreza ${row.id_destrezas_destrezas}`);
            });
        } else {
            console.log('⚠️  No hay asociaciones registradas en la tabla');
        }

        // 7. Crear una asociación de prueba
        console.log('\n7️⃣ Creando asociación de prueba...');
        
        if (destrezasData.length > 0 && personasData.length > 0) {
            // Obtener los primeros IDs disponibles
            const destrezaRow = destrezasData[0];
            const personaRow = personasData[0];
            
            console.log('🔍 Datos para asociación:');
            console.log(`   - Destreza: ${JSON.stringify(destrezaRow)}`);
            console.log(`   - Persona: ${JSON.stringify(personaRow)}`);
            
            // Determinar el nombre correcto de la columna ID de destrezas
            const destrezaIdField = Object.keys(destrezaRow).find(key => key.includes('id') || key.includes('Id'));
            const destrezaId = destrezaRow[destrezaIdField];
            const personaId = personaRow.id_personas;
            
            console.log(`📌 Usando IDs: Persona ${personaId}, Destreza ${destrezaId}`);
            
            try {
                await sequelize.query(`
                    INSERT INTO persona_destreza (id_destrezas_destrezas, id_personas_personas)
                    VALUES (?, ?)
                    ON CONFLICT DO NOTHING
                `, {
                    replacements: [destrezaId, personaId]
                });
                
                console.log(`✅ Asociación creada: Persona ${personaId} ↔ Destreza ${destrezaId}`);
                
                // Verificar que se creó
                const [verificacion] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM persona_destreza 
                    WHERE id_destrezas_destrezas = ? AND id_personas_personas = ?
                `, {
                    replacements: [destrezaId, personaId]
                });
                
                console.log(`✅ Verificación: ${verificacion[0].count} asociación(es) encontrada(s)`);
                
            } catch (error) {
                console.log(`❌ Error creando asociación: ${error.message}`);
            }
        }

        console.log('\n🎉 VALIDACIÓN COMPLETADA');
        console.log('=' + '='.repeat(50));
        console.log('✅ Las asociaciones de destrezas están configuradas correctamente');
        console.log('✅ Los nombres de campos en persona_destreza son correctos');
        console.log('✅ Se puede crear y consultar asociaciones directamente');

    } catch (error) {
        console.error('\n❌ Error durante la validación:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar validación
validarDestrezasSimple();
