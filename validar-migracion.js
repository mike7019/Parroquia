/**
 * VALIDADOR DE MIGRACIÓN DE BASE DE DATOS
 * 
 * Este script compara dos bases de datos para validar que una migración
 * fue exitosa, verificando estructura, datos y integridad.
 */

import { Sequelize } from 'sequelize';

/**
 * Conectar a base de datos
 */
async function conectarDB(config, nombre) {
  try {
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: false
      }
    );
    
    await sequelize.authenticate();
    console.log(`✅ ${nombre}: ${config.host}:${config.port}/${config.database}`);
    return sequelize;
    
  } catch (error) {
    console.error(`❌ Error conectando a ${nombre}:`, error.message);
    throw error;
  }
}

/**
 * Obtener lista de tablas
 */
async function obtenerTablas(sequelize) {
  const [resultados] = await sequelize.query(`
    SELECT table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  
  return resultados.map(r => r.table_name);
}

/**
 * Obtener estructura de tabla
 */
async function obtenerEstructuraTabla(sequelize, tabla) {
  const [resultados] = await sequelize.query(`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = '${tabla}'
    ORDER BY ordinal_position;
  `);
  
  return resultados;
}

/**
 * Contar registros en tabla
 */
async function contarRegistros(sequelize, tabla) {
  try {
    const [resultados] = await sequelize.query(`SELECT COUNT(*) as total FROM "${tabla}";`);
    return parseInt(resultados[0].total);
  } catch (error) {
    return -1; // Error accediendo a la tabla
  }
}

/**
 * Obtener constraints de tabla
 */
async function obtenerConstraints(sequelize, tabla) {
  const [resultados] = await sequelize.query(`
    SELECT 
      constraint_name,
      constraint_type
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' 
    AND table_name = '${tabla}'
    ORDER BY constraint_type, constraint_name;
  `);
  
  return resultados;
}

/**
 * Comparar estructuras de tablas
 */
function compararEstructuras(estructura1, estructura2, tabla) {
  const diferencias = [];
  
  // Crear mapas para comparación
  const cols1 = new Map(estructura1.map(col => [col.column_name, col]));
  const cols2 = new Map(estructura2.map(col => [col.column_name, col]));
  
  // Verificar columnas faltantes en destino
  for (const [nombre, col] of cols1) {
    if (!cols2.has(nombre)) {
      diferencias.push(`❌ Columna faltante en destino: ${nombre}`);
    } else {
      const col2 = cols2.get(nombre);
      if (col.data_type !== col2.data_type) {
        diferencias.push(`⚠️  Tipo diferente en ${nombre}: ${col.data_type} vs ${col2.data_type}`);
      }
    }
  }
  
  // Verificar columnas extra en destino
  for (const [nombre] of cols2) {
    if (!cols1.has(nombre)) {
      diferencias.push(`➕ Columna extra en destino: ${nombre}`);
    }
  }
  
  return diferencias;
}

/**
 * Validar migración entre dos bases de datos
 */
async function validarMigracion(configOrigen, configDestino) {
  console.log('🔍 VALIDACIÓN DE MIGRACIÓN');
  console.log('=========================\n');
  
  let dbOrigen, dbDestino;
  
  try {
    // Conectar a ambas bases de datos
    console.log('📡 Conectando a bases de datos...');
    dbOrigen = await conectarDB(configOrigen, 'ORIGEN');
    dbDestino = await conectarDB(configDestino, 'DESTINO');
    
    // 1. Comparar listas de tablas
    console.log('\n📋 Comparando listas de tablas...');
    const tablasOrigen = await obtenerTablas(dbOrigen);
    const tablasDestino = await obtenerTablas(dbDestino);
    
    console.log(`📊 Origen: ${tablasOrigen.length} tablas`);
    console.log(`📊 Destino: ${tablasDestino.length} tablas`);
    
    const tablasFaltantes = tablasOrigen.filter(t => !tablasDestino.includes(t));
    const tablasExtra = tablasDestino.filter(t => !tablasOrigen.includes(t));
    
    if (tablasFaltantes.length > 0) {
      console.log('❌ Tablas faltantes en destino:');
      tablasFaltantes.forEach(tabla => console.log(`   - ${tabla}`));
    }
    
    if (tablasExtra.length > 0) {
      console.log('➕ Tablas extra en destino:');
      tablasExtra.forEach(tabla => console.log(`   - ${tabla}`));
    }
    
    if (tablasFaltantes.length === 0 && tablasExtra.length === 0) {
      console.log('✅ Listas de tablas coinciden');
    }
    
    // 2. Comparar estructuras y datos
    console.log('\n🔍 Validando estructura y datos por tabla...');
    
    const tablasComunes = tablasOrigen.filter(t => tablasDestino.includes(t));
    let erroresEstructura = 0;
    let erroresDatos = 0;
    let totalDiferencias = 0;
    
    for (const tabla of tablasComunes) {
      console.log(`\n📄 Validando: ${tabla}`);
      
      try {
        // Comparar estructura
        const estructuraOrigen = await obtenerEstructuraTabla(dbOrigen, tabla);
        const estructuraDestino = await obtenerEstructuraTabla(dbDestino, tabla);
        
        const diferenciasEstructura = compararEstructuras(estructuraOrigen, estructuraDestino, tabla);
        
        if (diferenciasEstructura.length > 0) {
          erroresEstructura++;
          console.log(`   ⚠️  Diferencias de estructura (${diferenciasEstructura.length}):`);
          diferenciasEstructura.forEach(diff => console.log(`     ${diff}`));
        } else {
          console.log('   ✅ Estructura OK');
        }
        
        // Comparar conteos de datos
        const countOrigen = await contarRegistros(dbOrigen, tabla);
        const countDestino = await contarRegistros(dbDestino, tabla);
        
        if (countOrigen !== countDestino) {
          erroresDatos++;
          const diferencia = Math.abs(countOrigen - countDestino);
          totalDiferencias += diferencia;
          console.log(`   ❌ Datos: Origen=${countOrigen}, Destino=${countDestino} (diff: ${diferencia})`);
        } else {
          console.log(`   ✅ Datos OK: ${countOrigen} registros`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error validando: ${error.message}`);
        erroresEstructura++;
      }
    }
    
    // 3. Verificar constraints principales
    console.log('\n🔗 Verificando constraints principales...');
    
    const tablasImportantes = ['familias_familias', 'personas_personas', 'usuarios'];
    for (const tabla of tablasImportantes) {
      if (tablasComunes.includes(tabla)) {
        try {
          const constraintsOrigen = await obtenerConstraints(dbOrigen, tabla);
          const constraintsDestino = await obtenerConstraints(dbDestino, tabla);
          
          if (constraintsOrigen.length === constraintsDestino.length) {
            console.log(`✅ ${tabla}: ${constraintsOrigen.length} constraints`);
          } else {
            console.log(`⚠️  ${tabla}: Origen=${constraintsOrigen.length}, Destino=${constraintsDestino.length} constraints`);
          }
        } catch (error) {
          console.log(`❌ ${tabla}: Error verificando constraints`);
        }
      }
    }
    
    // 4. Resumen final
    console.log('\n📊 RESUMEN DE VALIDACIÓN');
    console.log('========================');
    console.log(`📋 Tablas validadas: ${tablasComunes.length}`);
    console.log(`⚠️  Tablas con diferencias de estructura: ${erroresEstructura}`);
    console.log(`❌ Tablas con diferencias de datos: ${erroresDatos}`);
    console.log(`📊 Total diferencias de registros: ${totalDiferencias}`);
    
    if (tablasFaltantes.length === 0 && erroresEstructura === 0 && erroresDatos === 0) {
      console.log('\n🎉 ¡MIGRACIÓN EXITOSA!');
      console.log('✅ Todas las validaciones pasaron correctamente');
    } else if (erroresDatos === 0 && erroresEstructura <= 2) {
      console.log('\n⚠️  MIGRACIÓN ACEPTABLE');
      console.log('✅ Datos migrados correctamente');
      console.log('⚠️  Algunas diferencias menores de estructura');
    } else {
      console.log('\n❌ MIGRACIÓN CON PROBLEMAS');
      console.log('🔍 Revise los errores reportados');
      console.log('💡 Considere repetir la migración');
    }
    
    return {
      exito: erroresDatos === 0 && erroresEstructura <= 2,
      tablasValidadas: tablasComunes.length,
      erroresEstructura,
      erroresDatos,
      totalDiferencias
    };
    
  } catch (error) {
    console.error('\n❌ ERROR EN VALIDACIÓN:', error.message);
    return { exito: false, error: error.message };
  } finally {
    // Cerrar conexiones
    if (dbOrigen) await dbOrigen.close();
    if (dbDestino) await dbDestino.close();
  }
}

