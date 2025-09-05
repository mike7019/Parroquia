/**
 * SINCRONIZACIÓN COMPLETA PARA BASE DE DATOS VACÍA
 * 
 * Este script está optimizado para sincronizar una base de datos local
 * a una base de datos remota completamente vacía (sin tablas).
 * 
 * VENTAJAS CON BD VACÍA:
 * - No conflictos de estructura
 * - No problemas de FK
 * - Sincronización limpia y completa
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Configuraciones de bases de datos
const LOCAL_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  dialect: 'postgres',
  logging: false
};

const REMOTE_DB_CONFIG = {
  host: '206.62.139.100',
  port: 5432,
  database: 'parroquia_db',
  username: 'parroquia_user',
  password: 'ParroquiaSecure2025',
  dialect: 'postgres',
  logging: false
};

// Conexiones
const sequelizeLocal = new Sequelize(
  LOCAL_DB_CONFIG.database,
  LOCAL_DB_CONFIG.username,
  LOCAL_DB_CONFIG.password,
  LOCAL_DB_CONFIG
);

const sequelizeRemote = new Sequelize(
  REMOTE_DB_CONFIG.database,
  REMOTE_DB_CONFIG.username,
  REMOTE_DB_CONFIG.password,
  REMOTE_DB_CONFIG
);

/**
 * Verificar si la base de datos remota está vacía
 */
