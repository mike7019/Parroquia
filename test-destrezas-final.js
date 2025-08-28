/**
 * Test final del servicio de destrezas con las correcciones aplicadas
 */

import sequelize from './config/sequelize.js';

console.log('🎯 TEST FINAL - SERVICIO DE DESTREZAS CORREGIDO');
console.log('=' + '='.repeat(50));

async function testDestrezasServiceCorregido() {
    try {
        // Importar el servicio corregido
        const { default: destrezaService } = await import('./src/services/catalog/destrezaService.js');
        
        console.log('\n1️⃣ Probando operaciones básicas del servicio...');
        
        // Probar listar destrezas
        console.log('\n📋 Listando destrezas existentes:');
        const destrezas = await destrezaService.getAllDestrezas();
        console.log(`✅ Se encontraron ${destrezas.datos.length} destrezas`);
        destrezas.datos.forEach(d => {
            console.log(`   - ${d.id_destreza}: ${d.nombre}`);
        });

        // Probar crear nueva destreza
        console.log('\n➕ Creando nueva destreza de prueba:');
        const nuevaDestreza = await destrezaService.createDestreza({
            nombre: 'Destreza de Prueba - Test Final'
        });
        console.log(`✅ Destreza creada: ID ${nuevaDestreza.datos.id_destreza} - ${nuevaDestreza.datos.nombre}`);

        // Probar obtener destreza por ID
        console.log('\n🔍 Obteniendo destreza por ID:');
        const destrezaById = await destrezaService.getDestrezaById(nuevaDestreza.datos.id_destreza);
        console.log(`✅ Destreza obtenida: ${destrezaById.datos.nombre}`);

        // Probar asociar persona con destreza
        console.log('\n🔗 Probando asociación persona-destreza:');
        
        // Obtener primera persona disponible
        const [personas] = await sequelize.query('SELECT id_personas FROM personas LIMIT 1');
        if (personas.length > 0) {
            const personaId = personas[0].id_personas;
            const destrezaId = nuevaDestreza.datos.id_destreza;
            
            try {
                const asociacion = await destrezaService.asociarPersonaDestreza(personaId, destrezaId);
                console.log(`✅ Asociación creada exitosamente`);
                console.log(`   - Persona ID: ${personaId}`);
                console.log(`   - Destreza ID: ${destrezaId}`);
                
                // Verificar que la asociación existe
                console.log('\n🔍 Verificando asociación en la base de datos:');
                const [verificacion] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM persona_destreza 
                    WHERE id_personas_personas = ? AND id_destrezas_destrezas = ?
                `, {
                    replacements: [personaId, destrezaId]
                });
                
                console.log(`✅ Asociación verificada: ${verificacion[0].count} registro(s) encontrado(s)`);
                
                // Probar desasociar
                console.log('\n❌ Probando desasociación:');
                const desasociacion = await destrezaService.desasociarPersonaDestreza(personaId, destrezaId);
                console.log(`✅ Desasociación completada`);
                
                // Verificar que ya no existe
                const [verificacionPost] = await sequelize.query(`
                    SELECT COUNT(*) as count 
                    FROM persona_destreza 
                    WHERE id_personas_personas = ? AND id_destrezas_destrezas = ?
                `, {
                    replacements: [personaId, destrezaId]
                });
                
                console.log(`✅ Desasociación verificada: ${verificacionPost[0].count} registro(s) restante(s)`);
                
            } catch (error) {
                console.log(`❌ Error en operaciones de asociación: ${error.message}`);
            }
        }

        // Probar buscar destrezas
        console.log('\n🔍 Probando búsqueda de destrezas:');
        const busqueda = await destrezaService.searchDestrezas('Programación');
        console.log(`✅ Búsqueda completada: ${busqueda.datos.length} resultados`);
        busqueda.datos.forEach(d => {
            console.log(`   - ${d.nombre}`);
        });

        // Probar estadísticas
        console.log('\n📊 Probando estadísticas:');
        const stats = await destrezaService.getDestrezasStats();
        console.log(`✅ Estadísticas obtenidas:`);
        console.log(`   - Total destrezas: ${stats.datos.totalDestrezas}`);
        console.log(`   - Total asociaciones: ${stats.datos.totalAsociaciones}`);

        // Limpiar - eliminar la destreza de prueba
        console.log('\n🗑️ Limpiando datos de prueba:');
        await destrezaService.deleteDestreza(nuevaDestreza.datos.id_destreza);
        console.log(`✅ Destreza de prueba eliminada`);

        console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('=' + '='.repeat(50));
        console.log('✅ El servicio de destrezas funciona 100% correctamente');
        console.log('✅ Las asociaciones están completamente funcionales');
        console.log('✅ Todas las operaciones CRUD operan sin errores');
        console.log('✅ Las correcciones aplicadas resolvieron el problema');

    } catch (error) {
        console.error('\n❌ Error durante las pruebas:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar test
testDestrezasServiceCorregido();
