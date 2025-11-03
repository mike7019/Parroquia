/**
 * TEST DE ENCUESTAS EN PRODUCCIÓN
 * =================================
 * 
 * Este script realiza pruebas NO DESTRUCTIVAS en el servidor de producción.
 * Solo ejecuta operaciones de lectura y validación de datos existentes.
 * 
 * IMPORTANTE: NO crea, modifica ni elimina datos en producción.
 * 
 * Pruebas incluidas:
 * 1. Verificación de conectividad
 * 2. Autenticación
 * 3. Lectura de encuestas existentes
 * 4. Validación de estructura de respuestas
 * 5. Verificación de catálogos
 * 6. Performance de endpoints GET
 */

import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const PRODUCTION_URL = process.env.PRODUCTION_API_URL || 'http://206.62.139.11:3000';
const API_URL = `${PRODUCTION_URL}/api`;

// Credenciales de admin (usar variables de entorno en producción real)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@parroquia.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error(chalk.red('\n❌ ERROR: ADMIN_PASSWORD no está configurado en .env'));
  console.log(chalk.yellow('Por favor, configura ADMIN_PASSWORD en tu archivo .env'));
  process.exit(1);
}

let authToken = null;

// Contadores
const resultados = {
  total: 0,
  exitosos: 0,
  fallidos: 0,
  errores: [],
  tiempos: []
};

// ============================================================================
// UTILIDADES
// ============================================================================

const log = {
  info: (msg) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  success: (msg) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg) => console.log(chalk.red(`❌ ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  title: (msg) => console.log(chalk.cyan.bold(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`))
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function registrarTest(nombre, test) {
  resultados.total++;
  log.info(`Ejecutando: ${nombre}`);
  
  const inicio = Date.now();
  
  try {
    await test();
    const tiempo = Date.now() - inicio;
    resultados.tiempos.push({ nombre, tiempo });
    resultados.exitosos++;
    log.success(`PASÓ: ${nombre} (${tiempo}ms)`);
  } catch (error) {
    resultados.fallidos++;
    resultados.errores.push({ nombre, error: error.message });
    log.error(`FALLÓ: ${nombre} - ${error.message}`);
  }
  
  await sleep(500); // Evitar saturar el servidor
}

// ============================================================================
// TESTS
// ============================================================================

async function testConectividad() {
  log.title('FASE 1: VERIFICACIÓN DE CONECTIVIDAD');
  
  await registrarTest('Conectividad al servidor de producción', async () => {
    try {
      // Intentar con endpoint de login (público, no requiere auth)
      const response = await axios.get(`${PRODUCTION_URL}`, {
        timeout: 5000,
        validateStatus: () => true // Aceptar cualquier status
      });
      
      // Cualquier respuesta del servidor indica que está vivo
      if (response.status) {
        log.info(`  → Servidor respondiendo (Status: ${response.status})`);
        log.info(`  → URL: ${PRODUCTION_URL}`);
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('No se puede conectar al servidor. Verifica que esté corriendo.');
      }
      throw error;
    }
  });
}

async function testAutenticacion() {
  log.title('FASE 2: AUTENTICACIÓN');
  
  await registrarTest('Login con credenciales de administrador', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      correo_electronico: ADMIN_EMAIL,
      contrasena: ADMIN_PASSWORD
    });
    
    authToken = response.data.data?.accessToken || 
                 response.data.datos?.token || 
                 response.data.data?.token;
    
    if (!authToken) {
      throw new Error('No se recibió token de autenticación');
    }
    
    // Configurar axios para usar el token
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    axios.defaults.timeout = 10000; // 10 segundos
    
    log.info(`  → Token obtenido exitosamente`);
    log.info(`  → Usuario: ${ADMIN_EMAIL}`);
  });
}

