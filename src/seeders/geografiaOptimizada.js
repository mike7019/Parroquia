/**
 * SISTEMA DE PERSISTENCIA GEOGRÁFICA OPTIMIZADA
 * 
 * Este módulo gestiona los datos geográficos de Colombia con:
 * - IDs secuenciales propios (1, 2, 3, ...)
 * - Fallbacks robustos si la API externa falla
 * - Cache local de datos geográficos
 * - Mapping consistente entre API externa y nuestra BD
 */

import { sequelize } from '../models/index.js';
import fs from 'fs/promises';
import path from 'path';

// Cache de datos geográficos locales
const CACHE_DIR = './cache/geografia';
const DEPARTAMENTOS_CACHE = path.join(CACHE_DIR, 'departamentos.json');
const MUNICIPIOS_CACHE = path.join(CACHE_DIR, 'municipios.json');

/**
 * Datos de respaldo completos de departamentos con IDs secuenciales
 * Estos datos se usan si la API externa falla
 */
const DEPARTAMENTOS_FALLBACK = [
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
 * Municipios principales de respaldo para cada departamento importante
 */
const MUNICIPIOS_FALLBACK = [
  // Antioquia (id_departamento: 2)
  { id_municipio: 1, nombre_municipio: 'Medellín', codigo_dane: '05001', id_departamento: 2 },
  { id_municipio: 2, nombre_municipio: 'Bello', codigo_dane: '05088', id_departamento: 2 },
  { id_municipio: 3, nombre_municipio: 'Itagüí', codigo_dane: '05360', id_departamento: 2 },
  { id_municipio: 4, nombre_municipio: 'Envigado', codigo_dane: '05266', id_departamento: 2 },
  { id_municipio: 5, nombre_municipio: 'Rionegro', codigo_dane: '05615', id_departamento: 2 },
  
  // Bogotá D.C. (id_departamento: 5)
  { id_municipio: 6, nombre_municipio: 'Bogotá D.C.', codigo_dane: '11001', id_departamento: 5 },
  
  // Cundinamarca (id_departamento: 15)
  { id_municipio: 7, nombre_municipio: 'Soacha', codigo_dane: '25754', id_departamento: 15 },
  { id_municipio: 8, nombre_municipio: 'Girardot', codigo_dane: '25307', id_departamento: 15 },
  { id_municipio: 9, nombre_municipio: 'Zipaquirá', codigo_dane: '25899', id_departamento: 15 },
  { id_municipio: 10, nombre_municipio: 'Facatativá', codigo_dane: '25269', id_departamento: 15 },
  
  // Valle del Cauca (id_departamento: 31)
  { id_municipio: 11, nombre_municipio: 'Cali', codigo_dane: '76001', id_departamento: 31 },
  { id_municipio: 12, nombre_municipio: 'Palmira', codigo_dane: '76520', id_departamento: 31 },
  { id_municipio: 13, nombre_municipio: 'Buenaventura', codigo_dane: '76109', id_departamento: 31 },
  { id_municipio: 14, nombre_municipio: 'Tulúa', codigo_dane: '76834', id_departamento: 31 },
  
  // Atlántico (id_departamento: 4)
  { id_municipio: 15, nombre_municipio: 'Barranquilla', codigo_dane: '08001', id_departamento: 4 },
  { id_municipio: 16, nombre_municipio: 'Soledad', codigo_dane: '08758', id_departamento: 4 },
  { id_municipio: 17, nombre_municipio: 'Malambo', codigo_dane: '08433', id_departamento: 4 },
  
  // Santander (id_departamento: 28)
  { id_municipio: 18, nombre_municipio: 'Bucaramanga', codigo_dane: '68001', id_departamento: 28 },
  { id_municipio: 19, nombre_municipio: 'Floridablanca', codigo_dane: '68276', id_departamento: 28 },
  { id_municipio: 20, nombre_municipio: 'Girón', codigo_dane: '68307', id_departamento: 28 }
];

/**
 * Mapping de códigos DANE oficiales
 */
const CODIGOS_DANE = {
  'Amazonas': '91', 'Antioquia': '05', 'Arauca': '81', 'Atlántico': '08',
  'Bogotá': '11', 'Bogotá D.C.': '11', 'Bolívar': '13', 'Boyacá': '15',
  'Caldas': '17', 'Caquetá': '18', 'Casanare': '85', 'Cauca': '19',
  'Cesar': '20', 'Chocó': '27', 'Córdoba': '23', 'Cundinamarca': '25',
  'Guainía': '94', 'Guaviare': '95', 'Huila': '41', 'La Guajira': '44',
  'Magdalena': '47', 'Meta': '50', 'Nariño': '52', 'Norte de Santander': '54',
  'Putumayo': '86', 'Quindío': '63', 'Risaralda': '66', 'San Andrés y Providencia': '88',
  'Santander': '68', 'Sucre': '70', 'Tolima': '73', 'Valle del Cauca': '76',
  'Vaupés': '97', 'Vichada': '99'
};

/**
 * Función para crear directorio de cache si no existe
 */
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.warn('⚠️ No se pudo crear directorio de cache:', error.message);
    }
  }
}

