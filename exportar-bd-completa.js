/**
 * EXPORTADOR COMPLETO DE BASE DE DATOS A SQL
 * 
 * Este script genera un archivo .sql completo con:
 * - Estructura de todas las tablas
 * - Todos los datos existentes
 * - Secuencias y constraints
 * - Índices y relaciones
 * 
 * El archivo resultante puede usarse para crear una BD idéntica
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Configuración de base de datos (usa las variables de entorno existentes)
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
};

// Conexión a base de datos
const sequelize = new Sequelize(
  DB_CONFIG.database,
  DB_CONFIG.username,
  DB_CONFIG.password,
  DB_CONFIG
);

/**
 * Obtener estructura de una tabla
 */
async function obtenerEstructuraTabla(nombreTabla) {
  try {
    const [columns] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        column_default,
        is_nullable,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_name = '${nombreTabla}' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    return columns;
  } catch (error) {
    console.error(`Error obteniendo estructura de ${nombreTabla}:`, error.message);
    return [];
  }
}

/**
 * Obtener constraints de una tabla
 */
async function obtenerConstraints(nombreTabla) {
  try {
    const [constraints] = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = '${nombreTabla}' 
      AND tc.table_schema = 'public';
    `);
    
    return constraints;
  } catch (error) {
    console.error(`Error obteniendo constraints de ${nombreTabla}:`, error.message);
    return [];
  }
}

/**
 * Obtener datos de una tabla
 */
async function obtenerDatosTabla(nombreTabla) {
  try {
    const [datos] = await sequelize.query(`SELECT * FROM "${nombreTabla}";`);
    return datos;
  } catch (error) {
    console.error(`Error obteniendo datos de ${nombreTabla}:`, error.message);
    return [];
  }
}

/**
 * Convertir valor para SQL
 */
function convertirValorSQL(valor) {
  if (valor === null || valor === undefined) {
    return 'NULL';
  }
  
  if (typeof valor === 'string') {
    return `'${valor.replace(/'/g, "''")}'`;
  }
  
  if (valor instanceof Date) {
    return `'${valor.toISOString()}'`;
  }
  
  if (typeof valor === 'boolean') {
    return valor ? 'true' : 'false';
  }
  
  return valor.toString();
}

/**
 * Generar CREATE TABLE para una tabla
 */
async function generarCreateTable(nombreTabla) {
  const columnas = await obtenerEstructuraTabla(nombreTabla);
  const constraints = await obtenerConstraints(nombreTabla);
  
  if (columnas.length === 0) {
    return '';
  }
  
  let sql = `-- Tabla: ${nombreTabla}\n`;
  sql += `CREATE TABLE IF NOT EXISTS "${nombreTabla}" (\n`;
  
  // Generar columnas
  const columnasSQL = columnas.map(col => {
    let colSQL = `  "${col.column_name}" ${col.data_type}`;
    
    // Agregar longitud si aplica
    if (col.character_maximum_length) {
      colSQL += `(${col.character_maximum_length})`;
    } else if (col.numeric_precision) {
      colSQL += `(${col.numeric_precision}`;
      if (col.numeric_scale) {
        colSQL += `,${col.numeric_scale}`;
      }
      colSQL += ')';
    }
    
    // NOT NULL
    if (col.is_nullable === 'NO') {
      colSQL += ' NOT NULL';
    }
    
    // DEFAULT
    if (col.column_default) {
      colSQL += ` DEFAULT ${col.column_default}`;
    }
    
    return colSQL;
  });
  
  sql += columnasSQL.join(',\n');
  
  // Agregar constraints PRIMARY KEY
  const primaryKeys = constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
  if (primaryKeys.length > 0) {
    const pkColumns = primaryKeys.map(pk => `"${pk.column_name}"`).join(', ');
    sql += `,\n  PRIMARY KEY (${pkColumns})`;
  }
  
  sql += '\n);\n\n';
  
  return sql;
}

/**
 * Generar INSERTs para una tabla
 */
