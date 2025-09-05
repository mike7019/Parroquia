/**
 * SISTEMA COMPLETO DE MIGRACIÓN DE BASE DE DATOS
 * 
 * Este script combina exportar e importar para facilitar 
 * migraciones completas entre bases de datos.
 */

import { Sequelize } from 'sequelize';
import { exportarBaseDatos } from './exportar-bd-completa.js';
import { importarBaseDatos } from './importar-bd-desde-sql.js';
import fs from 'fs/promises';

// Configuraciones predefinidas
const CONFIGURACIONES = {
  local: {
    host: 'localhost',
    port: 5432,
    database: 'parroquia_db',
    username: 'parroquia_user',
    password: process.env.DB_PASSWORD
  },
  produccion: {
    host: '206.62.139.100',
    port: 5432,
    database: 'parroquia_db',
    username: 'parroquia_user',
    password: process.env.DB_PASSWORD
  },
  desarrollo: {
    host: 'localhost',
    port: 5432,
    database: 'parroquia_dev',
    username: 'parroquia_user',
    password: process.env.DB_PASSWORD
  },
  test: {
    host: 'localhost',
    port: 5432,
    database: 'parroquia_test',
    username: 'parroquia_user',
    password: process.env.DB_PASSWORD
  }
};

/**
 * Mostrar menú principal
 */
function mostrarMenu() {
  console.log('\n🚀 SISTEMA DE MIGRACIÓN DE BASE DE DATOS');
  console.log('=======================================');
  console.log('1. 📤 Exportar base de datos actual');
  console.log('2. 📥 Importar desde archivo SQL');
  console.log('3. 🔄 Migración completa (exportar + importar)');
  console.log('4. 📋 Listar archivos de export disponibles');
  console.log('5. 🗑️  Limpiar archivos de export antiguos');
  console.log('6. ⚙️  Configurar conexiones');
  console.log('7. 🚪 Salir');
  console.log('\nSeleccione una opción (1-7):');
}

/**
 * Mostrar configuraciones disponibles
 */
function mostrarConfiguraciones() {
  console.log('\n⚙️  CONFIGURACIONES DISPONIBLES:');
  console.log('===============================');
  
  Object.keys(CONFIGURACIONES).forEach((nombre, index) => {
    const config = CONFIGURACIONES[nombre];
    console.log(`${index + 1}. ${nombre.toUpperCase()}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   DB: ${config.database}`);
    console.log(`   User: ${config.username}`);
    console.log('');
  });
  
  console.log('0. Manual (ingresar datos)');
}

/**
 * Leer entrada del usuario
 */
function leerEntrada(pregunta) {
  return new Promise(resolve => {
    console.log(pregunta);
    process.stdin.once('data', data => resolve(data.toString().trim()));
  });
}

/**
 * Seleccionar configuración
 */
async function seleccionarConfiguracion(tipo = 'origen') {
  mostrarConfiguraciones();
  
  const seleccion = await leerEntrada(`\nSeleccione configuración de ${tipo} (0-${Object.keys(CONFIGURACIONES).length}):`);
  const numero = parseInt(seleccion);
  
  if (numero === 0) {
    console.log(`\n📝 Configuración manual para ${tipo}:`);
    const host = await leerEntrada('Host:');
    const port = await leerEntrada('Puerto (5432):') || '5432';
    const database = await leerEntrada('Nombre de base de datos:');
    const username = await leerEntrada('Usuario:');
    const password = await leerEntrada('Contraseña:');
    
    return {
      host,
      port: parseInt(port),
      database,
      username,
      password,
      dialect: 'postgres'
    };
  }
  
  const nombres = Object.keys(CONFIGURACIONES);
  if (numero >= 1 && numero <= nombres.length) {
    const nombre = nombres[numero - 1];
    return { ...CONFIGURACIONES[nombre], dialect: 'postgres' };
  }
  
  console.log('❌ Selección inválida');
  return null;
}

/**
 * Listar archivos de export
 */