/**
 * Guardar datos en cache local
 */
async function saveToCache(filePath, data) {
  try {
    await ensureCacheDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`💾 Datos guardados en cache: ${filePath}`);
  } catch (error) {
    console.warn(`⚠️ No se pudieron guardar datos en cache ${filePath}:`, error.message);
  }
}

/**
 * Cargar datos desde cache local
 */
async function loadFromCache(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    console.log(`📁 Datos cargados desde cache: ${filePath}`);
    return JSON.parse(data);
  } catch (error) {
    console.log(`📁 No se encontró cache: ${filePath}`);
    return null;
  }
}

/**
 * Consultar API externa con timeout y retry
 */
async function fetchWithRetry(url, retries = 3, timeout = 30000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🌐 Intento ${i + 1}/${retries} - Consultando: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Parroquia-Management-System/2.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ API respondió exitosamente con ${data.length} elementos`);
      return data;
      
    } catch (error) {
      console.warn(`⚠️ Intento ${i + 1} falló:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s antes de retry
    }
  }
}

/**
 * Función segura para insertar datos con IDs secuenciales
 */
async function safeInsertWithIds(tableName, data, description) {
  try {
    // Verificar si ya existen datos
    const [existing] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    if (parseInt(existing[0].count) > 0) {
      console.log(`ℹ️ ${description}: datos ya existen, saltando inserción`);
      return { success: true, inserted: 0, message: 'Datos ya existen' };
    }

    if (!data || data.length === 0) {
      console.warn(`⚠️ ${description}: no hay datos para insertar`);
      return { success: false, inserted: 0, message: 'No hay datos' };
    }

    // Preparar datos con timestamps
    const dataWithTimestamps = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    // Construir query de inserción
    const columns = Object.keys(dataWithTimestamps[0]);
    const placeholders = dataWithTimestamps.map(() => 
      `(${columns.map(() => '?').join(', ')})`
    ).join(', ');
    
    const values = dataWithTimestamps.flatMap(item => columns.map(col => item[col]));
    
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
    
    await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.INSERT
    });

    console.log(`✅ ${description}: ${data.length} registros insertados exitosamente`);
    return { success: true, inserted: data.length, message: 'Insertados exitosamente' };

  } catch (error) {
    console.error(`❌ Error insertando ${description}:`, error.message);
    return { success: false, inserted: 0, message: error.message };
  }
}

/**
 * Seeder mejorado para departamentos con IDs secuenciales
 */