async function verificarBDVacia() {
  try {
    console.log('🔍 Verificando si la base de datos remota está vacía...');
    
    const [results] = await sequelizeRemote.query(`
      SELECT COUNT(*) as total_tablas
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const totalTablas = parseInt(results[0].total_tablas);
    
    if (totalTablas === 0) {
      console.log('✅ Base de datos remota está completamente vacía - IDEAL para sincronización');
      return true;
    } else {
      console.log(`⚠️  Base de datos remota tiene ${totalTablas} tablas existentes`);
      console.log('ℹ️  Se procederá con sincronización, pero puede haber conflictos');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando BD remota:', error.message);
    return false;
  }
}

/**
 * Generar script SQL completo desde la base de datos local
 */
async function generarScriptSQL() {
  try {
    console.log('\n📝 Generando script SQL completo desde base de datos local...');
    
    // Obtener todas las tablas de la base local
    const [tablas] = await sequelizeLocal.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📋 ${tablas.length} tablas encontradas en local`);
    
    let sqlScript = '';
    
    // Agregar header
    sqlScript += `-- SCRIPT DE SINCRONIZACIÓN COMPLETA\n`;
    sqlScript += `-- Generado: ${new Date().toISOString()}\n`;
    sqlScript += `-- Base de datos: ${LOCAL_DB_CONFIG.database}\n`;
    sqlScript += `-- Total de tablas: ${tablas.length}\n\n`;
    
    // Deshabilitar constraints durante la importación
    sqlScript += `-- Deshabilitar constraints temporalmente\n`;
    sqlScript += `SET session_replication_role = replica;\n\n`;
    
    // 1. CREAR ESTRUCTURA DE TABLAS
    console.log('🏗️  Generando estructura de tablas...');
    
    for (const tabla of tablas) {
      const nombreTabla = tabla.table_name;
      
      try {
        // Obtener DDL de la tabla
        const [createTable] = await sequelizeLocal.query(`
          SELECT 
            'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
            string_agg(
              column_name || ' ' || 
              CASE 
                WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
                WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
                WHEN data_type = 'integer' THEN 'INTEGER'
                WHEN data_type = 'bigint' THEN 'BIGINT'
                WHEN data_type = 'boolean' THEN 'BOOLEAN'
                WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
                WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                WHEN data_type = 'date' THEN 'DATE'
                WHEN data_type = 'text' THEN 'TEXT'
                WHEN data_type = 'json' THEN 'JSON'
                WHEN data_type = 'jsonb' THEN 'JSONB'
                ELSE UPPER(data_type)
              END ||
              CASE 
                WHEN is_nullable = 'NO' THEN ' NOT NULL'
                ELSE ''
              END ||
              CASE 
                WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
                ELSE ''
              END,
              ', '
            ) || ');' as create_statement
          FROM information_schema.columns 
          WHERE table_name = '${nombreTabla}'
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `);
        
        if (createTable[0] && createTable[0].create_statement) {
          sqlScript += `-- Tabla: ${nombreTabla}\n`;
          sqlScript += `DROP TABLE IF EXISTS ${nombreTabla} CASCADE;\n`;
          sqlScript += `${createTable[0].create_statement}\n\n`;
        }
        
      } catch (error) {
        console.log(`⚠️  Error generando estructura para ${nombreTabla}: ${error.message}`);
      }
    }
    
    // 2. INSERTAR DATOS
    console.log('📊 Generando inserts de datos...');
    
    // Orden específico para evitar problemas de FK
    const ordenInsercion = [
      'SequelizeMeta',
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
      'difuntos_familias'
    ];
    
    // Agregar tablas que no estén en el orden específico
    const tablasRestantes = tablas
      .map(t => t.table_name)
      .filter(tabla => !ordenInsercion.includes(tabla));
    
    const ordenCompleto = [...ordenInsercion, ...tablasRestantes];
    
    for (const nombreTabla of ordenCompleto) {
      if (tablas.find(t => t.table_name === nombreTabla)) {
        try {
          // Obtener datos de la tabla
          const [datos] = await sequelizeLocal.query(`SELECT * FROM "${nombreTabla}";`);
          
          if (datos.length > 0) {
            sqlScript += `-- Datos para: ${nombreTabla} (${datos.length} registros)\n`;
            
            // Generar INSERT statements
            const columnas = Object.keys(datos[0]);
            const columnasStr = columnas.join(', ');
            
            for (const fila of datos) {
              const valores = columnas.map(col => {
                const valor = fila[col];
                if (valor === null) return 'NULL';
                if (typeof valor === 'string') return `'${valor.replace(/'/g, "''")}'`;
                if (typeof valor === 'boolean') return valor ? 'true' : 'false';
                if (valor instanceof Date) return `'${valor.toISOString()}'`;
                return valor;
              }).join(', ');
              
              sqlScript += `INSERT INTO "${nombreTabla}" (${columnasStr}) VALUES (${valores});\n`;
            }
            
            sqlScript += `\n`;
          }
          
          console.log(`✅ ${nombreTabla}: ${datos.length} registros`);
          
        } catch (error) {
          console.log(`⚠️  Error obteniendo datos de ${nombreTabla}: ${error.message}`);
        }
      }
    }
    
    // Rehabilitar constraints
    sqlScript += `-- Rehabilitar constraints\n`;
    sqlScript += `SET session_replication_role = DEFAULT;\n\n`;
    
    // Reiniciar secuencias
    sqlScript += `-- Reiniciar secuencias\n`;
    for (const tabla of tablas) {
      const nombreTabla = tabla.table_name;
      // Intentar reiniciar secuencia si existe
      sqlScript += `SELECT setval(pg_get_serial_sequence('${nombreTabla}', 'id'), COALESCE(MAX(id), 1)) FROM "${nombreTabla}";\n`;
    }
    
    sqlScript += `\n-- Fin del script de sincronización\n`;
    
    return sqlScript;
    
  } catch (error) {
    console.error('❌ Error generando script SQL:', error.message);
    throw error;
  }
}

/**
 * Aplicar script SQL a la base de datos remota
 */
