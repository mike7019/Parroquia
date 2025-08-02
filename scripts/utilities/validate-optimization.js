#!/usr/bin/env node
/**
 * Script de validación post-optimización
 * Verifica que todas las optimizaciones se hayan aplicado correctamente
 */

const { Sequelize } = require('sequelize');
const config = require('./config/config.cjs');

const sequelize = new Sequelize(config.development);

async function validateOptimization() {
  try {
    console.log('🔍 VALIDANDO OPTIMIZACIONES DEL ESQUEMA DE BASE DE DATOS...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente\n');

    // ================================================================
    // 1. VERIFICAR ELIMINACIÓN DE TABLAS REDUNDANTES
    // ================================================================
    
    console.log('📋 VERIFICACIÓN 1: Tablas eliminadas correctamente');
    
    const redundantTables = ['parroquia', 'veredas_has_many_familias'];
    
    for (const table of redundantTables) {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${table}'
      `);
      
      if (results.length === 0) {
        console.log(`   ✅ Tabla '${table}' eliminada correctamente`);
      } else {
        console.log(`   ❌ Tabla '${table}' aún existe`);
      }
    }

    // ================================================================
    // 2. VERIFICAR ELIMINACIÓN DE CAMPOS REDUNDANTES  
    // ================================================================
    
    console.log('\n📋 VERIFICACIÓN 2: Campos redundantes eliminados');
    
    // Verificar que campo sexo fue eliminado de personas
    const [personasColumns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'personas' AND column_name = 'sexo'
    `);
    
    if (personasColumns.length === 0) {
      console.log('   ✅ Campo sexo redundante eliminado de personas');
    } else {
      console.log('   ❌ Campo sexo aún existe en personas');
    }

    // ================================================================
    // 3. VERIFICAR OPTIMIZACIÓN DE NOMENCLATURA
    // ================================================================
    
    console.log('\n📋 VERIFICACIÓN 3: Nomenclatura optimizada');
    
    // Verificar tabla persona_destreza
    if (await tableExists('persona_destreza')) {
      const [destrezaColumns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'persona_destreza' 
        AND column_name IN ('id_persona', 'id_destreza')
      `);
      
      if (destrezaColumns.length === 2) {
        console.log('   ✅ Tabla persona_destreza con nomenclatura optimizada');
      } else {
        console.log('   ⚠️  Tabla persona_destreza requiere optimización de nomenclatura');
      }
    }

    // ================================================================
    // 4. VERIFICAR INTEGRIDAD DE RELACIONES
    // ================================================================
    
    console.log('\n📋 VERIFICACIÓN 4: Integridad de relaciones');
    
    // Verificar relaciones críticas
    const criticalRelations = [
      {
        table: 'personas',
        fk: 'id_familia_familias',
        referenced: 'familias',
        referencedPk: 'id_familia'
      },
      {
        table: 'familias', 
        fk: 'id_vereda_veredas',
        referenced: 'veredas',
        referencedPk: 'id_vereda'
      },
      {
        table: 'veredas',
        fk: 'id_municipio_municipios', 
        referenced: 'municipios',
        referencedPk: 'id_municipio'
      }
    ];

    for (const relation of criticalRelations) {
      const [orphanRecords] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM ${relation.table} t
        WHERE t.${relation.fk} IS NOT NULL 
        AND NOT EXISTS (
          SELECT 1 FROM ${relation.referenced} r 
          WHERE r.${relation.referencedPk} = t.${relation.fk}
        )
      `);
      
      if (orphanRecords[0].count === 0) {
        console.log(`   ✅ Relación ${relation.table}.${relation.fk} → ${relation.referenced}.${relation.referencedPk} íntegra`);
      } else {
        console.log(`   ❌ ${orphanRecords[0].count} registros huérfanos en ${relation.table}.${relation.fk}`);
      }
    }

    // ================================================================
    // 5. VERIFICAR ÍNDICES CREADOS
    // ================================================================
    
    console.log('\n📋 VERIFICACIÓN 5: Índices de optimización');
    
    const expectedIndexes = [
      'idx_personas_identificacion',
      'idx_personas_email', 
      'idx_personas_familia',
      'idx_familias_vereda',
      'idx_veredas_municipio'
    ];

    for (const indexName of expectedIndexes) {
      const [indexExists] = await sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = '${indexName}'
      `);
      
      if (indexExists.length > 0) {
        console.log(`   ✅ Índice '${indexName}' creado`);
      } else {
        console.log(`   ⚠️  Índice '${indexName}' no encontrado`);
      }
    }

    // ================================================================
    // 6. RESUMEN DE OPTIMIZACIÓN
    // ================================================================
    
    console.log('\n📊 RESUMEN DE OPTIMIZACIÓN:');
    
    // Contar tablas totales
    const [totalTables] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE '%SequelizeMeta%'
    `);
    
    // Contar relaciones FK
    const [totalFKs] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' 
      AND table_schema = 'public'
    `);
    
    // Contar índices custom
    const [totalIndexes] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
    `);

    console.log(`   📋 Total de tablas: ${totalTables[0].count}`);
    console.log(`   🔗 Total de relaciones FK: ${totalFKs[0].count}`);
    console.log(`   📚 Total de índices custom: ${totalIndexes[0].count}`);

    console.log('\n🎉 VALIDACIÓN DE OPTIMIZACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Función auxiliar
async function tableExists(tableName) {
  try {
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '${tableName}'
    `);
    return results.length > 0;
  } catch (error) {
    return false;
  }
}

// Ejecutar validación
validateOptimization();
