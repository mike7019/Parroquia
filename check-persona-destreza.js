#!/usr/bin/env node

/**
 * Script para verificar la estructura real de la tabla persona_destreza
 */

import sequelize from './config/sequelize.js';

async function checkPersonaDestrezaTable() {
    try {
        console.log('🔍 Verificando estructura de tabla persona_destreza...\n');
        
        const [results] = await sequelize.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'persona_destreza'
            ORDER BY ordinal_position;
        `);
        
        console.log('📊 Estructura de tabla persona_destreza:');
        console.log('=' * 50);
        
        if (results.length === 0) {
            console.log('❌ La tabla persona_destreza NO EXISTE');
        } else {
            results.forEach(col => {
                console.log(`📋 ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }
        
        // Verificar índices y claves
        const [indexes] = await sequelize.query(`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE tablename = 'persona_destreza';
        `);
        
        console.log('\n🔗 Índices y claves:');
        console.log('=' * 30);
        
        if (indexes.length === 0) {
            console.log('❌ No hay índices definidos');
        } else {
            indexes.forEach(idx => {
                console.log(`🔑 ${idx.indexname}`);
                console.log(`   ${idx.indexdef}`);
            });
        }
        
        // Verificar datos existentes
        const [count] = await sequelize.query(`
            SELECT COUNT(*) as total FROM persona_destreza;
        `);
        
        console.log(`\n📈 Total de registros: ${count[0].total}`);
        
        // Si hay datos, mostrar algunos ejemplos
        if (count[0].total > 0) {
            const [samples] = await sequelize.query(`
                SELECT * FROM persona_destreza LIMIT 5;
            `);
            
            console.log('\n📋 Primeros 5 registros:');
            console.table(samples);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

checkPersonaDestrezaTable();
