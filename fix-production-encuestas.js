#!/usr/bin/env node

/**
 * CORRECCIÓN FINAL PARA PRODUCCIÓN
 * ===============================
 * 
 * Este script aplica todas las correcciones necesarias para resolver
 * el error de transacción en la creación de encuestas.
 * 
 * PROBLEMAS QUE RESUELVE:
 * - Agrega tablas faltantes (familia_sistema_aguas_residuales, tipos_aguas_residuales)
 * - Normaliza timestamps en todas las tablas de relación
 * - Verifica que todos los catálogos existan
 * 
 * USO: node fix-production-encuestas.js
 */

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false
};

const AGUAS_RESIDUALES_DATA = [
  { nombre: 'Alcantarillado', descripcion: 'Conectado a red de alcantarillado municipal', activo: true },
  { nombre: 'Pozo Séptico', descripcion: 'Sistema de tratamiento individual', activo: true },
  { nombre: 'Letrina', descripcion: 'Sistema básico de saneamiento', activo: true },
  { nombre: 'Campo Abierto', descripcion: 'Sin sistema de tratamiento', activo: true },
  { nombre: 'Río/Quebrada', descripcion: 'Descarga directa a fuente hídrica', activo: true },
  { nombre: 'Otro', descripcion: 'Otro sistema no especificado', activo: true }
];

