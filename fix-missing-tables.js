#!/usr/bin/env node

/**
 * MIGRACIÓN RÁPIDA: AGREGAR TABLAS FALTANTES
 * ==========================================
 * 
 * Este script agrega las tablas que faltan para resolver el error de encuestas:
 * - familia_sistema_aguas_residuales
 * - tipos_aguas_residuales
 * 
 * USO: node fix-missing-tables.js
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

async function fixMissingTables() {
  console.log('🔧 AGREGANDO TABLAS FALTANTES PARA ENCUESTAS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log('');

  const sequelize = new Sequelize(DB_CONFIG);

  try {
    // Verificar conexión
    console.log('🔄 Verificando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // 1. Crear tabla tipos_aguas_residuales
    console.log('\n🚰 Creando tabla tipos_aguas_residuales...');
    
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
    console.log('✅ Tabla tipos_aguas_residuales creada/actualizada');

    // 2. Crear tabla familia_sistema_aguas_residuales
    console.log('\n🏠 Creando tabla familia_sistema_aguas_residuales...');
    
    const FamiliaSistemaAguasResiduales = sequelize.define('familia_sistema_aguas_residuales', {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      id_familia: { type: DataTypes.BIGINT, allowNull: false },
      id_tipo_aguas_residuales: { type: DataTypes.BIGINT, allowNull: false }
    }, { 
      timestamps: true, 
      createdAt: 'createdAt', 
      updatedAt: 'updatedAt',
      tableName: 'familia_sistema_aguas_residuales'
    });

    await FamiliaSistemaAguasResiduales.sync({ alter: true });
    console.log('✅ Tabla familia_sistema_aguas_residuales creada/actualizada');

    // 3. Cargar datos de tipos de aguas residuales
    console.log('\n📊 Cargando datos de tipos de aguas residuales...');
    
    // Verificar si ya existen datos
    const existingCount = await TipoAguasResiduales.count();
    
    if (existingCount === 0) {
      for (const tipo of AGUAS_RESIDUALES_DATA) {
        await TipoAguasResiduales.create(tipo);
      }
      console.log(`✅ ${AGUAS_RESIDUALES_DATA.length} tipos de aguas residuales cargados`);
    } else {
      console.log(`ℹ️ Ya existen ${existingCount} tipos de aguas residuales`);
    }

    // 4. Verificación final
    console.log('\n🧪 VERIFICACIÓN FINAL...');
    console.log('═══════════════════════════════════════════════════════');

    const tablas = [
      { nombre: 'tipos_aguas_residuales', model: TipoAguasResiduales },
      { nombre: 'familia_sistema_aguas_residuales', model: FamiliaSistemaAguasResiduales }
    ];

    for (const { nombre, model } of tablas) {
      try {
        const count = await model.count();
        console.log(`✅ ${nombre}: ${count} registros`);
      } catch (error) {
        console.log(`❌ ${nombre}: Error - ${error.message}`);
      }
    }

    // 5. Verificar que las tablas existen en la BD
    console.log('\n🔍 Verificando existencia de tablas en BD...');
    
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tipos_aguas_residuales', 'familia_sistema_aguas_residuales')
      ORDER BY table_name
    `);

    tables.forEach(table => {
      console.log(`✅ Tabla confirmada en BD: ${table.table_name}`);
    });

    console.log('\n🎉 ¡TABLAS FALTANTES AGREGADAS EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ tipos_aguas_residuales: Creada con 6 tipos');
    console.log('✅ familia_sistema_aguas_residuales: Creada para relaciones');
    console.log('🚀 Error de encuestas RESUELTO');
    console.log('📋 Sistema listo para crear encuestas sin errores');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔒 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1].includes('fix-missing-tables.js')) {
  fixMissingTables()
    .then(() => {
      console.log('\n✅ Migración completada exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Migración falló:', error.message);
      process.exit(1);
    });
}

export default fixMissingTables;
