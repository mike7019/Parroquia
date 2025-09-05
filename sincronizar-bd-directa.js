/**
 * SINCRONIZACIÓN DIRECTA DE BASES DE DATOS
 * 
 * Este script sincroniza directamente desde tu BD local a la BD remota
 * usando las credenciales del docker-compose.yml
 * 
 * Local: localhost:5432
 * Remoto: 206.62.139.100:5432
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno del .env
dotenv.config();

// Configuración base de datos LOCAL (desde .env)
const LOCAL_DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgres',
  logging: false
};

// Configuración base de datos REMOTA (mismo usuario/password, diferente host)
const REMOTE_DB_CONFIG = {
  host: '206.62.139.100',
  port: 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgres',
  logging: false
};

console.log('🔄 SINCRONIZACIÓN DIRECTA DE BASES DE DATOS');
console.log('==========================================');
console.log(`📍 Local:  ${LOCAL_DB_CONFIG.host}:${LOCAL_DB_CONFIG.port}/${LOCAL_DB_CONFIG.database}`);
console.log(`📍 Remoto: ${REMOTE_DB_CONFIG.host}:${REMOTE_DB_CONFIG.port}/${REMOTE_DB_CONFIG.database}`);
console.log('');

// Conexiones
let sequelizeLocal, sequelizeRemote;

/**
 * Verificar conexiones a ambas bases de datos
 */
async function verificarConexiones() {
  try {
    console.log('🔗 Verificando conexiones...');
    
    // Conexión local
    sequelizeLocal = new Sequelize(
      LOCAL_DB_CONFIG.database,
      LOCAL_DB_CONFIG.username,
      LOCAL_DB_CONFIG.password,
      LOCAL_DB_CONFIG
    );
    
    await sequelizeLocal.authenticate();
    console.log('✅ Conexión LOCAL establecida');
    
    // Conexión remota
    sequelizeRemote = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      REMOTE_DB_CONFIG
    );
    
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión REMOTA establecida');
    
    return true;
  } catch (error) {
    console.error('❌ Error en conexiones:', error.message);
    return false;
  }
}

/**
 * Obtener lista de tablas de la base de datos local
 */
async function obtenerTablasLocales() {
  try {
    const [results] = await sequelizeLocal.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tablas = results.map(row => row.table_name);
    console.log(`📋 ${tablas.length} tablas encontradas en LOCAL:`, tablas.join(', '));
    
    return tablas;
  } catch (error) {
    console.error('❌ Error obteniendo tablas locales:', error.message);
    return [];
  }
}

/**
 * Limpiar base de datos remota
 */
async function limpiarBaseDatosRemota(tablas) {
  try {
    console.log('\n🧹 Limpiando base de datos remota...');
    
    // Deshabilitar constraints
    await sequelizeRemote.query('SET session_replication_role = replica;');
    
    // Orden de limpieza para evitar problemas de FK
    const ordenLimpieza = [
      'difuntos_familias',
      'personas_personas',
      'familias_familias',
      'veredas_veredas',
      'sectores_sectores',
      'parroquias_parroquias',
      'municipios_municipios',
      'departamentos_municipios',
      'refresh_tokens',
      'usuarios'
    ];
    
    // Agregar otras tablas que no estén en el orden
    for (const tabla of tablas) {
      if (!ordenLimpieza.includes(tabla)) {
        ordenLimpieza.push(tabla);
      }
    }
    
    // Limpiar cada tabla
    for (const tabla of ordenLimpieza) {
      try {
        await sequelizeRemote.query(`TRUNCATE TABLE IF EXISTS "${tabla}" RESTART IDENTITY CASCADE;`);
        console.log(`✅ Limpiada: ${tabla}`);
      } catch (error) {
        console.log(`⚠️  ${tabla}: ${error.message}`);
      }
    }
    
    // Rehabilitar constraints
    await sequelizeRemote.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Limpieza completada');
    return true;
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    return false;
  }
}

/**
 * Copiar datos de una tabla específica
 */
async function copiarTabla(tabla) {
  try {
    // Obtener datos de la tabla local
    const [rows] = await sequelizeLocal.query(`SELECT * FROM "${tabla}";`);
    
    if (rows.length === 0) {
      console.log(`📭 ${tabla}: sin datos`);
      return true;
    }
    
    // Obtener estructura de columnas
    const [columns] = await sequelizeLocal.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = '${tabla}' 
      ORDER BY ordinal_position;
    `);
    
    const columnNames = columns.map(col => col.column_name);
    
    // Insertar datos en la tabla remota
    for (const row of rows) {
      const values = columnNames.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (value instanceof Date) return `'${value.toISOString()}'`;
        return value;
      });
      
      const insertQuery = `
        INSERT INTO "${tabla}" (${columnNames.map(col => `"${col}"`).join(', ')})
        VALUES (${values.join(', ')});
      `;
      
      await sequelizeRemote.query(insertQuery);
    }
    
    console.log(`✅ ${tabla}: ${rows.length} registros copiados`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error copiando ${tabla}:`, error.message);
    return false;
  }
}

