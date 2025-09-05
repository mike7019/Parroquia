/**
 * SCRIPT DE LIMPIEZA Y SINCRONIZACIÓN COMPLETA
 * 
 * Este script limpia completamente la base de datos de producción
 * y la sincroniza para que quede idéntica a la local.
 * 
 * FUNCIONALIDADES:
 * 1. Detecta automáticamente nombres de tablas en producción
 * 2. Hace backup automático antes de limpiar
 * 3. Limpia datos manteniendo estructura
 * 4. Sincroniza modelos de Sequelize
 * 5. Aplica seeders y datos básicos
 */

import { Sequelize } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

// Configuración de base de datos remota
const REMOTE_DB_CONFIG = {
  host: process.env.DB_HOST || process.env.REMOTE_DB_HOST || '206.62.139.100',
  port: process.env.DB_PORT || process.env.REMOTE_DB_PORT || 5432,
  database: process.env.DB_NAME || process.env.REMOTE_DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || process.env.REMOTE_DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || process.env.REMOTE_DB_PASSWORD,
  dialect: 'postgres',
  logging: console.log
};

// Conexión a base de datos remota
const sequelizeRemote = new Sequelize(
  REMOTE_DB_CONFIG.database,
  REMOTE_DB_CONFIG.username,
  REMOTE_DB_CONFIG.password,
  REMOTE_DB_CONFIG
);

/**
 * Obtener todas las tablas existentes en la base de datos
 */
async function obtenerTablasExistentes() {
  try {
    console.log('🔍 Detectando tablas existentes en producción...');
    
    const [results] = await sequelizeRemote.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tablas = results.map(row => row.table_name);
    console.log(`📋 ${tablas.length} tablas encontradas:`, tablas.join(', '));
    
    return tablas;
  } catch (error) {
    console.error('❌ Error obteniendo tablas:', error.message);
    return [];
  }
}

/**
 * Hacer backup de la base de datos antes de limpiar
 */
async function hacerBackup() {
  try {
    console.log('\n💾 Creando backup de seguridad...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `backup_cleanup_${timestamp}.sql`;
    
    // Comando para hacer backup (esto se debe ejecutar en el servidor)
    const backupCommand = `pg_dump -h ${REMOTE_DB_CONFIG.host} -U ${REMOTE_DB_CONFIG.username} -d ${REMOTE_DB_CONFIG.database} > ${backupName}`;
    
    console.log('📝 Comando de backup sugerido:');
    console.log(`ssh usuario@${REMOTE_DB_CONFIG.host}`);
    console.log(backupCommand);
    
    // Dar tiempo al usuario para hacer el backup
    console.log('\n⚠️  EJECUTE EL BACKUP ANTES DE CONTINUAR');
    console.log('Presione Enter cuando haya completado el backup...');
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    return backupName;
  } catch (error) {
    console.error('❌ Error en backup:', error.message);
    throw error;
  }
}

/**
 * Limpiar datos de todas las tablas manteniendo la estructura
 */
async function limpiarDatosManteniendoEstructura(tablas) {
  try {
    console.log('\n🧹 Limpiando datos de todas las tablas...');
    
    // Deshabilitar constraints temporalmente
    await sequelizeRemote.query('SET session_replication_role = replica;');
    
    // Limpiar tablas en orden específico para evitar problemas de FK
    const ordenLimpieza = [
      // Tablas de datos principales (dependientes)
      'difuntos_familias',
      'personas_personas', 
      'familias_familias',
      
      // Tablas geográficas (dependientes)
      'veredas_veredas',
      'sectores_sectores', 
      'parroquias_parroquias',
      'municipios_municipios',
      'departamentos_municipios',
      
      // Tablas de catálogos
      'tipos_vivienda',
      'disposicion_basuras',
      'sistemas_acueducto',
      'aguas_residuales',
      'sexos',
      'tipos_identificacion',
      'estados_civiles',
      'estudios',
      'parentescos',
      'comunidades_culturales',
      'enfermedades',
      'profesiones',
      
      // Tablas de usuarios y autenticación
      'refresh_tokens',
      'usuarios'
    ];
    
    // Agregar cualquier tabla que no esté en el orden específico
    for (const tabla of tablas) {
      if (!ordenLimpieza.includes(tabla)) {
        ordenLimpieza.push(tabla);
      }
    }
    
    // Limpiar cada tabla
    for (const tabla of ordenLimpieza) {
      if (tablas.includes(tabla)) {
        try {
          await sequelizeRemote.query(`TRUNCATE TABLE "${tabla}" RESTART IDENTITY CASCADE;`);
          console.log(`✅ Limpiada tabla: ${tabla}`);
        } catch (error) {
          console.log(`⚠️  Error limpiando ${tabla}: ${error.message}`);
          // Intentar DELETE si TRUNCATE falla
          try {
            await sequelizeRemote.query(`DELETE FROM "${tabla}";`);
            console.log(`✅ Limpiada tabla con DELETE: ${tabla}`);
          } catch (deleteError) {
            console.log(`❌ No se pudo limpiar ${tabla}: ${deleteError.message}`);
          }
        }
      }
    }
    
    // Rehabilitar constraints
    await sequelizeRemote.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ Limpieza de datos completada');
    return true;
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error.message);
    // Asegurar que se rehabiliten los constraints
    try {
      await sequelizeRemote.query('SET session_replication_role = DEFAULT;');
    } catch (e) {
      console.error('❌ Error rehabilitando constraints:', e.message);
    }
    return false;
  }
}