async function listarArchivosExport() {
  try {
    console.log('\n📁 ARCHIVOS DE EXPORT DISPONIBLES:');
    console.log('==================================');
    
    const archivos = await fs.readdir('.');
    const archivosSQL = archivos.filter(archivo => 
      archivo.startsWith('export_completo_') && archivo.endsWith('.sql')
    );
    
    if (archivosSQL.length === 0) {
      console.log('❌ No se encontraron archivos de export');
      return;
    }
    
    archivosSQL.sort().reverse();
    
    for (const archivo of archivosSQL) {
      try {
        const stats = await fs.stat(archivo);
        const tamaño = (stats.size / 1024 / 1024).toFixed(2);
        const fecha = stats.mtime.toLocaleString();
        console.log(`📄 ${archivo}`);
        console.log(`   Tamaño: ${tamaño} MB | Fecha: ${fecha}`);
      } catch (error) {
        console.log(`📄 ${archivo} (error leyendo detalles)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error listando archivos:', error.message);
  }
}

/**
 * Limpiar archivos antiguos
 */
async function limpiarArchivosAntiguos() {
  try {
    console.log('\n🗑️  LIMPIEZA DE ARCHIVOS ANTIGUOS:');
    console.log('=================================');
    
    const archivos = await fs.readdir('.');
    const archivosSQL = archivos.filter(archivo => 
      archivo.startsWith('export_completo_') && archivo.endsWith('.sql')
    );
    
    if (archivosSQL.length <= 3) {
      console.log('✅ No hay archivos para limpiar (mantenemos los últimos 3)');
      return;
    }
    
    // Ordenar por fecha y mantener solo los 3 más recientes
    const archivosConFecha = [];
    for (const archivo of archivosSQL) {
      try {
        const stats = await fs.stat(archivo);
        archivosConFecha.push({ nombre: archivo, fecha: stats.mtime });
      } catch (error) {
        console.log(`⚠️  Error leyendo ${archivo}`);
      }
    }
    
    archivosConFecha.sort((a, b) => b.fecha - a.fecha);
    const archivosAEliminar = archivosConFecha.slice(3);
    
    if (archivosAEliminar.length === 0) {
      console.log('✅ No hay archivos para eliminar');
      return;
    }
    
    console.log(`📋 Archivos a eliminar (${archivosAEliminar.length}):`);
    archivosAEliminar.forEach(archivo => {
      console.log(`   ${archivo.nombre}`);
    });
    
    const confirmar = await leerEntrada('\n¿Confirmar eliminación? (si/no):');
    
    if (confirmar.toLowerCase() === 'si' || confirmar.toLowerCase() === 'yes') {
      for (const archivo of archivosAEliminar) {
        try {
          await fs.unlink(archivo.nombre);
          console.log(`✅ Eliminado: ${archivo.nombre}`);
        } catch (error) {
          console.log(`❌ Error eliminando ${archivo.nombre}`);
        }
      }
    } else {
      console.log('❌ Eliminación cancelada');
    }
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
  }
}

/**
 * Migración completa
 */
async function migracionCompleta() {
  console.log('\n🔄 MIGRACIÓN COMPLETA');
  console.log('====================');
  console.log('Este proceso exportará de una base de datos e importará a otra');
  
  // Seleccionar configuración origen
  console.log('\n📤 CONFIGURACIÓN DE ORIGEN:');
  const configOrigen = await seleccionarConfiguracion('origen');
  if (!configOrigen) return;
  
  // Seleccionar configuración destino
  console.log('\n📥 CONFIGURACIÓN DE DESTINO:');
  const configDestino = await seleccionarConfiguracion('destino');
  if (!configDestino) return;
  
  console.log('\n📋 RESUMEN DE MIGRACIÓN:');
  console.log('=======================');
  console.log(`Origen: ${configOrigen.username}@${configOrigen.host}:${configOrigen.port}/${configOrigen.database}`);
  console.log(`Destino: ${configDestino.username}@${configDestino.host}:${configDestino.port}/${configDestino.database}`);
  
  const confirmar = await leerEntrada('\n¿Continuar con la migración? (MIGRAR para confirmar):');
  
  if (confirmar !== 'MIGRAR') {
    console.log('❌ Migración cancelada');
    return;
  }
  
  try {
    // 1. Exportar desde origen
    console.log('\n📤 PASO 1: Exportando desde origen...');
    
    // Configurar variables de entorno temporalmente
    const envBackup = {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD
    };
    
    process.env.DB_HOST = configOrigen.host;
    process.env.DB_PORT = configOrigen.port.toString();
    process.env.DB_NAME = configOrigen.database;
    process.env.DB_USER = configOrigen.username;
    process.env.DB_PASSWORD = configOrigen.password;
    
    await exportarBaseDatos();
    
    // 2. Importar a destino
    console.log('\n📥 PASO 2: Importando a destino...');
    
    process.env.TARGET_DB_HOST = configDestino.host;
    process.env.TARGET_DB_PORT = configDestino.port.toString();
    process.env.TARGET_DB_NAME = configDestino.database;
    process.env.TARGET_DB_USER = configDestino.username;
    process.env.TARGET_DB_PASSWORD = configDestino.password;
    
    await importarBaseDatos();
    
    // Restaurar variables de entorno
    Object.keys(envBackup).forEach(key => {
      if (envBackup[key] !== undefined) {
        process.env[key] = envBackup[key];
      } else {
        delete process.env[key];
      }
    });
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando Sistema de Migración...');
  
  while (true) {
    mostrarMenu();
    
    const opcion = await leerEntrada('');
    
    switch (opcion) {
      case '1':
        await exportarBaseDatos();
        break;
        
      case '2':
        await importarBaseDatos();
        break;
        
      case '3':
        await migracionCompleta();
        break;
        
      case '4':
        await listarArchivosExport();
        break;
        
      case '5':
        await limpiarArchivosAntiguos();
        break;
        
      case '6':
        console.log('\n⚙️  Configuraciones actuales guardadas en el script');
        console.log('💡 Edite el archivo para agregar nuevas configuraciones');
        break;
        
      case '7':
        console.log('👋 ¡Hasta luego!');
        process.exit(0);
        break;
        
      default:
        console.log('❌ Opción inválida. Seleccione 1-7');
    }
    
    await leerEntrada('\nPresione Enter para continuar...');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
