/**
 * MIGRACIÓN COMPLETA DE CAMBIOS A PRODUCCIÓN
 * 
 * Este script aplica todos los cambios realizados en desarrollo
 * a la base de datos remota de producción.
 * 
 * CAMBIOS A APLICAR:
 * 1. Sistema geográfico optimizado con IDs secuenciales
 * 2. Datos de departamentos y municipios completos
 * 3. Estructura de tablas actualizada
 * 4. Datos de catálogos básicos
 * 
 * NOTA: Las variables de entorno deben estar configuradas en .bashrc
 */

import { Sequelize } from 'sequelize';

// Configuración de base de datos remota usando variables de entorno del sistema
const REMOTE_DB_CONFIG = {
  host: process.env.REMOTE_DB_HOST || process.env.DB_HOST || '206.62.139.100',
  port: process.env.REMOTE_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.REMOTE_DB_NAME || process.env.DB_NAME || 'parroquia_db',
  username: process.env.REMOTE_DB_USER || process.env.DB_USER || 'parroquia_user',
  password: process.env.REMOTE_DB_PASSWORD || process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Conexión a base de datos remota
const sequelizeRemote = new Sequelize(
  REMOTE_DB_CONFIG.database,
  REMOTE_DB_CONFIG.username,
  REMOTE_DB_CONFIG.password,
  REMOTE_DB_CONFIG
);

/**
 * Datos de departamentos con IDs secuenciales
 */
const DEPARTAMENTOS_OPTIMIZADOS = [
  { id_departamento: 1, nombre: 'Amazonas', codigo_dane: '91' },
  { id_departamento: 2, nombre: 'Antioquia', codigo_dane: '05' },
  { id_departamento: 3, nombre: 'Arauca', codigo_dane: '81' },
  { id_departamento: 4, nombre: 'Atlántico', codigo_dane: '08' },
  { id_departamento: 5, nombre: 'Bogotá D.C.', codigo_dane: '11' },
  { id_departamento: 6, nombre: 'Bolívar', codigo_dane: '13' },
  { id_departamento: 7, nombre: 'Boyacá', codigo_dane: '15' },
  { id_departamento: 8, nombre: 'Caldas', codigo_dane: '17' },
  { id_departamento: 9, nombre: 'Caquetá', codigo_dane: '18' },
  { id_departamento: 10, nombre: 'Casanare', codigo_dane: '85' },
  { id_departamento: 11, nombre: 'Cauca', codigo_dane: '19' },
  { id_departamento: 12, nombre: 'Cesar', codigo_dane: '20' },
  { id_departamento: 13, nombre: 'Chocó', codigo_dane: '27' },
  { id_departamento: 14, nombre: 'Córdoba', codigo_dane: '23' },
  { id_departamento: 15, nombre: 'Cundinamarca', codigo_dane: '25' },
  { id_departamento: 16, nombre: 'Guainía', codigo_dane: '94' },
  { id_departamento: 17, nombre: 'Guaviare', codigo_dane: '95' },
  { id_departamento: 18, nombre: 'Huila', codigo_dane: '41' },
  { id_departamento: 19, nombre: 'La Guajira', codigo_dane: '44' },
  { id_departamento: 20, nombre: 'Magdalena', codigo_dane: '47' },
  { id_departamento: 21, nombre: 'Meta', codigo_dane: '50' },
  { id_departamento: 22, nombre: 'Nariño', codigo_dane: '52' },
  { id_departamento: 23, nombre: 'Norte de Santander', codigo_dane: '54' },
  { id_departamento: 24, nombre: 'Putumayo', codigo_dane: '86' },
  { id_departamento: 25, nombre: 'Quindío', codigo_dane: '63' },
  { id_departamento: 26, nombre: 'Risaralda', codigo_dane: '66' },
  { id_departamento: 27, nombre: 'San Andrés y Providencia', codigo_dane: '88' },
  { id_departamento: 28, nombre: 'Santander', codigo_dane: '68' },
  { id_departamento: 29, nombre: 'Sucre', codigo_dane: '70' },
  { id_departamento: 30, nombre: 'Tolima', codigo_dane: '73' },
  { id_departamento: 31, nombre: 'Valle del Cauca', codigo_dane: '76' },
  { id_departamento: 32, nombre: 'Vaupés', codigo_dane: '97' },
  { id_departamento: 33, nombre: 'Vichada', codigo_dane: '99' }
];

/**
 * Verificar conexión a base de datos remota
 */
async function verificarConexionRemota() {
  try {
    await sequelizeRemote.authenticate();
    console.log('✅ Conexión a base de datos remota establecida exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a base de datos remota:', error.message);
    return false;
  }
}

/**
 * Verificar estructura de tablas en producción
 */
async function verificarEstructuraTablas() {
  try {
    console.log('\n🔍 Verificando estructura de tablas en producción...');
    
    const tablas = [
      'departamentos_municipios',
      'municipios_municipios', 
      'parroquias_parroquias',
      'sectores_sectores',
      'veredas_veredas',
      'familias_familias',
      'personas_personas',
      'difuntos_familias'
    ];
    
    for (const tabla of tablas) {
      try {
        const [results] = await sequelizeRemote.query(
          `SELECT column_name, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_name = '${tabla}' 
           ORDER BY ordinal_position;`
        );
        
        console.log(`📋 Tabla ${tabla}: ${results.length} columnas encontradas`);
      } catch (error) {
        console.log(`⚠️  Tabla ${tabla}: No existe o error - ${error.message}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
    return false;
  }
}

/**
 * Limpiar datos geográficos existentes
 */
async function limpiarDatosGeograficos() {
  try {
    console.log('\n🧹 Limpiando datos geográficos existentes...');
    
    // Eliminar en orden correcto para evitar problemas de FK
    await sequelizeRemote.query('DELETE FROM veredas_veredas;');
    await sequelizeRemote.query('DELETE FROM sectores_sectores;');
    await sequelizeRemote.query('DELETE FROM parroquias_parroquias;');
    await sequelizeRemote.query('DELETE FROM municipios_municipios;');
    await sequelizeRemote.query('DELETE FROM departamentos_municipios;');
    
    // Reiniciar secuencias
    await sequelizeRemote.query('ALTER SEQUENCE departamentos_municipios_id_departamento_seq RESTART WITH 1;');
    await sequelizeRemote.query('ALTER SEQUENCE municipios_municipios_id_municipio_seq RESTART WITH 1;');
    
    console.log('✅ Datos geográficos limpiados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando datos:', error.message);
    return false;
  }
}

/**
 * Insertar departamentos optimizados
 */
async function insertarDepartamentos() {
  try {
    console.log('\n🏛️ Insertando departamentos optimizados...');
    
    for (const dept of DEPARTAMENTOS_OPTIMIZADOS) {
      await sequelizeRemote.query(`
        INSERT INTO departamentos_municipios (id_departamento, nombre, codigo_dane, created_at, updated_at)
        VALUES (:id, :nombre, :codigo, NOW(), NOW())
        ON CONFLICT (id_departamento) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          codigo_dane = EXCLUDED.codigo_dane,
          updated_at = NOW();
      `, {
        replacements: {
          id: dept.id_departamento,
          nombre: dept.nombre,
          codigo: dept.codigo_dane
        }
      });
    }
    
    console.log(`✅ ${DEPARTAMENTOS_OPTIMIZADOS.length} departamentos insertados exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error insertando departamentos:', error.message);
    return false;
  }
}

/**
 * Obtener y procesar municipios de API externa
 */
async function procesarMunicipios() {
  try {
    console.log('\n🏘️ Obteniendo municipios de API externa...');
    
    const response = await fetch('https://api-colombia.com/api/v1/City');
    
    if (!response.ok) {
      throw new Error(`API respondió con status: ${response.status}`);
    }
    
    const municipiosAPI = await response.json();
    console.log(`📡 ${municipiosAPI.length} municipios obtenidos de la API`);
    
    // Mapear departamentos API a nuestros IDs
    const mapeoDeptos = {
      91: 1, 5: 2, 81: 3, 8: 4, 11: 5, 13: 6, 15: 7, 17: 8, 18: 9, 85: 10,
      19: 11, 20: 12, 27: 13, 23: 14, 25: 15, 94: 16, 95: 17, 41: 18, 44: 19,
      47: 20, 50: 21, 52: 22, 54: 23, 86: 24, 63: 25, 66: 26, 88: 27, 68: 28,
      70: 29, 73: 30, 76: 31, 97: 32, 99: 33
    };
    
    let contador = 1;
    for (const municipio of municipiosAPI) {
      const idDepartamento = mapeoDeptos[municipio.departmentId];
      
      if (idDepartamento) {
        await sequelizeRemote.query(`
          INSERT INTO municipios_municipios (
            id_municipio, nombre_municipio, id_departamento_municipios, 
            codigo_dane, created_at, updated_at
          )
          VALUES (:id, :nombre, :dept_id, :codigo, NOW(), NOW())
          ON CONFLICT (id_municipio) DO UPDATE SET
            nombre_municipio = EXCLUDED.nombre_municipio,
            id_departamento_municipios = EXCLUDED.id_departamento_municipios,
            codigo_dane = EXCLUDED.codigo_dane,
            updated_at = NOW();
        `, {
          replacements: {
            id: contador,
            nombre: municipio.name,
            dept_id: idDepartamento,
            codigo: municipio.id.toString()
          }
        });
        
        contador++;
      }
    }
    
    console.log(`✅ ${contador - 1} municipios procesados exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Error procesando municipios:', error.message);
    return false;
  }
}

/**
 * Crear datos básicos de catálogos
 */
async function crearDatosBasicos() {
  try {
    console.log('\n📋 Creando datos básicos de catálogos...');
    
    // Crear parroquia por defecto
    await sequelizeRemote.query(`
      INSERT INTO parroquias_parroquias (nombre, id_municipio_municipios, created_at, updated_at)
      VALUES ('Parroquia Principal', 1, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    
    // Crear sector por defecto
    await sequelizeRemote.query(`
      INSERT INTO sectores_sectores (nombre, id_municipio_municipios, created_at, updated_at)
      VALUES ('Sector Central', 1, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    
    // Crear vereda por defecto
    await sequelizeRemote.query(`
      INSERT INTO veredas_veredas (nombre, id_municipio_municipios, created_at, updated_at)
      VALUES ('Vereda Principal', 1, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Datos básicos de catálogos creados');
    return true;
  } catch (error) {
    console.error('❌ Error creando datos básicos:', error.message);
    return false;
  }
}

/**
 * Función principal de migración
 */
async function ejecutarMigracion() {
  console.log('🚀 INICIANDO MIGRACIÓN A PRODUCCIÓN');
  console.log('=====================================\n');
  
  try {
    // 1. Verificar conexión
    const conexionOK = await verificarConexionRemota();
    if (!conexionOK) {
      throw new Error('No se pudo conectar a la base de datos remota');
    }
    
    // 2. Verificar estructura
    await verificarEstructuraTablas();
    
    // 3. Confirmar migración
    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará todos los datos geográficos existentes');
    console.log('¿Desea continuar? Presione Ctrl+C para cancelar o Enter para continuar...');
    
    // Esperar confirmación del usuario
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // 4. Limpiar datos existentes
    const limpiezaOK = await limpiarDatosGeograficos();
    if (!limpiezaOK) {
      throw new Error('Error en limpieza de datos');
    }
    
    // 5. Insertar departamentos
    const deptosOK = await insertarDepartamentos();
    if (!deptosOK) {
      throw new Error('Error insertando departamentos');
    }
    
    // 6. Procesar municipios
    const municOK = await procesarMunicipios();
    if (!municOK) {
      throw new Error('Error procesando municipios');
    }
    
    // 7. Crear datos básicos
    const basicosOK = await crearDatosBasicos();
    if (!basicosOK) {
      throw new Error('Error creando datos básicos');
    }
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('====================================');
    console.log('✅ Departamentos: 33 registros');
    console.log('✅ Municipios: ~1123 registros');
    console.log('✅ Datos básicos: Parroquia, Sector, Vereda');
    console.log('✅ Sistema geográfico optimizado aplicado');
    
  } catch (error) {
    console.error('\n❌ ERROR EN MIGRACIÓN:', error.message);
    console.error('🔄 Se recomienda revisar los logs y reintentar');
  } finally {
    await sequelizeRemote.close();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarMigracion();
}

export {
  verificarConexionRemota,
  verificarEstructuraTablas,
  insertarDepartamentos,
  procesarMunicipios,
  ejecutarMigracion
};
