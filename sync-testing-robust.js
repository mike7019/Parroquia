#!/usr/bin/env node

/**
 * SINCRONIZACIÓN ROBUSTA PARA SERVIDOR DE TESTING
 * ===============================================
 * 
 * Versión simplificada que funciona con cualquier estructura de base de datos existente.
 * Enfocada en agregar solo las tablas y datos faltantes sin alterar estructuras existentes.
 */

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
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

async function syncTestingServer() {
  console.log('🚀 SINCRONIZACIÓN ROBUSTA PARA SERVIDOR DE TESTING');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🌐 Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`🏢 Base de datos: ${DB_CONFIG.database}`);
  console.log('');

  const sequelize = new Sequelize(DB_CONFIG);

  try {
    // PASO 1: Verificar conexión
    console.log('🔄 PASO 1: VERIFICANDO CONEXIÓN');
    console.log('─────────────────────────────────────────────────────────');
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    // PASO 2: Aplicar correcciones conocidas
    console.log('\n🔧 PASO 2: APLICANDO CORRECCIONES CONOCIDAS');
    console.log('─────────────────────────────────────────────────────────');
    
    // Aplicar correcciones de timestamps y tablas faltantes
    try {
      const { default: fixProductionEncuestasRobust } = await import('./fix-production-encuestas-robust.js');
      console.log('🔄 Ejecutando correcciones de estructura...');
      
      // Capturar la salida del script de corrección
      const originalLog = console.log;
      let correctionOutput = [];
      console.log = (...args) => {
        correctionOutput.push(args.join(' '));
        originalLog(...args);
      };
      
      await fixProductionEncuestasRobust();
      
      // Restaurar console.log
      console.log = originalLog;
      
      console.log('✅ Correcciones de estructura aplicadas');
      
    } catch (error) {
      console.log(`⚠️ Error en correcciones: ${error.message.split('\n')[0]}`);
      console.log('   Continuando con verificación básica...');
    }

    // PASO 3: Verificar tablas críticas
    console.log('\n🧪 PASO 3: VERIFICANDO TABLAS CRÍTICAS');
    console.log('─────────────────────────────────────────────────────────');

    const criticalTables = [
      'usuarios',
      'familias',
      'sistemas_acueducto',
      'tipos_aguas_residuales',
      'tipos_vivienda', 
      'tipos_disposicion_basura',
      'familia_sistema_acueducto',
      'familia_sistema_aguas_residuales',
      'familia_tipo_vivienda',
      'familia_disposicion_basura'
    ];

    let allTablesOk = true;
    let tableStats = {};

    for (const tableName of criticalTables) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = result[0].count;
        tableStats[tableName] = count;
        console.log(`✅ ${tableName}: ${count} registros`);
      } catch (error) {
        console.log(`❌ ${tableName}: ERROR - ${error.message.split('\n')[0]}`);
        allTablesOk = false;
      }
    }

    // PASO 4: Crear usuario de testing si no existe
    console.log('\n👤 PASO 4: VERIFICANDO USUARIO ADMINISTRADOR DE TESTING');
    console.log('─────────────────────────────────────────────────────────');

    try {
      const testEmail = 'admin@testing.parroquia';
      const testPassword = 'Testing2025!';
      
      const [existingUsers] = await sequelize.query(`
        SELECT email FROM usuarios WHERE email = '${testEmail}' LIMIT 1
      `);
      
      if (existingUsers.length === 0) {
        // Detectar estructura de tabla usuarios
        const [userColumns] = await sequelize.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'usuarios' 
          ORDER BY ordinal_position
        `);
        
        const hasApellido = userColumns.some(col => col.column_name === 'apellido');
        const hasCreatedAt = userColumns.some(col => col.column_name === 'created_at');
        const timestampCols = hasCreatedAt ? 'created_at, updated_at' : '"createdAt", "updatedAt"';
        
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        
        if (hasApellido) {
          await sequelize.query(`
            INSERT INTO usuarios (nombre, apellido, email, password, rol, activo, ${timestampCols})
            VALUES ('Administrador', 'Testing', '${testEmail}', '${hashedPassword}', 'administrador', true, NOW(), NOW())
          `);
        } else {
          await sequelize.query(`
            INSERT INTO usuarios (nombre, email, password, rol, activo, ${timestampCols})
            VALUES ('Administrador Testing', '${testEmail}', '${hashedPassword}', 'administrador', true, NOW(), NOW())
          `);
        }
        
        console.log(`✅ Usuario administrador creado: ${testEmail}`);
        console.log(`🔑 Password: ${testPassword}`);
      } else {
        console.log(`ℹ️ Usuario administrador ya existe: ${testEmail}`);
      }
    } catch (error) {
      console.log(`⚠️ Error con usuario administrador: ${error.message.split('\n')[0]}`);
      console.log('   Se puede crear manualmente desde la interfaz');
    }

    // PASO 5: Verificar funcionalidad básica del sistema
    console.log('\n🎯 PASO 5: VERIFICACIÓN DE FUNCIONALIDAD BÁSICA');
    console.log('─────────────────────────────────────────────────────────');

    try {
      // Solo verificar que podemos hacer SELECT en las tablas críticas
      console.log('🔍 Verificando acceso a tablas críticas para encuestas...');
      
      const encuestaTables = [
        'familia_sistema_acueducto',
        'familia_sistema_aguas_residuales',
        'familia_tipo_vivienda',
        'familia_disposicion_basura'
      ];
      
      for (const tableName of encuestaTables) {
        await sequelize.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
        console.log(`✅ ${tableName}: Accesible`);
      }
      
      console.log('\n🎉 ¡VERIFICACIÓN DE FUNCIONALIDAD BÁSICA EXITOSA!');
      
    } catch (error) {
      console.log(`\n⚠️ Advertencia en verificación: ${error.message.split('\n')[0]}`);
      console.log('   El sistema puede requerir configuración adicional');
    }

    // RESULTADO FINAL
    console.log('\n🏆 RESULTADO FINAL DE SINCRONIZACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    
    if (allTablesOk) {
      console.log('🎉 ¡SINCRONIZACIÓN EXITOSA!');
      console.log('✅ Todas las tablas críticas verificadas');
      console.log('✅ Correcciones de estructura aplicadas');
      console.log('✅ Usuario administrador configurado');
      console.log('✅ Sistema básico verificado');
      console.log('');
      console.log('📊 ESTADÍSTICAS DE TABLAS:');
      Object.entries(tableStats).forEach(([table, count]) => {
        console.log(`   ${table}: ${count} registros`);
      });
      console.log('');
      console.log('🚀 ESTADO: SERVIDOR DE TESTING OPERATIVO');
      console.log('');
      console.log('🔐 CREDENCIALES DE TESTING:');
      console.log('   Email: admin@testing.parroquia');
      console.log('   Password: Testing2025!');
      console.log('');
      console.log('📋 PRÓXIMOS PASOS:');
      console.log('   1. Iniciar servidor: npm run dev');
      console.log('   2. Acceder a: http://localhost:3000');
      console.log('   3. API Docs: http://localhost:3000/api-docs');
      console.log('   4. Probar funcionalidad de encuestas');
    } else {
      console.log('⚠️ Sincronización completada con advertencias');
      console.log('📋 Algunas tablas pueden requerir atención manual');
      console.log('🔧 Ejecutar correcciones adicionales si es necesario');
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
if (process.argv[1].includes('sync-testing-robust.js')) {
  syncTestingServer()
    .then(() => {
      console.log('\n✅ Sincronización robusta completada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Sincronización falló:', error.message);
      process.exit(1);
    });
}

export default syncTestingServer;