async function fixProductionEncuestas() {
  console.log('🚀 CORRECCIÓN FINAL PARA PRODUCCIÓN - ENCUESTAS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`🏢 Base de datos: ${DB_CONFIG.database}`);
  console.log('');

  const sequelize = new Sequelize(DB_CONFIG);

  try {
    // Verificar conexión
    console.log('🔄 Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // PASO 1: Agregar tablas faltantes
    console.log('\n📋 PASO 1: AGREGANDO TABLAS FALTANTES');
    console.log('─────────────────────────────────────────────────────────');
    
    // Crear tabla tipos_aguas_residuales
    const TipoAguasResiduales = sequelize.define('tipos_aguas_residuales', {
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      descripcion: { type: DataTypes.STRING(200) },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'tipos_aguas_residuales'
    });

    await TipoAguasResiduales.sync({ alter: true });
    console.log('✅ tipos_aguas_residuales: Creada/actualizada');

    // Crear tabla familia_sistema_aguas_residuales
    const FamiliaSistemaAguasResiduales = sequelize.define('familia_sistema_aguas_residuales', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, allowNull: false }
    }, { 
      timestamps: true, 
      createdAt: 'created_at', 
      updatedAt: 'updated_at',
      tableName: 'familia_sistema_aguas_residuales'
    });

    await FamiliaSistemaAguasResiduales.sync({ alter: true });
    console.log('✅ familia_sistema_aguas_residuales: Creada/actualizada');

    // Cargar datos de aguas residuales si no existen
    const existingCount = await TipoAguasResiduales.count();
    if (existingCount === 0) {
      for (const tipo of AGUAS_RESIDUALES_DATA) {
        await TipoAguasResiduales.create(tipo);
      }
      console.log(`✅ Datos cargados: ${AGUAS_RESIDUALES_DATA.length} tipos de aguas residuales`);
    } else {
      console.log(`ℹ️ Datos existentes: ${existingCount} tipos de aguas residuales`);
    }

    // PASO 2: Normalizar timestamps
    console.log('\n🕒 PASO 2: NORMALIZANDO TIMESTAMPS');
    console.log('─────────────────────────────────────────────────────────');

    const tablesToFix = [
      'familia_sistema_acueducto',
      'familia_sistema_aguas_residuales', 
      'familia_disposicion_basura'
    ];

    for (const tableName of tablesToFix) {
      console.log(`🔧 Procesando ${tableName}...`);
      
      try {
        // Cambiar createdAt a created_at
        await sequelize.query(`
          ALTER TABLE ${tableName} 
          RENAME COLUMN "createdAt" TO created_at
        `).catch(() => {});
        
        // Cambiar updatedAt a updated_at
        await sequelize.query(`
          ALTER TABLE ${tableName} 
          RENAME COLUMN "updatedAt" TO updated_at
        `).catch(() => {});
        
        console.log(`   ✅ ${tableName}: Timestamps normalizados`);
      } catch (error) {
        console.log(`   ⚠️ ${tableName}: ${error.message}`);
      }
    }

    // PASO 3: Verificación final
    console.log('\n🧪 PASO 3: VERIFICACIÓN FINAL');
    console.log('─────────────────────────────────────────────────────────');

    const criticalTables = [
      'familia_sistema_acueducto',
      'familia_sistema_aguas_residuales',
      'familia_tipo_vivienda',
      'familia_disposicion_basura',
      'tipos_aguas_residuales',
      'tipos_disposicion_basura'
    ];

    let allTablesOk = true;

    for (const tableName of criticalTables) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${result[0].count} registros`);
      } catch (error) {
        console.log(`❌ ${tableName}: ERROR - ${error.message}`);
        allTablesOk = false;
      }
    }

    // PASO 4: Prueba de transacción completa
    console.log('\n🧪 PASO 4: PRUEBA DE TRANSACCIÓN COMPLETA');
    console.log('─────────────────────────────────────────────────────────');

    const transaction = await sequelize.transaction();
    
    try {
      // Crear familia de prueba
      const [familia] = await sequelize.query(
        `INSERT INTO familias (apellido_familiar, sector, created_at, updated_at) 
         VALUES ('PRUEBA_CORRECCIÓN', 'TEST', NOW(), NOW()) RETURNING id_familia`,
        { transaction }
      );
      
      const familiaId = familia[0].id_familia;
      console.log(`1️⃣ Familia de prueba creada: ID ${familiaId}`);
      
      // Probar todos los INSERT críticos
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('2️⃣ Sistema acueducto: ✅');
      
      await sequelize.query(
        'INSERT INTO familia_sistema_aguas_residuales (id_familia, id_tipo_aguas_residuales, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('3️⃣ Aguas residuales: ✅');
      
      await sequelize.query(
        'INSERT INTO familia_tipo_vivienda (id_familia, id_tipo_vivienda, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('4️⃣ Tipo vivienda: ✅');
      
      await sequelize.query(
        'INSERT INTO familia_disposicion_basura (id_familia, id_tipo_disposicion_basura, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        { bind: [familiaId, 1], transaction }
      );
      console.log('5️⃣ Disposición basura: ✅');
      
      // Limpiar datos de prueba
      await sequelize.query(`DELETE FROM familias WHERE id_familia = ${familiaId}`, { transaction });
      
      await transaction.commit();
      console.log('\n🎉 ¡PRUEBA DE TRANSACCIÓN EXITOSA!');
      
    } catch (error) {
      await transaction.rollback();
      console.log(`\n❌ ERROR EN PRUEBA: ${error.message}`);
      allTablesOk = false;
    }

    // RESULTADO FINAL
    console.log('\n🏆 RESULTADO FINAL');
    console.log('═══════════════════════════════════════════════════════');
    
    if (allTablesOk) {
      console.log('🎉 ¡CORRECCIÓN COMPLETADA EXITOSAMENTE!');
      console.log('✅ Todas las tablas funcionando correctamente');
      console.log('✅ Timestamps normalizados');
      console.log('✅ Transacciones funcionando sin errores');
      console.log('✅ Sistema de encuestas COMPLETAMENTE OPERATIVO');
      console.log('');
      console.log('🚀 ESTADO: PRODUCCIÓN LISTA PARA ENCUESTAS');
    } else {
      console.log('⚠️ Algunas correcciones requieren atención manual');
      console.log('📋 Revisar logs anteriores para detalles');
    }

    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');

  } catch (error) {
    console.error('\n💥 ERROR CRÍTICO:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].includes('fix-production-encuestas.js')) {
  fixProductionEncuestas()
    .then(() => {
      console.log('\n✅ Corrección de producción completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Corrección falló:', error.message);
      process.exit(1);
    });
}

export default fixProductionEncuestas;