/**
 * Configuraciones predefinidas para validación
 */
const CONFIGURACIONES_VALIDACION = {
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
  nueva: {
    host: 'localhost',
    port: 5432,
    database: 'parroquia_db_nueva',
    username: 'parroquia_user',
    password: process.env.DB_PASSWORD
  }
};

/**
 * Función principal para ejecutar validación
 */
async function main() {
  console.log('🔍 VALIDADOR DE MIGRACIÓN DE BASE DE DATOS');
  console.log('==========================================\n');
  
  // Ejemplo de uso común: validar migración local -> nueva
  if (process.argv.includes('--local-nueva')) {
    await validarMigracion(
      CONFIGURACIONES_VALIDACION.local,
      CONFIGURACIONES_VALIDACION.nueva
    );
    return;
  }
  
  // Ejemplo: validar migración local -> producción
  if (process.argv.includes('--local-prod')) {
    await validarMigracion(
      CONFIGURACIONES_VALIDACION.local,
      CONFIGURACIONES_VALIDACION.produccion
    );
    return;
  }
  
  console.log('💡 Ejemplos de uso:');
  console.log('node validar-migracion.js --local-nueva    # Validar local -> nueva');
  console.log('node validar-migracion.js --local-prod     # Validar local -> producción');
  console.log('\n📝 O edite el script para configurar sus propias bases de datos');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validarMigracion, CONFIGURACIONES_VALIDACION };
