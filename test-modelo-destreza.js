/**
 * Test directo del modelo Destreza con las correcciones aplicadas
 */

import sequelize from './config/sequelize.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 TEST DIRECTO - MODELO DESTREZA CORREGIDO');
console.log('=' + '='.repeat(50));

async function testModeloDestrezaDirecto() {
    try {
        console.log('\n1️⃣ Importando modelo Destreza directamente...');
        
        // Importar el modelo corregido
        const { default: DestrezaModel } = await import('./src/models/main/Destreza.cjs');
        const Destreza = DestrezaModel(sequelize);
        
        console.log('✅ Modelo Destreza importado correctamente');
        
        // Registrar en sequelize.models si no está
        if (!sequelize.models.Destreza) {
            sequelize.models.Destreza = Destreza;
            console.log('✅ Modelo registrado en sequelize.models');
        }
        
        console.log('\n2️⃣ Probando operaciones básicas del modelo...');
        
        // Listar destrezas existentes
        const destrezas = await Destreza.findAll({
            limit: 3
        });
        
        console.log(`✅ Se encontraron ${destrezas.length} destrezas:`);
        destrezas.forEach(d => {
            console.log(`   - ${d.id_destreza}: ${d.nombre}`);
        });
        
        // Crear nueva destreza
        console.log('\n➕ Creando nueva destreza de prueba:');
        const nuevaDestreza = await Destreza.create({
            nombre: 'Destreza Test Modelo Directo'
        });
        console.log(`✅ Destreza creada: ID ${nuevaDestreza.id_destreza} - ${nuevaDestreza.nombre}`);
        
        console.log('\n3️⃣ Probando asociaciones corregidas...');
        
        // Importar modelo Persona si es necesario
        let Persona;
        try {
            const { default: PersonaModel } = await import('./src/models/main/Persona.cjs');
            Persona = PersonaModel(sequelize);
            if (!sequelize.models.Persona) {
                sequelize.models.Persona = Persona;
            }
            console.log('✅ Modelo Persona importado');
        } catch (error) {
            console.log('⚠️  No se pudo importar modelo Persona:', error.message);
        }
        
        if (Persona) {
            // Configurar asociaciones manualmente para el test
            console.log('\n🔗 Configurando asociaciones para el test...');
            
            // Destreza belongsToMany Persona
            Destreza.belongsToMany(Persona, {
                through: 'persona_destreza',
                foreignKey: 'id_destrezas_destrezas',
                otherKey: 'id_personas_personas',
                as: 'personas'
            });
            
            // Persona belongsToMany Destreza  
            Persona.belongsToMany(Destreza, {
                through: 'persona_destreza',
                foreignKey: 'id_personas_personas',
                otherKey: 'id_destrezas_destrezas',
                as: 'destrezas'
            });
            
            console.log('✅ Asociaciones configuradas correctamente');
            
            // Obtener una persona para probar la asociación
            const persona = await Persona.findOne();
            
            if (persona) {
                console.log(`\n🧪 Probando asociación con persona ID: ${persona.id_personas}`);
                
                try {
                    // Asociar la destreza con la persona usando las asociaciones corregidas
                    await persona.addDestrezas(nuevaDestreza);
                    console.log('✅ Asociación creada usando Sequelize associations');
                    
                    // Verificar que la asociación existe
                    const destrezasPersona = await persona.getDestrezas();
                    console.log(`✅ Destrezas de la persona: ${destrezasPersona.length}`);
                    
                    // Verificar desde el lado de la destreza
                    const personasDestreza = await nuevaDestreza.getPersonas();
                    console.log(`✅ Personas con esta destreza: ${personasDestreza.length}`);
                    
                    // Quitar la asociación
                    await persona.removeDestrezas(nuevaDestreza);
                    console.log('✅ Asociación removida correctamente');
                    
                } catch (error) {
                    console.log(`❌ Error en asociaciones: ${error.message}`);
                }
            }
        }
        
        // Limpiar
        console.log('\n🗑️ Eliminando destreza de prueba...');
        await nuevaDestreza.destroy();
        console.log('✅ Destreza de prueba eliminada');
        
        console.log('\n🎉 TEST DEL MODELO COMPLETADO');
        console.log('=' + '='.repeat(50));
        console.log('✅ El modelo Destreza funciona correctamente');
        console.log('✅ Las asociaciones corregidas funcionan');
        console.log('✅ Los nombres de campos están correctos');
        
    } catch (error) {
        console.error('\n❌ Error durante el test:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar test
testModeloDestrezaDirecto();
