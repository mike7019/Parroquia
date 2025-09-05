/**
 * EXPORTADOR Y SINCRONIZADOR DE BASE DE DATOS
 * 
 * Este script puede:
 * 1. Exportar BD local (.env) a archivo SQL
 * 2. Importar archivo SQL a BD remota (.bashrc)
 * 3. Sincronizar directamente de local a remoto
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env para conexión local
dotenv.config();

// Configuración de base de datos LOCAL (.env)
const LOCAL_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

// Configuración de base de datos REMOTA (variables del sistema)
const REMOTE_DB_CONFIG = {
  host: process.env.REMOTE_DB_HOST || '206.62.139.100',
  port: process.env.REMOTE_DB_PORT || 5432,
  database: process.env.REMOTE_DB_NAME || 'parroquia_db',
  username: process.env.REMOTE_DB_USER || 'parroquia_user',
  password: process.env.REMOTE_DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

/**
 * Verificar qué configuraciones están disponibles
 */
function verificarConfiguraciones() {
  console.log('🔍 VERIFICANDO CONFIGURACIONES DISPONIBLES');
  console.log('==========================================\n');
  
  // Verificar configuración local
  console.log('📋 Configuración LOCAL (.env):');
  const localOK = LOCAL_DB_CONFIG.password && LOCAL_DB_CONFIG.host;
  console.log(`   Host: ${LOCAL_DB_CONFIG.host}`);
  console.log(`   Base de datos: ${LOCAL_DB_CONFIG.database}`);
  console.log(`   Usuario: ${LOCAL_DB_CONFIG.username}`);
  console.log(`   Password: ${LOCAL_DB_CONFIG.password ? 'Configurada ✅' : 'No configurada ❌'}`);
  console.log(`   Estado: ${localOK ? 'DISPONIBLE ✅' : 'NO DISPONIBLE ❌'}\n`);
  
  // Verificar configuración remota
  console.log('📋 Configuración REMOTA (sistema):');
  const remoteOK = REMOTE_DB_CONFIG.password && REMOTE_DB_CONFIG.host;
  console.log(`   Host: ${REMOTE_DB_CONFIG.host}`);
  console.log(`   Base de datos: ${REMOTE_DB_CONFIG.database}`);
  console.log(`   Usuario: ${REMOTE_DB_CONFIG.username}`);
  console.log(`   Password: ${REMOTE_DB_CONFIG.password ? 'Configurada ✅' : 'No configurada ❌'}`);
  console.log(`   Estado: ${remoteOK ? 'DISPONIBLE ✅' : 'NO DISPONIBLE ❌'}\n`);
  
  return { localOK, remoteOK };
}

/**
 * Exportar base de datos local a archivo SQL
 */
async function exportarBDLocal() {
  try {
    console.log('📤 EXPORTANDO BASE DE DATOS LOCAL');
    console.log('=================================\n');
    
    const sequelizeLocal = new Sequelize(
      LOCAL_DB_CONFIG.database,
      LOCAL_DB_CONFIG.username,
      LOCAL_DB_CONFIG.password,
      LOCAL_DB_CONFIG
    );
    
    // Verificar conexión
    await sequelizeLocal.authenticate();
    console.log('✅ Conexión a BD local establecida');
    
    // Obtener todas las tablas
    const [tablas] = await sequelizeLocal.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📋 ${tablas.length} tablas encontradas`);
    
    // Generar nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const nombreArchivo = `export_bd_local_${timestamp}.sql`;
    
    let sqlContent = '';
    
    // Header del archivo SQL
    sqlContent += `-- EXPORTACIÓN COMPLETA DE BASE DE DATOS LOCAL\n`;
    sqlContent += `-- Generado: ${new Date().toISOString()}\n`;
    sqlContent += `-- Base de datos: ${LOCAL_DB_CONFIG.database}\n`;
    sqlContent += `-- Host: ${LOCAL_DB_CONFIG.host}\n\n`;
    
    sqlContent += `-- Deshabilitar constraints temporalmente\n`;
    sqlContent += `SET session_replication_role = replica;\n\n`;
    
    // Exportar datos de cada tabla
    for (const tabla of tablas) {
      const tableName = tabla.table_name;
      console.log(`   📊 Exportando tabla: ${tableName}`);
      
      try {
        // Obtener estructura de la tabla
        const [columns] = await sequelizeLocal.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          ORDER BY ordinal_position;
        `);
        
        // Obtener datos de la tabla
        const [rows] = await sequelizeLocal.query(`SELECT * FROM "${tableName}";`);
        
        if (rows.length > 0) {
          sqlContent += `-- Datos para tabla: ${tableName}\n`;
          sqlContent += `DELETE FROM "${tableName}";\n`;
          
          // Generar INSERT statements
          for (const row of rows) {
            const columns = Object.keys(row);
            const values = Object.values(row).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') {
                return `'${val.replace(/'/g, "''")}'`;
              }
              if (val instanceof Date) {
                return `'${val.toISOString()}'`;
              }
              if (typeof val === 'boolean') {
                return val ? 'true' : 'false';
              }
              return val;
            });
            
            sqlContent += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
          }
          
          sqlContent += `\n`;
        } else {
          sqlContent += `-- Tabla ${tableName} está vacía\n\n`;
        }
        
      } catch (error) {
        console.log(`   ⚠️  Error exportando ${tableName}: ${error.message}`);
        sqlContent += `-- Error exportando tabla ${tableName}: ${error.message}\n\n`;
      }
    }
    
    // Rehabilitar constraints
    sqlContent += `-- Rehabilitar constraints\n`;
    sqlContent += `SET session_replication_role = DEFAULT;\n\n`;
    
    // Reiniciar secuencias
    sqlContent += `-- Reiniciar secuencias\n`;
    const [secuencias] = await sequelizeLocal.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);
    
    for (const seq of secuencias) {
      sqlContent += `SELECT setval('${seq.sequence_name}', COALESCE((SELECT MAX(id) FROM ${seq.sequence_name.replace('_seq', '').replace('_id', '')}), 1));\n`;
    }
    
    // Guardar archivo
    await fs.writeFile(nombreArchivo, sqlContent, 'utf8');
    
    const stats = await fs.stat(nombreArchivo);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`\n✅ EXPORTACIÓN COMPLETADA`);
    console.log(`📄 Archivo: ${nombreArchivo}`);
    console.log(`📊 Tamaño: ${sizeMB} MB`);
    console.log(`📋 Tablas exportadas: ${tablas.length}`);
    
    await sequelizeLocal.close();
    
    return nombreArchivo;
    
  } catch (error) {
    console.error('❌ Error exportando BD local:', error.message);
    throw error;
  }
}