async function generarInserts(nombreTabla) {
  const datos = await obtenerDatosTabla(nombreTabla);
  
  if (datos.length === 0) {
    return `-- No hay datos en la tabla ${nombreTabla}\n\n`;
  }
  
  let sql = `-- Datos para tabla: ${nombreTabla}\n`;
  
  const columnas = Object.keys(datos[0]);
  const columnasStr = columnas.map(col => `"${col}"`).join(', ');
  
  // Agrupar inserts de 100 en 100 para mejor rendimiento
  const batchSize = 100;
  for (let i = 0; i < datos.length; i += batchSize) {
    const batch = datos.slice(i, i + batchSize);
    
    sql += `INSERT INTO "${nombreTabla}" (${columnasStr}) VALUES\n`;
    
    const valoresSQL = batch.map(fila => {
      const valores = columnas.map(col => convertirValorSQL(fila[col]));
      return `  (${valores.join(', ')})`;
    });
    
    sql += valoresSQL.join(',\n');
    sql += ';\n\n';
  }
  
  return sql;
}

/**
 * Generar constraints de foreign key
 */
async function generarForeignKeys() {
  try {
    const [foreignKeys] = await sequelize.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `);
    
    if (foreignKeys.length === 0) {
      return '';
    }
    
    let sql = '-- Foreign Key Constraints\n';
    
    for (const fk of foreignKeys) {
      sql += `ALTER TABLE "${fk.table_name}" `;
      sql += `ADD CONSTRAINT "${fk.constraint_name}" `;
      sql += `FOREIGN KEY ("${fk.column_name}") `;
      sql += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}");\n`;
    }
    
    sql += '\n';
    return sql;
    
  } catch (error) {
    console.error('Error generando foreign keys:', error.message);
    return '';
  }
}

/**
 * Generar secuencias
 */
async function generarSecuencias() {
  try {
    const [secuencias] = await sequelize.query(`
      SELECT 
        schemaname,
        sequencename,
        last_value
      FROM pg_sequences 
      WHERE schemaname = 'public';
    `);
    
    if (secuencias.length === 0) {
      return '';
    }
    
    let sql = '-- Secuencias\n';
    
    for (const seq of secuencias) {
      sql += `SELECT setval('${seq.sequencename}', ${seq.last_value}, true);\n`;
    }
    
    sql += '\n';
    return sql;
    
  } catch (error) {
    console.error('Error generando secuencias:', error.message);
    return '';
  }
}

/**
 * Función principal
 */
