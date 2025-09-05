/**
 * VERIFICACIÓN PREVIA PARA CLEANUP COMPLETO
 * 
 * Este script verifica que todo esté listo para hacer
 * la limpieza y sincronización completa
 */

import { Sequelize } from 'sequelize';

// Configuración de base de datos remota
const REMOTE_DB_CONFIG = {
  host: process.env.DB_HOST || process.env.REMOTE_DB_HOST || '206.62.139.100',
  port: process.env.DB_PORT || process.env.REMOTE_DB_PORT || 5432,
  database: process.env.DB_NAME || process.env.REMOTE_DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || process.env.REMOTE_DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || process.env.REMOTE_DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

async function verificarTodoParaCleanup() {
  console.log('🔍 VERIFICACIÓN PREVIA PARA CLEANUP COMPLETO');
  console.log('============================================\n');
  
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
  
  // 2. Verificar conexión y permisos
  console.log('\n2. 🔗 Verificando conexión y permisos...');
  try {
    const sequelize = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      REMOTE_DB_CONFIG
    );
    
    await sequelize.authenticate();
    console.log('   ✅ Conexión exitosa');
    
    // Verificar permisos de TRUNCATE/DELETE
    try {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        LIMIT 5;
      `);
      
      console.log(`   ✅ Acceso a tablas confirmado (${results.length} tablas detectadas)`);
      
      // Verificar permisos específicos
      try {
        await sequelize.query("SELECT has_table_privilege(current_user, 'information_schema.tables', 'DELETE');");
        console.log('   ✅ Permisos de eliminación verificados');
      } catch (error) {
        console.log('   ⚠️  Permisos de eliminación: verificar manualmente');
      }
      
    } catch (error) {
      console.log(`   ❌ Error verificando permisos: ${error.message}`);
      todoBien = false;
    }
    
    await sequelize.close();
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    todoBien = false;
  }
  
  // 3. Verificar estructura local
  console.log('\n3. 📁 Verificando archivos locales...');
  
  const archivosNecesarios = [
    './src/models/index.js',
    './src/seeders/geografiaOptimizada.js',
    './src/seeders/ejecutarGeografiaOptimizada.js',
    './cleanup-sincronizar-produccion.js'
  ];
  
  for (const archivo of archivosNecesarios) {
    try {
      const fs = await import('fs/promises');
      await fs.access(archivo);
      console.log(`   ✅ ${archivo} encontrado`);
    } catch (error) {
      console.log(`   ❌ ${archivo} no encontrado`);
      todoBien = false;
    }
  }
  
  // 4. Verificar dependencias
  console.log('\n4. 📦 Verificando dependencias...');
  
  const dependencias = ['sequelize', 'bcrypt', 'pg'];
  
  for (const dep of dependencias) {
    try {
      await import(dep);
      console.log(`   ✅ ${dep} disponible`);
    } catch (error) {
      console.log(`   ❌ ${dep} no disponible: ${error.message}`);
      if (dep === 'bcrypt' || dep === 'pg') {
        todoBien = false;
      }
    }
  }
  
  // 5. Verificar API externa
  console.log('\n5. 🌐 Verificando API externa...');
  try {
    const response = await fetch('https://api-colombia.com/api/v1/City');
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ API Colombia disponible (${data.length} municipios)`);
    } else {
      console.log(`   ⚠️  API Colombia respondió con status: ${response.status}`);
      console.log('   ℹ️  Se usarán datos de fallback');
    }
  } catch (error) {
    console.log(`   ⚠️  Error conectando a API: ${error.message}`);
    console.log('   ℹ️  Se usarán datos de fallback');
  }
  
  // 6. Mostrar resumen de tablas que se van a limpiar
  console.log('\n6. 📋 Analizando estructura actual...');
  try {
    const sequelize = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      REMOTE_DB_CONFIG
    );
    
    const [results] = await sequelize.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('   📊 Tablas que serán limpiadas:');
    for (const tabla of results) {
      console.log(`      • ${tabla.table_name} (${tabla.columnas} columnas)`);
    }
    
    await sequelize.close();
  } catch (error) {
    console.log(`   ⚠️  No se pudo analizar estructura: ${error.message}`);
  }
  
  // Resultado final
  console.log('\n🏁 RESULTADO DE VERIFICACIÓN PARA CLEANUP');
  console.log('=========================================');
  
  if (todoBien) {
    console.log('✅ LISTO PARA CLEANUP COMPLETO');
    console.log('\n⚠️  ADVERTENCIAS IMPORTANTES:');
    console.log('• Esta operación eliminará TODOS los datos de producción');
    console.log('• Se requiere backup manual antes de proceder');
    console.log('• El proceso puede tomar varios minutos');
    console.log('• Se requerirá confirmación manual durante el proceso');
    console.log('\n📋 COMANDOS SIGUIENTES:');
    console.log('1. Hacer backup de la base de datos');
    console.log('2. node cleanup-sincronizar-produccion.js');
    console.log('3. Seguir las instrucciones en pantalla');
  } else {
    console.log('❌ HAY PROBLEMAS QUE RESOLVER');
    console.log('\n🔧 ACCIONES REQUERIDAS:');
    console.log('1. Configure las variables de entorno faltantes');
    console.log('2. Verifique la conectividad a la base de datos');
    console.log('3. Instale las dependencias faltantes');
    console.log('4. Ejecute este script nuevamente');
  }
  
  console.log('\n💡 NOTA: El cleanup mantendrá la estructura de tablas');
  console.log('pero eliminará todos los datos y los reemplazará con');
  console.log('datos frescos sincronizados desde su entorno local.');
}

verificarTodoParaCleanup().catch(console.error);