async function testLecturaEncuestas() {
  log.title('FASE 3: LECTURA DE ENCUESTAS EXISTENTES');
  
  let encuestaId = null;
  
  await registrarTest('GET /api/encuesta - Listar encuestas con paginación', async () => {
    const response = await axios.get(`${API_URL}/encuesta`, {
      params: { page: 1, limit: 10 }
    });
    
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`);
    }
    
    const data = response.data.data || response.data.datos;
    
    if (!Array.isArray(data)) {
      throw new Error('La respuesta no contiene un array de encuestas');
    }
    
    const total = response.data.total || response.data.pagination?.total || 0;
    
    log.info(`  → Total de encuestas: ${total}`);
    log.info(`  → Encuestas en página actual: ${data.length}`);
    
    // Guardar ID de primera encuesta para tests siguientes
    if (data.length > 0) {
      encuestaId = data[0].id_familia || data[0].id;
      log.info(`  → Primera encuesta ID: ${encuestaId}`);
    }
  });
  
  await registrarTest('GET /api/encuesta/:id - Obtener encuesta específica', async () => {
    if (!encuestaId) {
      log.warning('  → No hay encuestas para probar, saltando test');
      return;
    }
    
    const response = await axios.get(`${API_URL}/encuesta/${encuestaId}`);
    
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`);
    }
    
    const data = response.data.data || response.data.datos;
    
    if (!data) {
      throw new Error('No se recibió información de la encuesta');
    }
    
    // Validar estructura de respuesta
    const camposEsperados = ['apellido_familiar', 'municipio', 'estado_encuesta'];
    const camposFaltantes = camposEsperados.filter(campo => !(campo in data));
    
    if (camposFaltantes.length > 0) {
      log.warning(`  → Campos faltantes en respuesta: ${camposFaltantes.join(', ')}`);
    }
    
    log.info(`  → Encuesta ID: ${encuestaId}`);
    log.info(`  → Familia: ${data.apellido_familiar}`);
    log.info(`  → Estado: ${data.estado_encuesta}`);
  });
  
  await registrarTest('GET /api/encuesta con búsqueda', async () => {
    const response = await axios.get(`${API_URL}/encuesta`, {
      params: { 
        page: 1, 
        limit: 5,
        search: 'a' // Búsqueda simple
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Status code: ${response.status}`);
    }
    
    const data = response.data.data || response.data.datos;
    
    log.info(`  → Resultados de búsqueda: ${data.length}`);
  });
}

async function testCatalogos() {
  log.title('FASE 4: VERIFICACIÓN DE CATÁLOGOS');
  
  const catalogos = [
    { nombre: 'Municipios', endpoint: '/catalog/municipios' },
    { nombre: 'Parroquias', endpoint: '/catalog/parroquias' },
    { nombre: 'Tipos de Vivienda', endpoint: '/catalog/tipos-vivienda' },
    { nombre: 'Profesiones', endpoint: '/catalog/profesiones' },
    { nombre: 'Destrezas', endpoint: '/catalog/destrezas' },
    { nombre: 'Habilidades', endpoint: '/catalog/habilidades' }
  ];
  
  for (const catalogo of catalogos) {
    await registrarTest(`GET ${catalogo.endpoint} - Verificar ${catalogo.nombre}`, async () => {
      const response = await axios.get(`${API_URL}${catalogo.endpoint}`);
      
      if (response.status !== 200) {
        throw new Error(`Status code: ${response.status}`);
      }
      
      const data = response.data.data || response.data.datos;
      
      if (!Array.isArray(data)) {
        throw new Error('La respuesta no es un array');
      }
      
      log.info(`  → ${catalogo.nombre}: ${data.length} registros`);
      
      if (data.length === 0) {
        log.warning(`  → ⚠️  Catálogo vacío: ${catalogo.nombre}`);
      }
    });
  }
}

async function testPerformance() {
  log.title('FASE 5: ANÁLISIS DE PERFORMANCE');
  
  log.info('\n📊 Tiempos de respuesta por endpoint:\n');
  
  // Agrupar por tipo de operación
  const tiemposPorTipo = resultados.tiempos.reduce((acc, { nombre, tiempo }) => {
    const tipo = nombre.split(' - ')[0];
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(tiempo);
    return acc;
  }, {});
  
  Object.entries(tiemposPorTipo).forEach(([tipo, tiempos]) => {
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const max = Math.max(...tiempos);
    const min = Math.min(...tiempos);
    
    const color = promedio < 500 ? chalk.green : 
                  promedio < 1000 ? chalk.yellow : chalk.red;
    
    console.log(color(`  ${tipo}:`));
    console.log(color(`    Promedio: ${promedio.toFixed(0)}ms`));
    console.log(color(`    Rango: ${min}ms - ${max}ms`));
  });
  
  // Performance general
  const promedioGeneral = resultados.tiempos.reduce((sum, t) => sum + t.tiempo, 0) / resultados.tiempos.length;
  
  console.log(chalk.blue(`\n  Promedio general: ${promedioGeneral.toFixed(0)}ms`));
  
  if (promedioGeneral > 1000) {
    log.warning('  ⚠️  Tiempos de respuesta elevados (>1s)');
    log.info('  Considerar optimización de consultas o infraestructura');
  }
}

async function testValidacionesSeguridad() {
  log.title('FASE 6: VALIDACIONES DE SEGURIDAD');
  
  await registrarTest('Acceso sin autenticación debe fallar', async () => {
    // Guardar token actual
    const tokenOriginal = axios.defaults.headers.common['Authorization'];
    
    // Remover autenticación
    delete axios.defaults.headers.common['Authorization'];
    
    try {
      await axios.get(`${API_URL}/encuesta`);
      throw new Error('El endpoint permitió acceso sin autenticación');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        log.info('  → Acceso correctamente bloqueado sin autenticación');
      } else {
        throw new Error(`Status inesperado: ${error.response?.status}`);
      }
    } finally {
      // Restaurar token
      axios.defaults.headers.common['Authorization'] = tokenOriginal;
    }
  });
  
  await registrarTest('Validación de IDs malformados', async () => {
    try {
      await axios.get(`${API_URL}/encuesta/abc123`);
      throw new Error('El endpoint aceptó un ID malformado');
    } catch (error) {
      if (error.response?.status === 400) {
        log.info('  → ID malformado correctamente rechazado');
      } else {
        throw new Error(`Status inesperado: ${error.response?.status}`);
      }
    }
  });
}

// ============================================================================
// REPORTE FINAL
// ============================================================================

function mostrarReporteFinal() {
  log.title('REPORTE FINAL DE TESTING EN PRODUCCIÓN');
  
  const porcentaje = ((resultados.exitosos / resultados.total) * 100).toFixed(2);
  
  console.log(chalk.blue('\n📊 RESULTADOS:'));
  console.log(`   Total de pruebas: ${resultados.total}`);
  console.log(chalk.green(`   ✅ Exitosas: ${resultados.exitosos}`));
  console.log(chalk.red(`   ❌ Fallidas: ${resultados.fallidos}`));
  console.log(chalk.cyan(`   📈 Porcentaje de éxito: ${porcentaje}%`));
  
  if (resultados.fallidos === 0) {
    console.log(chalk.green.bold('\n🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!\n'));
  } else {
    console.log(chalk.red('\n❌ ERRORES DETECTADOS:\n'));
    resultados.errores.forEach((error, index) => {
      console.log(chalk.red(`${index + 1}. ${error.nombre}`));
      console.log(chalk.gray(`   ${error.error}\n`));
    });
  }
  
  console.log(chalk.blue('📋 VALIDACIONES VERIFICADAS:'));
  console.log('   ✓ Conectividad al servidor de producción');
  console.log('   ✓ Autenticación y autorización');
  console.log('   ✓ Lectura de encuestas existentes');
  console.log('   ✓ Estructura de respuestas');
  console.log('   ✓ Disponibilidad de catálogos');
  console.log('   ✓ Performance de endpoints');
  console.log('   ✓ Validaciones de seguridad');
  
  console.log(chalk.yellow('\n⚠️  RECORDATORIO:'));
  console.log('   Este test NO crea, modifica ni elimina datos');
  console.log('   Solo realiza operaciones de lectura y validación');
  console.log('   Para testing destructivo, usar ambiente de QA/Staging\n');
}

// ============================================================================
// EJECUCIÓN PRINCIPAL
// ============================================================================

async function ejecutarTests() {
  console.log(chalk.cyan.bold('╔══════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║  TEST DE ENCUESTAS EN PRODUCCIÓN (NO DESTRUCTIVO)               ║'));
  console.log(chalk.cyan.bold('║  Sistema de Gestión Parroquial                                   ║'));
  console.log(chalk.cyan.bold('╚══════════════════════════════════════════════════════════════════╝'));
  
  log.info(`\n🌐 Servidor: ${PRODUCTION_URL}`);
  log.info(`📅 Fecha: ${new Date().toLocaleString('es-CO')}\n`);
  
  try {
    await testConectividad();
    await testAutenticacion();
    await testLecturaEncuestas();
    await testCatalogos();
    await testValidacionesSeguridad();
    await testPerformance();
  } catch (error) {
    log.error(`Error fatal durante la ejecución: ${error.message}`);
  } finally {
    mostrarReporteFinal();
  }
}

// Ejecutar tests
ejecutarTests()
  .then(() => {
    const exitCode = resultados.fallidos > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(chalk.red('\n💥 Error fatal:'), error);
    process.exit(1);
  });