/**
 * Importar archivo SQL a base de datos remota
 */
async function importarBDRemota(archivoSQL) {
  try {
    console.log('\n📥 IMPORTANDO A BASE DE DATOS REMOTA');
    console.log('===================================\n');
    
    const sequelizeRemote = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      REMOTE_DB_CONFIG
    );
    
    // Verificar conexión
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión a BD remota establecida');
    
    // Leer archivo SQL
    console.log(`📄 Leyendo archivo: ${archivoSQL}`);
    const sqlContent = await fs.readFile(archivoSQL, 'utf8');
    
    // Dividir en comandos individuales
    const comandos = sqlContent
      .split(';\n')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📋 ${comandos.length} comandos SQL a ejecutar`);
    
    // Ejecutar comandos
    let ejecutados = 0;
    let errores = 0;
    
    for (const comando of comandos) {
      if (comando.trim()) {
        try {
          await sequelizeRemote.query(comando);
          ejecutados++;
          
          if (ejecutados % 100 === 0) {
            console.log(`   ⏳ Ejecutados: ${ejecutados}/${comandos.length}`);
          }
        } catch (error) {
          errores++;
          if (errores <= 5) { // Mostrar solo los primeros 5 errores
            console.log(`   ⚠️  Error en comando: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`\n✅ IMPORTACIÓN COMPLETADA`);
    console.log(`📊 Comandos ejecutados: ${ejecutados}`);
    console.log(`⚠️  Errores: ${errores}`);
    
    await sequelizeRemote.close();
    
    return { ejecutados, errores };
    
  } catch (error) {
    console.error('❌ Error importando a BD remota:', error.message);
    throw error;
  }
}

/**
 * Sincronización completa de local a remoto
 */
async function sincronizarCompleto() {
  try {
    console.log('🔄 SINCRONIZACIÓN COMPLETA LOCAL → REMOTO');
    console.log('=========================================\n');
    
    // 1. Exportar BD local
    const archivoSQL = await exportarBDLocal();
    
    // 2. Importar a BD remota
    const resultado = await importarBDRemota(archivoSQL);
    
    console.log(`\n🎉 SINCRONIZACIÓN COMPLETADA`);
    console.log(`📄 Archivo generado: ${archivoSQL}`);
    console.log(`📊 Comandos ejecutados: ${resultado.ejecutados}`);
    console.log(`⚠️  Errores: ${resultado.errores}`);
    
    return { archivoSQL, resultado };
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    throw error;
  }
}

/**
 * Función principal con menú interactivo
 */
async function main() {
  console.log('🔄 EXPORTADOR Y SINCRONIZADOR DE BASE DE DATOS');
  console.log('==============================================\n');
  
  // Verificar configuraciones
  const { localOK, remoteOK } = verificarConfiguraciones();
  
  if (!localOK && !remoteOK) {
    console.log('❌ Ninguna configuración está disponible');
    console.log('Configure las variables de entorno necesarias');
    return;
  }
  
  console.log('📋 OPCIONES DISPONIBLES:');
  if (localOK) console.log('1. Exportar BD local a archivo SQL');
  if (remoteOK) console.log('2. Importar archivo SQL a BD remota');
  if (localOK && remoteOK) console.log('3. Sincronización completa (local → remoto)');
  console.log('0. Salir\n');
  
  // Si ambas están disponibles, hacer sincronización automática
  if (localOK && remoteOK) {
    console.log('🚀 Ejecutando sincronización automática...\n');
    await sincronizarCompleto();
  } else if (localOK) {
    console.log('📤 Solo BD local disponible, exportando...\n');
    await exportarBDLocal();
  } else {
    console.log('⚠️  Solo BD remota disponible para importación');
    console.log('Proporcione un archivo SQL para importar');
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exportarBDLocal,
  importarBDRemota,
  sincronizarCompleto,
  verificarConfiguraciones
};