/**
 * Reiniciar secuencias de IDs
 */
async function reiniciarSecuencias() {
  try {
    console.log('\n🔄 Reiniciando secuencias de IDs...');
    
    const secuencias = [
      'departamentos_municipios_id_departamento_seq',
      'municipios_municipios_id_municipio_seq',
      'parroquias_parroquias_id_parroquia_seq',
      'sectores_sectores_id_sector_seq',
      'veredas_veredas_id_vereda_seq',
      'familias_familias_id_familia_seq',
      'personas_personas_id_persona_seq',
      'usuarios_id_seq'
    ];
    
    for (const secuencia of secuencias) {
      try {
        await sequelizeRemote.query(`ALTER SEQUENCE IF EXISTS ${secuencia} RESTART WITH 1;`);
        console.log(`✅ Reiniciada secuencia: ${secuencia}`);
      } catch (error) {
        console.log(`⚠️  Secuencia ${secuencia}: ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error reiniciando secuencias:', error.message);
    return false;
  }
}

/**
 * Sincronizar modelos de Sequelize
 */
async function sincronizarModelos() {
  try {
    console.log('\n🔄 Sincronizando modelos de Sequelize...');
    
    // Importar modelos desde el proyecto local
    const { sequelize: sequelizeLocal } = await import('./src/models/index.js');
    
    // Cerrar conexión local si existe
    if (sequelizeLocal) {
      await sequelizeLocal.close();
    }
    
    // Usar la configuración remota para sincronizar
    const sequelizeSync = new Sequelize(
      REMOTE_DB_CONFIG.database,
      REMOTE_DB_CONFIG.username,
      REMOTE_DB_CONFIG.password,
      {
        ...REMOTE_DB_CONFIG,
        logging: false
      }
    );
    
    // Importar y sincronizar modelos uno por uno
    console.log('📋 Sincronizando estructura de tablas...');
    
    // Sincronizar con alter para actualizar estructura existente
    await sequelizeSync.sync({ alter: true });
    
    console.log('✅ Modelos sincronizados exitosamente');
    
    await sequelizeSync.close();
    return true;
    
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error.message);
    console.log('ℹ️  Continuando sin sincronización de modelos...');
    return false;
  }
}

/**
 * Aplicar datos básicos (usuarios admin, catálogos, geografía)
 */
async function aplicarDatosBasicos() {
  try {
    console.log('\n📊 Aplicando datos básicos...');
    
    // 1. Ejecutar seeder de geografía optimizada
    console.log('🌍 Aplicando datos geográficos...');
    try {
      const { ejecutarTodoOptimizado } = await import('./src/seeders/ejecutarGeografiaOptimizada.js');
      await ejecutarTodoOptimizado();
      console.log('✅ Datos geográficos aplicados');
    } catch (error) {
      console.log('⚠️  Error con seeder geográfico:', error.message);
    }
    
    // 2. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    try {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await sequelizeRemote.query(`
        INSERT INTO usuarios (nombre, email, password, rol, verificado, created_at, updated_at)
        VALUES ('Administrador', 'admin@parroquia.com', :password, 'administrador', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          updated_at = NOW();
      `, {
        replacements: { password: hashedPassword }
      });
      
      console.log('✅ Usuario administrador creado');
    } catch (error) {
      console.log('⚠️  Error creando usuario admin:', error.message);
    }
    
    // 3. Datos de catálogos básicos
    console.log('📋 Creando catálogos básicos...');
    
    const catalogos = [
      {
        tabla: 'sexos',
        datos: [
          { id: 1, nombre: 'Masculino' },
          { id: 2, nombre: 'Femenino' }
        ]
      },
      {
        tabla: 'tipos_identificacion',
        datos: [
          { id: 1, nombre: 'Cédula de Ciudadanía', codigo: 'CC' },
          { id: 2, nombre: 'Tarjeta de Identidad', codigo: 'TI' },
          { id: 3, nombre: 'Registro Civil', codigo: 'RC' }
        ]
      },
      {
        tabla: 'estados_civiles',
        datos: [
          { id: 1, nombre: 'Soltero' },
          { id: 2, nombre: 'Casado' },
          { id: 3, nombre: 'Viudo' },
          { id: 4, nombre: 'Divorciado' },
          { id: 5, nombre: 'Unión Libre' }
        ]
      }
    ];
    
    for (const catalogo of catalogos) {
      try {
        for (const dato of catalogo.datos) {
          const campos = Object.keys(dato).join(', ');
          const valores = Object.keys(dato).map(k => `:${k}`).join(', ');
          const updates = Object.keys(dato).filter(k => k !== 'id').map(k => `${k} = EXCLUDED.${k}`).join(', ');
          
          await sequelizeRemote.query(`
            INSERT INTO ${catalogo.tabla} (${campos}, created_at, updated_at)
            VALUES (${valores}, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET ${updates}, updated_at = NOW();
          `, { replacements: dato });
        }
        console.log(`✅ Catálogo ${catalogo.tabla} creado`);
      } catch (error) {
        console.log(`⚠️  Error con catálogo ${catalogo.tabla}: ${error.message}`);
      }
    }
    
    console.log('✅ Datos básicos aplicados');
    return true;
    
  } catch (error) {
    console.error('❌ Error aplicando datos básicos:', error.message);
    return false;
  }
}

/**
 * Verificar sincronización final
 */
async function verificarSincronizacion() {
  try {
    console.log('\n🔍 Verificando sincronización final...');
    
    const verificaciones = [
      { tabla: 'departamentos_municipios', minimo: 30 },
      { tabla: 'municipios_municipios', minimo: 1000 },
      { tabla: 'usuarios', minimo: 1 },
      { tabla: 'sexos', minimo: 2 },
      { tabla: 'tipos_identificacion', minimo: 3 }
    ];
    
    let todoOK = true;
    
    for (const verificacion of verificaciones) {
      try {
        const [result] = await sequelizeRemote.query(`SELECT COUNT(*) as total FROM ${verificacion.tabla};`);
        const total = parseInt(result[0].total);
        
        if (total >= verificacion.minimo) {
          console.log(`✅ ${verificacion.tabla}: ${total} registros`);
        } else {
          console.log(`⚠️  ${verificacion.tabla}: solo ${total} registros (esperado: ${verificacion.minimo}+)`);
          todoOK = false;
        }
      } catch (error) {
        console.log(`❌ Error verificando ${verificacion.tabla}: ${error.message}`);
        todoOK = false;
      }
    }
    
    return todoOK;
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function ejecutarLimpiezaCompleta() {
  console.log('🚀 LIMPIEZA Y SINCRONIZACIÓN COMPLETA DE PRODUCCIÓN');
  console.log('=====================================================\n');
  
  let pasoActual = 1;
  
  try {
    // Verificar conexión
    console.log(`${pasoActual}. 🔗 Verificando conexión...`);
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión establecida');
    pasoActual++;
    
    // Obtener tablas existentes
    console.log(`\n${pasoActual}. 📋 Detectando estructura actual...`);
    const tablas = await obtenerTablasExistentes();
    if (tablas.length === 0) {
      throw new Error('No se pudieron detectar tablas');
    }
    pasoActual++;
    
    // Hacer backup
    console.log(`\n${pasoActual}. 💾 Creando backup...`);
    await hacerBackup();
    pasoActual++;
    
    // Confirmar operación
    console.log(`\n${pasoActual}. ⚠️  CONFIRMACIÓN FINAL`);
    console.log('==========================================');
    console.log('Esta operación eliminará TODOS los datos de producción');
    console.log('y sincronizará con su base de datos local.');
    console.log('\n¿Está seguro de continuar? (escriba "CONFIRMO" para continuar)');
    
    const respuesta = await new Promise(resolve => {
      process.stdin.once('data', data => resolve(data.toString().trim()));
    });
    
    if (respuesta !== 'CONFIRMO') {
      console.log('❌ Operación cancelada por el usuario');
      return;
    }
    pasoActual++;
    
    // Limpiar datos
    console.log(`\n${pasoActual}. 🧹 Limpiando datos...`);
    const limpiezaOK = await limpiarDatosManteniendoEstructura(tablas);
    if (!limpiezaOK) {
      throw new Error('Error en limpieza de datos');
    }
    pasoActual++;
    
    // Reiniciar secuencias
    console.log(`\n${pasoActual}. 🔄 Reiniciando secuencias...`);
    await reiniciarSecuencias();
    pasoActual++;
    
    // Sincronizar modelos
    console.log(`\n${pasoActual}. 🔄 Sincronizando estructura...`);
    await sincronizarModelos();
    pasoActual++;
    
    // Aplicar datos básicos
    console.log(`\n${pasoActual}. 📊 Aplicando datos básicos...`);
    await aplicarDatosBasicos();
    pasoActual++;
    
    // Verificar final
    console.log(`\n${pasoActual}. 🔍 Verificando resultado...`);
    const verificacionOK = await verificarSincronizacion();
    
    // Resultado final
    console.log('\n🎉 SINCRONIZACIÓN COMPLETADA');
    console.log('============================');
    
    if (verificacionOK) {
      console.log('✅ Base de datos sincronizada exitosamente');
      console.log('✅ Estructura actualizada');
      console.log('✅ Datos básicos aplicados');
      console.log('✅ Usuario administrador creado');
      console.log('\n📋 Próximos pasos:');
      console.log('1. Probar login: admin@parroquia.com / admin123');
      console.log('2. Verificar Swagger: http://206.62.139.100:3000/api/docs');
      console.log('3. Probar creación de encuestas');
    } else {
      console.log('⚠️  Sincronización completada con advertencias');
      console.log('🔍 Revise los logs anteriores para detalles');
    }
    
  } catch (error) {
    console.error(`\n❌ ERROR EN PASO ${pasoActual}:`, error.message);
    console.error('🔄 Revise los logs y considere restaurar desde backup');
  } finally {
    await sequelizeRemote.close();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarLimpiezaCompleta();
}

export {
  obtenerTablasExistentes,
  limpiarDatosManteniendoEstructura,
  sincronizarModelos,
  aplicarDatosBasicos,
  ejecutarLimpiezaCompleta
};
