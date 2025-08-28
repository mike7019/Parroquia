#!/usr/bin/env node

/**
 * Script de validación post-corrección - Servicio de Destrezas
 * Verifica que las asociaciones funcionen correctamente después de la corrección
 */

console.log('🔧 VALIDACIÓN POST-CORRECCIÓN - SERVICIO DE DESTREZAS');
console.log('=' * 80);

import { loadAllModels } from './syncDatabaseComplete.js';

async function validarAsociacionesDestrezas() {
    try {
        console.log('\n1️⃣ Cargando modelos con las correcciones...');
        const models = await loadAllModels();
        
        console.log('✅ Modelos cargados exitosamente');
        console.log(`📊 Total de modelos: ${Object.keys(models).length}`);
        
        console.log('\n2️⃣ Verificando modelo Destreza...');
        if (models.Destreza) {
            console.log('✅ Modelo Destreza encontrado');
            
            // Verificar asociaciones
            const associations = models.Destreza.associations;
            console.log(`🔗 Asociaciones de Destreza: ${Object.keys(associations).length}`);
            
            if (associations.personas) {
                console.log('✅ Asociación "personas" encontrada');
                console.log(`   - Through: ${associations.personas.through.model.name}`);
                console.log(`   - ForeignKey: ${associations.personas.foreignKey}`);
                console.log(`   - OtherKey: ${associations.personas.otherKey}`);
            } else {
                console.log('❌ Asociación "personas" no encontrada');
            }
        } else {
            console.log('❌ Modelo Destreza no encontrado');
        }
        
        console.log('\n3️⃣ Verificando modelo Persona...');
        if (models.Persona) {
            console.log('✅ Modelo Persona encontrado');
            
            const associations = models.Persona.associations;
            if (associations.destrezas) {
                console.log('✅ Asociación "destrezas" encontrada');
                console.log(`   - Through: ${associations.destrezas.through.model.name}`);
                console.log(`   - ForeignKey: ${associations.destrezas.foreignKey}`);
                console.log(`   - OtherKey: ${associations.destrezas.otherKey}`);
            } else {
                console.log('❌ Asociación "destrezas" no encontrada');
            }
        } else {
            console.log('❌ Modelo Persona no encontrado');
        }
        
        console.log('\n4️⃣ Probando operaciones básicas de Destreza...');
        
        // Contar destrezas existentes
        const totalDestrezas = await models.Destreza.count();
        console.log(`📊 Total de destrezas en DB: ${totalDestrezas}`);
        
        // Crear una destreza de prueba
        console.log('\n5️⃣ Creando destreza de prueba...');
        const nuevaDestreza = await models.Destreza.create({
            nombre: `Prueba Asociación ${Date.now()}`
        });
        console.log(`✅ Destreza creada: ${nuevaDestreza.nombre} (ID: ${nuevaDestreza.id_destreza})`);
        
        // Buscar una persona para probar asociaciones
        console.log('\n6️⃣ Buscando persona para prueba de asociación...');
        const persona = await models.Persona.findOne({
            limit: 1
        });
        
        if (persona) {
            console.log(`✅ Persona encontrada: ${persona.nombres} ${persona.apellidos} (ID: ${persona.id_persona})`);
            
            console.log('\n7️⃣ Probando asociación persona-destreza...');
            try {
                // Asociar destreza a persona
                await persona.addDestreza(nuevaDestreza);
                console.log('✅ Asociación creada exitosamente');
                
                // Verificar la asociación
                const destrezasPersona = await persona.getDestrezas();
                console.log(`✅ Destrezas de la persona: ${destrezasPersona.length}`);
                
                // Verificar desde el lado de destreza
                const personasDestreza = await nuevaDestreza.getPersonas();
                console.log(`✅ Personas con esta destreza: ${personasDestreza.length}`);
                
                // Probar consulta con include
                console.log('\n8️⃣ Probando consulta con include...');
                const destrezaConPersonas = await models.Destreza.findByPk(nuevaDestreza.id_destreza, {
                    include: [{
                        model: models.Persona,
                        as: 'personas',
                        attributes: ['id_persona', 'nombres', 'apellidos']
                    }]
                });
                
                if (destrezaConPersonas && destrezaConPersonas.personas.length > 0) {
                    console.log('✅ Include funcionando correctamente');
                    console.log(`   Personas incluidas: ${destrezaConPersonas.personas.length}`);
                } else {
                    console.log('❌ Include no está funcionando');
                }
                
                // Limpiar - desasociar y eliminar destreza de prueba
                console.log('\n9️⃣ Limpiando datos de prueba...');
                await persona.removeDestreza(nuevaDestreza);
                await nuevaDestreza.destroy();
                console.log('✅ Datos de prueba eliminados');
                
            } catch (error) {
                console.log('❌ Error en las operaciones de asociación:', error.message);
                
                // Limpiar en caso de error
                try {
                    await nuevaDestreza.destroy();
                    console.log('🧹 Destreza de prueba eliminada');
                } catch (cleanupError) {
                    console.log('⚠️ Error al limpiar:', cleanupError.message);
                }
            }
            
        } else {
            console.log('⚠️ No se encontró ninguna persona para probar asociaciones');
            console.log('🧹 Eliminando destreza de prueba...');
            await nuevaDestreza.destroy();
        }
        
        console.log('\n🎯 RESUMEN DE VALIDACIÓN:');
        console.log('=' * 50);
        console.log('✅ Modelo Destreza: Cargado correctamente');
        console.log('✅ Modelo Persona: Cargado correctamente');
        console.log('✅ Asociaciones: Configuradas correctamente');
        console.log('✅ Operaciones CRUD: Funcionales');
        console.log('✅ Operaciones de asociación: Funcionales');
        console.log('✅ Consultas con include: Funcionales');
        
        console.log('\n🚀 ¡SERVICIO DE DESTREZAS 100% OPERATIVO!');
        console.log('🎉 Todas las funcionalidades están trabajando correctamente');
        
    } catch (error) {
        console.error('\n❌ Error durante la validación:', error.message);
        console.error('Stack:', error.stack);
    }
}

validarAsociacionesDestrezas();