async function aplicarScriptSQL(sqlScript) {
  try {
    console.log('\n🚀 Aplicando script SQL a base de datos remota...');
    
    // Dividir el script en statements individuales
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📋 ${statements.length} statements SQL a ejecutar`);
    
    let exitosos = 0;
    let errores = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement) {
        try {
          await sequelizeRemote.query(statement + ';');
          exitosos++;
          
          if (i % 100 === 0) {
            console.log(`⏳ Progreso: ${i}/${statements.length} statements ejecutados`);
          }
          
        } catch (error) {
          errores++;
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            // Ignorar errores de duplicados
          } else {
            console.log(`⚠️  Error en statement ${i}: ${error.message.slice(0, 100)}...`);
          }
        }
      }
    }
    
    console.log(`✅ Script aplicado: ${exitosos} exitosos, ${errores} errores`);
    return { exitosos, errores };
    
  } catch (error) {
    console.error('❌ Error aplicando script SQL:', error.message);
    throw error;
  }
}

/**
 * Verificar sincronización
 */
async function verificarSincronizacion() {
  try {
    console.log('\n🔍 Verificando sincronización...');
    
    // Obtener conteos de ambas bases de datos
    const [tablasLocal] = await sequelizeLocal.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const [tablasRemote] = await sequelizeRemote.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📊 Tablas locales: ${tablasLocal.length}`);
    console.log(`📊 Tablas remotas: ${tablasRemote.length}`);
    
    // Verificar algunas tablas importantes
    const tablasImportantes = ['departamentos_municipios', 'municipios_municipios', 'usuarios'];
    
    for (const tabla of tablasImportantes) {
      try {
        const [countLocal] = await sequelizeLocal.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
        const [countRemote] = await sequelizeRemote.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
        
        const localCount = countLocal[0].total;
        const remoteCount = countRemote[0].total;
        
        if (localCount === remoteCount) {
          console.log(`✅ ${tabla}: ${localCount} registros (sincronizado)`);
        } else {
          console.log(`⚠️  ${tabla}: local=${localCount}, remoto=${remoteCount} (diferencia)`);
        }
        
      } catch (error) {
        console.log(`❌ Error verificando ${tabla}: ${error.message}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function ejecutarSincronizacionCompleta() {
  console.log('🚀 SINCRONIZACIÓN COMPLETA BD VACÍA');
  console.log('==================================\n');
  
  try {
    // 1. Verificar conexiones
    console.log('1. 🔗 Verificando conexiones...');
    await sequelizeLocal.authenticate();
    console.log('✅ Conexión local establecida');
    
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión remota establecida');
    
    // 2. Verificar si la BD remota está vacía
    const bdVacia = await verificarBDVacia();
    
    // 3. Generar script SQL completo
    const sqlScript = await generarScriptSQL();
    
    // 4. Guardar script en archivo
    const nombreArchivo = `sincronizacion_completa_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.sql`;
    await fs.writeFile(nombreArchivo, sqlScript, 'utf8');
    console.log(`💾 Script guardado en: ${nombreArchivo}`);
    
    // 5. Aplicar script a BD remota
    const resultado = await aplicarScriptSQL(sqlScript);
    
    // 6. Verificar sincronización
    await verificarSincronizacion();
    
    // Resultado final
    console.log('\n🎉 SINCRONIZACIÓN COMPLETADA');
    console.log('============================');
    console.log(`✅ Script SQL generado: ${nombreArchivo}`);
    console.log(`✅ Statements ejecutados: ${resultado.exitosos}`);
    console.log(`⚠️  Errores encontrados: ${resultado.errores}`);
    
    if (bdVacia) {
      console.log('🌟 Base de datos remota era completamente vacía - sincronización óptima');
    }
    
    console.log('\n📋 La base de datos remota ahora debería estar sincronizada');
    console.log('🔗 Puedes verificar en: http://206.62.139.100:3000/api/docs');
    
  } catch (error) {
    console.error('\n❌ ERROR EN SINCRONIZACIÓN:', error.message);
  } finally {
    await sequelizeLocal.close();
    await sequelizeRemote.close();
  }
}

// Ejecutar
ejecutarSincronizacionCompleta();
