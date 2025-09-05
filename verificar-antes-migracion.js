/**
 * VERIFICACIÓN PREVIA A MIGRACIÓN
 * 
 * Este script verifica que todo esté listo para ejecutar
 * la migración a la base de datos de producción
 * 
 * NOTA: Las variables de entorno deben estar configuradas en .bashrc
 */

import { Sequelize } from 'sequelize';

// Configuración de base de datos remota usando variables del sistema
const REMOTE_DB_CONFIG = {
  host: process.env.REMOTE_DB_HOST || process.env.DB_HOST || '206.62.139.100',
  port: process.env.REMOTE_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.REMOTE_DB_NAME || process.env.DB_NAME || 'parroquia_db',
  username: process.env.REMOTE_DB_USER || process.env.DB_USER || 'parroquia_user',
  password: process.env.REMOTE_DB_PASSWORD || process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

async function verificarTodo() {
  console.log('🔍 VERIFICACIÓN PREVIA A MIGRACIÓN');
  console.log('==================================\n');
  
  let todoBien = true;
  
  // 1. Verificar variables de entorno
  console.log('1. 📋 Verificando configuración...');
  
  const variablesRequeridas = [
    { name: 'DB_PASSWORD o REMOTE_DB_PASSWORD', value: process.env.DB_PASSWORD || process.env.REMOTE_DB_PASSWORD },
    { name: 'DB_HOST o REMOTE_DB_HOST', value: process.env.DB_HOST || process.env.REMOTE_DB_HOST || '206.62.139.100' },
    { name: 'DB_USER o REMOTE_DB_USER', value: process.env.DB_USER || process.env.REMOTE_DB_USER || 'parroquia_user' }
  ];
  
  for (const variable of variablesRequeridas) {
    if (!variable.value || variable.value === 'undefined') {
      console.log(`   ❌ ${variable.name} no configurada`);
      todoBien = false;
    } else {
      console.log(`   ✅ ${variable.name} configurada`);
    }
  }
  
  if (todoBien) {
    console.log(`   ℹ️  Conectando a: ${REMOTE_DB_CONFIG.host}:${REMOTE_DB_CONFIG.port}/${REMOTE_DB_CONFIG.database}`);
  }
  
  // 2. Verificar conexión a base de datos remota
  console.log('\n2. 🔗 Verificando conexión a base de datos remota...');
  try {
    const sequelize = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      REMOTE_DB_CONFIG
    );
    
    await sequelize.authenticate();
    console.log(`   ✅ Conexión exitosa a ${REMOTE_DB_CONFIG.host}:${REMOTE_DB_CONFIG.port}`);
    
    // Verificar algunas tablas clave
    const tablas = ['departamentos_municipios', 'municipios_municipios', 'familias_familias'];
    for (const tabla of tablas) {
      try {
        await sequelize.query(`SELECT COUNT(*) FROM ${tabla};`);
        console.log(`   ✅ Tabla ${tabla} accesible`);
      } catch (error) {
        console.log(`   ⚠️  Tabla ${tabla}: ${error.message}`);
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    todoBien = false;
  }
  
  // 3. Verificar API externa
  console.log('\n3. 🌐 Verificando API externa de Colombia...');
  try {
    const response = await fetch('https://api-colombia.com/api/v1/City');
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ API Colombia disponible (${data.length} municipios)`);
    } else {
      console.log(`   ⚠️  API Colombia respondió con status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error conectando a API: ${error.message}`);
    console.log('   ℹ️  Se usarán datos de fallback si es necesario');
  }
  
  // 4. Verificar archivos locales
  console.log('\n4. 📁 Verificando archivos necesarios...');
  try {
    const fs = await import('fs/promises');
    await fs.access('./migrar-cambios-produccion.js');
    console.log('   ✅ Script de migración disponible');
  } catch (error) {
    console.log('   ❌ Script de migración no encontrado');
    todoBien = false;
  }
  
  // Resultado final
  console.log('\n🏁 RESULTADO DE VERIFICACIÓN');
  console.log('============================');
  
  if (todoBien) {
    console.log('✅ Todo listo para migración');
    console.log('\n📋 PASOS SIGUIENTES:');
    console.log('1. Asegúrese de tener un backup de la base de datos de producción');
    console.log('2. Ejecute: node migrar-cambios-produccion.js');
    console.log('3. Siga las instrucciones en pantalla');
    console.log('\n⚠️  IMPORTANTE: La migración eliminará datos geográficos existentes');
  } else {
    console.log('❌ Hay problemas que deben resolverse antes de la migración');
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    console.log('1. Configure las variables de entorno necesarias');
    console.log('2. Verifique la conectividad a la base de datos remota');
    console.log('3. Ejecute este script nuevamente');
  }
}

verificarTodo().catch(console.error);