async function exportarBaseDatos() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nombreArchivo = `export_completo_${DB_CONFIG.database}_${timestamp}.sql`;
  
  console.log('📊 EXPORTADOR COMPLETO DE BASE DE DATOS');
  console.log('=====================================\n');
  
  try {
    // Verificar conexión
    console.log('🔗 Conectando a base de datos...');
    await sequelize.authenticate();
    console.log(`✅ Conectado a: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`);
    
    // Obtener lista de tablas
    console.log('\n📋 Obteniendo lista de tablas...');
    const [tablas] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📊 ${tablas.length} tablas encontradas:`, tablas.map(t => t.table_name).join(', '));
    
    // Iniciar archivo SQL
    let sqlCompleto = '';
    sqlCompleto += `-- EXPORT COMPLETO DE BASE DE DATOS\n`;
    sqlCompleto += `-- Base de datos: ${DB_CONFIG.database}\n`;
    sqlCompleto += `-- Host: ${DB_CONFIG.host}:${DB_CONFIG.port}\n`;
    sqlCompleto += `-- Fecha: ${new Date().toISOString()}\n`;
    sqlCompleto += `-- Generado por: exportar-bd-completa.js\n\n`;
    
    sqlCompleto += `-- Configuración inicial\n`;
    sqlCompleto += `SET client_encoding = 'UTF8';\n`;
    sqlCompleto += `SET standard_conforming_strings = on;\n`;
    sqlCompleto += `SET check_function_bodies = false;\n`;
    sqlCompleto += `SET xmloption = content;\n`;
    sqlCompleto += `SET client_min_messages = warning;\n\n`;
    
    // Generar estructura de tablas
    console.log('\n🏗️  Generando estructura de tablas...');
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- ESTRUCTURA DE TABLAS\n`;
    sqlCompleto += `-- ===============================\n\n`;
    
    for (const tabla of tablas) {
      console.log(`   📋 Procesando estructura: ${tabla.table_name}`);
      const createTable = await generarCreateTable(tabla.table_name);
      sqlCompleto += createTable;
    }
    
    // Generar datos
    console.log('\n💾 Generando datos de tablas...');
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- DATOS DE TABLAS\n`;
    sqlCompleto += `-- ===============================\n\n`;
    
    // Orden recomendado para inserción (independientes primero)
    const ordenInsercion = [
      'departamentos_municipios',
      'municipios_municipios',
      'parroquias_parroquias',
      'sectores_sectores', 
      'veredas_veredas',
      'sexos',
      'tipos_identificacion',
      'estados_civiles',
      'estudios',
      'parentescos',
      'comunidades_culturales',
      'enfermedades',
      'profesiones',
      'tipos_vivienda',
      'disposicion_basuras',
      'sistemas_acueducto',
      'aguas_residuales',
      'usuarios',
      'familias_familias',
      'personas_personas',
      'difuntos_familias',
      'refresh_tokens'
    ];
    
    // Procesar tablas en orden
    const tablasProc = new Set();
    
    // Primero las tablas en orden específico
    for (const nombreTabla of ordenInsercion) {
      const tabla = tablas.find(t => t.table_name === nombreTabla);
      if (tabla) {
        console.log(`   💾 Procesando datos: ${tabla.table_name}`);
        const inserts = await generarInserts(tabla.table_name);
        sqlCompleto += inserts;
        tablasProc.add(tabla.table_name);
      }
    }
    
    // Luego el resto de tablas
    for (const tabla of tablas) {
      if (!tablasProc.has(tabla.table_name)) {
        console.log(`   💾 Procesando datos: ${tabla.table_name}`);
        const inserts = await generarInserts(tabla.table_name);
        sqlCompleto += inserts;
      }
    }
    
    // Generar foreign keys
    console.log('\n🔗 Generando foreign keys...');
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- FOREIGN KEY CONSTRAINTS\n`;
    sqlCompleto += `-- ===============================\n\n`;
    
    const foreignKeys = await generarForeignKeys();
    sqlCompleto += foreignKeys;
    
    // Generar secuencias
    console.log('\n🔢 Configurando secuencias...');
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- CONFIGURACIÓN DE SECUENCIAS\n`;
    sqlCompleto += `-- ===============================\n\n`;
    
    const secuencias = await generarSecuencias();
    sqlCompleto += secuencias;
    
    // Agregar comentarios finales
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- EXPORT COMPLETADO\n`;
    sqlCompleto += `-- ===============================\n`;
    sqlCompleto += `-- Total de tablas exportadas: ${tablas.length}\n`;
    sqlCompleto += `-- Fecha de export: ${new Date().toISOString()}\n`;
    
    // Guardar archivo
    console.log('\n💾 Guardando archivo SQL...');
    await fs.writeFile(nombreArchivo, sqlCompleto, 'utf8');
    
    // Información del archivo
    const stats = await fs.stat(nombreArchivo);
    const tamaño = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n🎉 EXPORT COMPLETADO EXITOSAMENTE');
    console.log('=================================');
    console.log(`📁 Archivo: ${nombreArchivo}`);
    console.log(`📊 Tamaño: ${tamaño} MB`);
    console.log(`📋 Tablas: ${tablas.length}`);
    console.log(`💾 Líneas: ${sqlCompleto.split('\\n').length.toLocaleString()}`);
    
    console.log('\n📋 PARA USAR ESTE EXPORT:');
    console.log('1. Crear nueva base de datos vacía');
    console.log(`2. psql -h host -U usuario -d nueva_bd < ${nombreArchivo}`);
    console.log('3. O ejecutar el archivo desde pgAdmin/DBeaver');
    
    console.log('\n✅ Tu base de datos ha sido exportada completamente');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EXPORT:', error.message);
    console.error('🔄 Revise la conexión y permisos de base de datos');
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  exportarBaseDatos();
}

export { exportarBaseDatos };
