/**
 * IMPORTADOR DE BASE DE DATOS DESDE ARCHIVO SQL
 * 
 * Este script importa un archivo .sql generado por exportar-bd-completa.js
 * a una nueva base de datos, con verificación y manejo de errores.
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Configuración de base de datos destino
const DB_CONFIG = {
  host: process.env.TARGET_DB_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.TARGET_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.TARGET_DB_NAME || process.env.DB_NAME || 'parroquia_db_nueva',
  username: process.env.TARGET_DB_USER || process.env.DB_USER || 'parroquia_user',
  password: process.env.TARGET_DB_PASSWORD || process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

/**
 * Verificar si la base de datos existe y está vacía
 */
async function verificarBaseDatos() {
  try {
    console.log('🔍 Verificando base de datos destino...');
    
    const sequelize = new Sequelize(
      DB_CONFIG.database,
      DB_CONFIG.username,
      DB_CONFIG.password,
      DB_CONFIG
    );
    
    await sequelize.authenticate();
    console.log(`✅ Conectado a: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
    // Verificar si hay tablas
    const [tablas] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const totalTablas = parseInt(tablas[0].total);
    
    if (totalTablas > 0) {
      console.log(`⚠️  La base de datos contiene ${totalTablas} tablas`);
      console.log('¿Desea continuar? Esto puede sobrescribir datos existentes.');
      return { sequelize, tablas: totalTablas };
    } else {
      console.log('✅ Base de datos vacía - lista para importar');
      return { sequelize, tablas: 0 };
    }
    
  } catch (error) {
    if (error.original && error.original.code === '3D000') {
      console.log('❌ La base de datos no existe');
      console.log('📋 Comandos para crear la base de datos:');
      console.log(`createdb -h ${DB_CONFIG.host} -U ${DB_CONFIG.username} ${DB_CONFIG.database}`);
      console.log('O desde psql:');
      console.log(`CREATE DATABASE "${DB_CONFIG.database}";`);
    } else {
      console.log(`❌ Error conectando: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Buscar archivos SQL de export
 */
async function buscarArchivoSQL() {
  try {
    console.log('\n📁 Buscando archivos de export...');
    
    const archivos = await fs.readdir('.');
    const archivosSQL = archivos.filter(archivo => 
      archivo.startsWith('export_completo_') && archivo.endsWith('.sql')
    );
    
    if (archivosSQL.length === 0) {
      console.log('❌ No se encontraron archivos de export');
      console.log('💡 Ejecute primero: node exportar-bd-completa.js');
      return null;
    }
    
    // Ordenar por fecha (más reciente primero)
    archivosSQL.sort().reverse();
    
    console.log(`📊 ${archivosSQL.length} archivo(s) de export encontrado(s):`);
    archivosSQL.forEach((archivo, index) => {
      console.log(`${index + 1}. ${archivo}`);
    });
    
    // Seleccionar el más reciente por defecto
    const archivoSeleccionado = archivosSQL[0];
    console.log(`✅ Usando archivo más reciente: ${archivoSeleccionado}`);
    
    return archivoSeleccionado;
    
  } catch (error) {
    console.error('❌ Error buscando archivos:', error.message);
    return null;
  }
}

/**
 * Leer y procesar archivo SQL
 */
async function procesarArchivoSQL(nombreArchivo) {
  try {
    console.log(`\n📖 Leyendo archivo: ${nombreArchivo}`);
    
    const contenidoSQL = await fs.readFile(nombreArchivo, 'utf8');
    const stats = await fs.stat(nombreArchivo);
    const tamaño = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`📊 Tamaño del archivo: ${tamaño} MB`);
    
    // Dividir en statements individuales
    const statements = contenidoSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 ${statements.length} statements SQL encontrados`);
    
    return statements;
    
  } catch (error) {
    console.error(`❌ Error leyendo archivo ${nombreArchivo}:`, error.message);
    throw error;
  }
}

/**
 * Ejecutar statements SQL con manejo de errores
 */
async function ejecutarStatements(sequelize, statements) {
  console.log('\n⚡ Ejecutando statements SQL...');
  
  let ejecutados = 0;
  let errores = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Mostrar progreso cada 100 statements
    if (i % 100 === 0) {
      const progreso = ((i / statements.length) * 100).toFixed(1);
      console.log(`📊 Progreso: ${progreso}% (${i}/${statements.length})`);
    }
    
    try {
      await sequelize.query(statement + ';');
      ejecutados++;
    } catch (error) {
      errores++;
      
      // Solo mostrar errores significativos (no advertencias)
      if (!error.message.includes('already exists') && 
          !error.message.includes('does not exist') &&
          errores <= 10) {
        console.log(`⚠️  Error en statement ${i + 1}: ${error.message.substring(0, 100)}...`);
      }
      
      // Si hay demasiados errores, parar
      if (errores > 50) {
        console.log('❌ Demasiados errores - deteniendo ejecución');
        break;
      }
    }
  }
  
  console.log(`\n📊 Resultado de la importación:`);
  console.log(`✅ Statements ejecutados: ${ejecutados}`);
  console.log(`⚠️  Statements con errores: ${errores}`);
  
  return { ejecutados, errores };
}

/**
 * Verificar importación
 */
async function verificarImportacion(sequelize) {
  try {
    console.log('\n🔍 Verificando importación...');
    
    // Contar tablas
    const [tablas] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    console.log(`📋 Tablas creadas: ${tablas[0].total}`);
    
    // Verificar algunas tablas importantes
    const tablasImportantes = [
      'departamentos_municipios',
      'municipios_municipios',
      'familias_familias',
      'personas_personas',
      'usuarios'
    ];
    
    for (const tabla of tablasImportantes) {
      try {
        const [datos] = await sequelize.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
        console.log(`📊 ${tabla}: ${datos[0].total} registros`);
      } catch (error) {
        console.log(`⚠️  ${tabla}: no existe o error`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando importación:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function importarBaseDatos() {
  console.log('📥 IMPORTADOR DE BASE DE DATOS DESDE SQL');
  console.log('=======================================\n');
  
  try {
    // 1. Verificar base de datos destino
    const { sequelize } = await verificarBaseDatos();
    
    // 2. Buscar archivo SQL
    const archivoSQL = await buscarArchivoSQL();
    if (!archivoSQL) {
      throw new Error('No se encontró archivo SQL para importar');
    }
    
    // 3. Confirmar operación
    console.log('\n⚠️  CONFIRMACIÓN');
    console.log('================');
    console.log(`Archivo a importar: ${archivoSQL}`);
    console.log(`Base de datos destino: ${DB_CONFIG.database}`);
    console.log(`Servidor: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log('\n¿Desea continuar? (escriba "IMPORTAR" para confirmar)');
    
    const respuesta = await new Promise(resolve => {
      process.stdin.once('data', data => resolve(data.toString().trim()));
    });
    
    if (respuesta !== 'IMPORTAR') {
      console.log('❌ Importación cancelada por el usuario');
      return;
    }
    
    // 4. Procesar archivo SQL
    const statements = await procesarArchivoSQL(archivoSQL);
    
    // 5. Ejecutar statements
    const resultado = await ejecutarStatements(sequelize, statements);
    
    // 6. Verificar resultado
    const verificacionOK = await verificarImportacion(sequelize);
    
    // 7. Resultado final
    console.log('\n🎉 IMPORTACIÓN COMPLETADA');
    console.log('=========================');
    
    if (verificacionOK && resultado.errores < 10) {
      console.log('✅ Base de datos importada exitosamente');
      console.log('✅ Verificación completada');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Verificar que la aplicación conecte correctamente');
      console.log('2. Probar funcionalidades principales');
      console.log('3. Validar integridad de datos');
    } else {
      console.log('⚠️  Importación completada con advertencias');
      console.log('🔍 Revise los errores reportados');
      console.log('💡 Algunos errores son normales (constraints duplicados, etc.)');
    }
    
    await sequelize.close();
    
  } catch (error) {
    console.error('\n❌ ERROR EN IMPORTACIÓN:', error.message);
    console.error('🔄 Revise la configuración y reintentar');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  importarBaseDatos();
}

export { importarBaseDatos };