export async function seedDepartamentosOptimizado() {
  console.log('🏛️ Iniciando seeder optimizado de departamentos...');
  
  try {
    // Intentar cargar desde cache primero
    let departamentosData = await loadFromCache(DEPARTAMENTOS_CACHE);
    
    if (!departamentosData) {
      try {
        // Intentar API externa
        const departamentosAPI = await fetchWithRetry('https://api-colombia.com/api/v1/Department');
        
        if (Array.isArray(departamentosAPI) && departamentosAPI.length > 0) {
          // Procesar datos de API con IDs secuenciales
          departamentosData = departamentosAPI
            .map(dept => ({
              nombre: dept.name.trim(),
              codigo_dane: CODIGOS_DANE[dept.name] || '00'
            }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((dept, index) => ({
              id_departamento: index + 1,
              ...dept
            }));
          
          // Guardar en cache
          await saveToCache(DEPARTAMENTOS_CACHE, departamentosData);
          console.log(`📊 Procesados ${departamentosData.length} departamentos desde API externa`);
        } else {
          throw new Error('API devolvió datos inválidos');
        }
        
      } catch (apiError) {
        console.warn('⚠️ API externa falló:', apiError.message);
        departamentosData = DEPARTAMENTOS_FALLBACK;
        console.log('🔄 Usando datos de respaldo locales');
      }
    }

    // Insertar datos en BD
    const result = await safeInsertWithIds(
      'departamentos', 
      departamentosData, 
      'Departamentos de Colombia'
    );

    console.log(`📋 Resumen: ${departamentosData.length} departamentos, IDs del 1 al ${departamentosData.length}`);
    return result;

  } catch (error) {
    console.error('❌ Error en seeder de departamentos:', error.message);
    return { success: false, inserted: 0, message: error.message };
  }
}

/**
 * Seeder mejorado para municipios con IDs secuenciales
 */
export async function seedMunicipiosOptimizado() {
  console.log('🏘️ Iniciando seeder optimizado de municipios...');
  
  try {
    // Intentar cargar desde cache primero
    let municipiosData = await loadFromCache(MUNICIPIOS_CACHE);
    
    if (!municipiosData) {
      try {
        // Intentar API externa
        const [ciudadesAPI, departamentosAPI] = await Promise.all([
          fetchWithRetry('https://api-colombia.com/api/v1/City'),
          fetchWithRetry('https://api-colombia.com/api/v1/Department')
        ]);
        
        if (Array.isArray(ciudadesAPI) && Array.isArray(departamentosAPI)) {
          // Obtener departamentos de nuestra BD
          const [departamentosDB] = await sequelize.query(
            'SELECT id_departamento, nombre FROM departamentos ORDER BY nombre'
          );

          // Crear mapeo API -> BD
          const mapeoAPI = {};
          departamentosAPI.forEach(deptAPI => {
            const deptDB = departamentosDB.find(db => 
              db.nombre.toLowerCase().trim() === deptAPI.name.toLowerCase().trim()
            );
            if (deptDB) {
              mapeoAPI[deptAPI.id] = deptDB.id_departamento;
            }
          });

          // Procesar municipios con IDs secuenciales
          municipiosData = ciudadesAPI
            .filter(city => city.departmentId && city.name && mapeoAPI[city.departmentId])
            .map(city => ({
              nombre_municipio: city.name.trim(),
              codigo_dane: city.id ? city.id.toString().padStart(5, '0') : null,
              id_departamento: mapeoAPI[city.departmentId]
            }))
            .sort((a, b) => a.nombre_municipio.localeCompare(b.nombre_municipio))
            .map((municipio, index) => ({
              id_municipio: index + 1,
              ...municipio
            }));
          
          // Guardar en cache
          await saveToCache(MUNICIPIOS_CACHE, municipiosData);
          console.log(`📊 Procesados ${municipiosData.length} municipios desde API externa`);
        } else {
          throw new Error('API devolvió datos inválidos');
        }
        
      } catch (apiError) {
        console.warn('⚠️ API externa falló:', apiError.message);
        municipiosData = MUNICIPIOS_FALLBACK;
        console.log('🔄 Usando datos de respaldo locales');
      }
    }

    // Insertar datos en BD
    const result = await safeInsertWithIds(
      'municipios', 
      municipiosData, 
      'Municipios de Colombia'
    );

    console.log(`📋 Resumen: ${municipiosData.length} municipios, IDs del 1 al ${municipiosData.length}`);
    return result;

  } catch (error) {
    console.error('❌ Error en seeder de municipios:', error.message);
    return { success: false, inserted: 0, message: error.message };
  }
}

/**
 * Crear datos básicos de parroquia para pruebas
 */
export async function seedDatosBasicos() {
  console.log('⛪ Creando datos básicos de parroquia...');
  
  try {
    // Verificar si existen municipios
    const [municipios] = await sequelize.query(
      'SELECT id_municipio, nombre_municipio FROM municipios ORDER BY id_municipio LIMIT 10'
    );
    
    if (municipios.length === 0) {
      throw new Error('No existen municipios. Ejecutar seeders de municipios primero.');
    }

    console.log(`📍 Creando datos básicos para ${municipios.length} municipios principales`);

    // Crear parroquias básicas (una por municipio)
    // COMENTADO: Ya no se crean parroquias automáticamente - se gestionan manualmente via API
    /*
    const parroquiasData = municipios.map((municipio, index) => ({
      id_parroquia: index + 1,
      nombre: `Parroquia Central ${municipio.nombre_municipio}`,
      id_municipio: municipio.id_municipio
    }));
    */

    // Crear sectores básicos (2 por municipio)
    const sectoresData = [];
    municipios.forEach((municipio, mIndex) => {
      sectoresData.push(
        {
          id_sector: (mIndex * 2) + 1,
          nombre: 'Sector Centro',
          id_municipio: municipio.id_municipio
        },
        {
          id_sector: (mIndex * 2) + 2,
          nombre: 'Sector Rural',
          id_municipio: municipio.id_municipio
        }
      );
    });

    // Crear veredas básicas (1 por municipio)
    const veredasData = municipios.map((municipio, index) => ({
      id_vereda: index + 1,
      nombre: `Vereda Central ${municipio.nombre_municipio}`,
      codigo_vereda: `V${(index + 1).toString().padStart(3, '0')}`,
      id_municipio_municipios: municipio.id_municipio
    }));

    // Insertar datos secuencialmente
    // console.log('📝 Insertando parroquias...');
    // const resultParroquias = await safeInsertWithIds('parroquias', parroquiasData, 'Parroquias básicas');
    console.log('⏭️  Saltando inserción automática de parroquias (se gestionan manualmente)');
    const resultParroquias = { insertedIds: [], totalInserted: 0 }; // Mock result para evitar errores
    
    console.log('📝 Insertando sectores...');
    const resultSectores = await safeInsertWithIds('sectores', sectoresData, 'Sectores básicos');
    
    console.log('📝 Insertando veredas...');
    const resultVeredas = await safeInsertWithIds('veredas', veredasData, 'Veredas básicas');

    const resultados = {
      parroquias: resultParroquias,
      sectores: resultSectores,
      veredas: resultVeredas
    };

    console.log('✅ Datos básicos de geografía completa creados exitosamente');
    console.log(`   - 0 parroquias (deshabilitado - gestión manual)`);
    console.log(`   - ${sectoresData.length} sectores`);
    console.log(`   - ${veredasData.length} veredas`);
    
    return { success: true, results: resultados };

  } catch (error) {
    console.error('❌ Error creando datos básicos:', error.message);
    return { success: false, message: error.message };
  }
}

/**
 * Función principal para ejecutar todos los seeders optimizados
 */
export async function runGeografiaSeeders() {
  console.log('🌍 Ejecutando seeders de geografía optimizados...');
  
  const resultados = {
    departamentos: null,
    municipios: null,
    datosBasicos: null
  };

  try {
    // Ejecutar en orden secuencial
    resultados.departamentos = await seedDepartamentosOptimizado();
    resultados.municipios = await seedMunicipiosOptimizado();
    resultados.datosBasicos = await seedDatosBasicos();

    // Resumen final
    const totalExitosos = Object.values(resultados).filter(r => r?.success).length;
    console.log(`\n📊 Resumen final de geografía:`);
    console.log(`  ✅ Exitosos: ${totalExitosos}/3 seeders`);
    console.log(`  🏛️ Departamentos: ${resultados.departamentos?.inserted || 0} registros`);
    console.log(`  🏘️ Municipios: ${resultados.municipios?.inserted || 0} registros`);
    console.log(`  ⛪ Datos básicos: ${resultados.datosBasicos?.success ? 'OK' : 'ERROR'}`);

    return resultados;

  } catch (error) {
    console.error('❌ Error ejecutando seeders de geografía:', error.message);
    return resultados;
  }
}

export default {
  seedDepartamentosOptimizado,
  seedMunicipiosOptimizado,
  seedDatosBasicos,
  runGeografiaSeeders
};