/**
 * Sincronizar todas las tablas
 */
async function sincronizarTablas(tablas) {
  try {
    console.log('\n📊 Copiando datos...');
    
    // Orden de copia para respetar FK
    const ordenCopia = [
      'usuarios',
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
      'familias_familias',
      'personas_personas',
      'difuntos_familias',
      'refresh_tokens'
    ];
    
    // Agregar otras tablas que no estén en el orden
    for (const tabla of tablas) {
      if (!ordenCopia.includes(tabla)) {
        ordenCopia.push(tabla);
      }
    }
    
    let exitosos = 0;
    let errores = 0;
    
    // Copiar cada tabla
    for (const tabla of ordenCopia) {
      if (tablas.includes(tabla)) {
        const exito = await copiarTabla(tabla);
        if (exito) {
          exitosos++;
        } else {
          errores++;
        }
      }
    }
    
    console.log(`\n📊 Resumen de copia:`);
    console.log(`✅ Exitosos: ${exitosos}`);
    console.log(`❌ Errores: ${errores}`);
    
    return errores === 0;
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    return false;
  }
}

/**
 * Verificar sincronización
 */
async function verificarSincronizacion(tablas) {
  try {
    console.log('\n🔍 Verificando sincronización...');
    
    let todasIguales = true;
    
    for (const tabla of tablas) {
      try {
        const [localCount] = await sequelizeLocal.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
        const [remoteCount] = await sequelizeRemote.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
        
        const local = parseInt(localCount[0].total);
        const remote = parseInt(remoteCount[0].total);
        
        if (local === remote) {
          console.log(`✅ ${tabla}: ${local} registros (coincide)`);
        } else {
          console.log(`❌ ${tabla}: Local=${local}, Remoto=${remote} (NO coincide)`);
          todasIguales = false;
        }
      } catch (error) {
        console.log(`⚠️  ${tabla}: Error verificando - ${error.message}`);
        todasIguales = false;
      }
    }
    
    return todasIguales;
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function ejecutarSincronizacion() {
  try {
    // 1. Verificar conexiones
    const conexionesOK = await verificarConexiones();
    if (!conexionesOK) {
      throw new Error('No se pudieron establecer las conexiones');
    }
    
    // 2. Obtener tablas locales
    const tablas = await obtenerTablasLocales();
    if (tablas.length === 0) {
      throw new Error('No se encontraron tablas en la base de datos local');
    }
    
    // 3. Confirmar operación
    console.log('\n⚠️  CONFIRMACIÓN');
    console.log('================');
    console.log('Esta operación eliminará TODOS los datos de la base remota');
    console.log('y los reemplazará con los datos de la base local.');
    console.log('\n¿Desea continuar? Presione Enter para continuar o Ctrl+C para cancelar...');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // 4. Limpiar base remota
    const limpiezaOK = await limpiarBaseDatosRemota(tablas);
    if (!limpiezaOK) {
      throw new Error('Error en la limpieza de la base de datos remota');
    }
    
    // 5. Sincronizar datos
    const sincronizacionOK = await sincronizarTablas(tablas);
    if (!sincronizacionOK) {
      console.log('⚠️  Sincronización completada con errores');
    }
    
    // 6. Verificar resultado
    const verificacionOK = await verificarSincronizacion(tablas);
    
    // Resultado final
    console.log('\n🎉 SINCRONIZACIÓN COMPLETADA');
    console.log('============================');
    
    if (verificacionOK) {
      console.log('✅ Todas las tablas sincronizadas correctamente');
      console.log('✅ Base de datos remota actualizada');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Verificar aplicación: http://206.62.139.100:3000');
      console.log('2. Probar login con usuario existente');
      console.log('3. Verificar Swagger: http://206.62.139.100:3000/api/docs');
    } else {
      console.log('⚠️  Sincronización completada con diferencias');
      console.log('🔍 Revise los detalles anteriores');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN SINCRONIZACIÓN:', error.message);
  } finally {
    // Cerrar conexiones
    if (sequelizeLocal) await sequelizeLocal.close();
    if (sequelizeRemote) await sequelizeRemote.close();
  }
}

// Ejecutar
ejecutarSincronizacion();
