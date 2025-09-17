#!/usr/bin/env node

/**
 * Script completo para probar todos los servicios de la API Parroquia
 * Ejecutar: node test-all-services.js
 */

import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Resultados de las pruebas
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Token de autenticación (se obtendrá después del login)
let authToken = null;

/**
 * Función helper para hacer requests HTTP
 */
async function makeRequest(method, url, data = null, requireAuth = false) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (requireAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Función para log con colores
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Función para probar un endpoint
 */
async function testEndpoint(name, method, url, expectedStatus = 200, data = null, requireAuth = false) {
  log(`\n🔍 Testing: ${colors.bold}${method} ${url}${colors.reset}`, 'cyan');
  
  try {
    const result = await makeRequest(method, url, data, requireAuth);
    
    if (result.status === expectedStatus) {
      log(`✅ ${name}: PASSED (${result.status})`, 'green');
      testResults.passed++;
      
      // Mostrar datos de respuesta si es útil
      if (result.data && typeof result.data === 'object') {
        if (result.data.data && Array.isArray(result.data.data)) {
          log(`   📊 Returned ${result.data.data.length} items`, 'blue');
        } else if (result.data.message) {
          log(`   💬 ${result.data.message}`, 'blue');
        }
      }
      
      return result;
    } else {
      log(`❌ ${name}: FAILED (Expected ${expectedStatus}, got ${result.status})`, 'red');
      if (result.data && result.data.message) {
        log(`   💬 Error: ${result.data.message}`, 'yellow');
      }
      testResults.failed++;
      testResults.errors.push({
        name,
        method,
        url,
        expected: expectedStatus,
        actual: result.status,
        error: result.data
      });
      return result;
    }
  } catch (error) {
    log(`❌ ${name}: ERROR - ${error.message}`, 'red');
    testResults.failed++;
    testResults.errors.push({
      name,
      method,
      url,
      error: error.message
    });
    return null;
  }
}

/**
 * Función principal de testing
 */
async function runAllTests() {
  log('🚀 Iniciando pruebas completas de la API Parroquia', 'bold');
  log('=' .repeat(60), 'cyan');

  // 1. PRUEBAS DE SISTEMA (Sin autenticación)
  log('\n📋 1. PRUEBAS DE SISTEMA', 'magenta');
  await testEndpoint('Health Check', 'GET', `${API_URL}/health`);
  await testEndpoint('Status Check', 'GET', `${API_URL}/status`);
  await testEndpoint('CORS Test', 'GET', `${API_URL}/cors-test`);
  await testEndpoint('IP Test', 'GET', `${API_URL}/ip-test`);
  await testEndpoint('Swagger Docs', 'GET', `${BASE_URL}/api-docs`, 200);

  // 2. PRUEBAS DE CATÁLOGOS PÚBLICOS
  log('\n📚 2. CATÁLOGOS PÚBLICOS', 'magenta');
  await testEndpoint('Catalog Health', 'GET', `${API_URL}/catalog/health`);
  await testEndpoint('Tipos Identificación', 'GET', `${API_URL}/catalog/tipos-identificacion`);

  // 3. PRUEBAS DE AUTENTICACIÓN
  log('\n🔐 3. AUTENTICACIÓN', 'magenta');
  
  // Intentar login con credenciales de prueba
  const loginData = {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  };
  
  const loginResult = await testEndpoint(
    'Login Admin', 
    'POST', 
    `${API_URL}/auth/login`, 
    200, 
    loginData
  );

  // Si el login falla, intentar crear un usuario admin
  if (!loginResult || !loginResult.ok) {
    log('⚠️  Login falló, intentando crear usuario admin...', 'yellow');
    
    const registerData = {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!',
      primer_nombre: 'Admin',
      primer_apellido: 'Sistema',
      rol: 'administrador'
    };
    
    const registerResult = await testEndpoint(
      'Register Admin', 
      'POST', 
      `${API_URL}/auth/register`, 
      201, 
      registerData
    );
    
    if (registerResult && registerResult.ok && registerResult.data.data.accessToken) {
      authToken = registerResult.data.data.accessToken;
      log('✅ Usuario admin creado y token obtenido', 'green');
    }
  } else if (loginResult.data.data.accessToken) {
    authToken = loginResult.data.data.accessToken;
    log('✅ Token de autenticación obtenido', 'green');
  }

  // Probar otros endpoints de auth
  if (authToken) {
    await testEndpoint('Get Profile', 'GET', `${API_URL}/auth/profile`, 200, null, true);
    await testEndpoint('Refresh Token', 'POST', `${API_URL}/auth/refresh`, 200, null, true);
  }

  // 4. PRUEBAS DE CATÁLOGOS PROTEGIDOS
  if (authToken) {
    log('\n📚 4. CATÁLOGOS PROTEGIDOS', 'magenta');
    
    // Departamentos
    await testEndpoint('List Departamentos', 'GET', `${API_URL}/catalog/departamentos`, 200, null, true);
    await testEndpoint('Search Departamentos', 'GET', `${API_URL}/catalog/departamentos/search?q=antioquia`, 200, null, true);
    await testEndpoint('Stats Departamentos', 'GET', `${API_URL}/catalog/departamentos/statistics`, 200, null, true);
    
    // Municipios
    await testEndpoint('List Municipios', 'GET', `${API_URL}/catalog/municipios`, 200, null, true);
    await testEndpoint('Search Municipios', 'GET', `${API_URL}/catalog/municipios/search?q=medellin`, 200, null, true);
    await testEndpoint('Stats Municipios', 'GET', `${API_URL}/catalog/municipios/statistics`, 200, null, true);
    
    // Parroquias
    await testEndpoint('List Parroquias', 'GET', `${API_URL}/catalog/parroquias`, 200, null, true);
    await testEndpoint('Search Parroquias', 'GET', `${API_URL}/catalog/parroquias/search?q=san`, 200, null, true);
    
    // Sectores
    await testEndpoint('List Sectores', 'GET', `${API_URL}/catalog/sectores`, 200, null, true);
    
    // Veredas
    await testEndpoint('List Veredas', 'GET', `${API_URL}/catalog/veredas`, 200, null, true);
    
    // Sexos
    await testEndpoint('List Sexos', 'GET', `${API_URL}/catalog/sexos`, 200, null, true);
    
    // Enfermedades
    await testEndpoint('List Enfermedades', 'GET', `${API_URL}/catalog/enfermedades`, 200, null, true);
    
    // Aguas Residuales
    await testEndpoint('List Aguas Residuales', 'GET', `${API_URL}/catalog/aguas-residuales`, 200, null, true);
    
    // Parentescos
    await testEndpoint('List Parentescos', 'GET', `${API_URL}/catalog/parentescos`, 200, null, true);
    await testEndpoint('Stats Parentescos', 'GET', `${API_URL}/catalog/parentescos/stats`, 200, null, true);
    
    // Comunidades Culturales
    await testEndpoint('List Comunidades Culturales', 'GET', `${API_URL}/catalog/comunidades-culturales`, 200, null, true);
    await testEndpoint('Select Comunidades Culturales', 'GET', `${API_URL}/catalog/comunidades-culturales/select`, 200, null, true);
  }

  // 5. PRUEBAS DE GESTIÓN DE USUARIOS
  if (authToken) {
    log('\n👥 5. GESTIÓN DE USUARIOS', 'magenta');
    await testEndpoint('List Users', 'GET', `${API_URL}/users`, 200, null, true);
    await testEndpoint('List Deleted Users', 'GET', `${API_URL}/users/deleted`, 200, null, true);
  }

  // 6. PRUEBAS DE CONSULTAS DE FAMILIAS
  if (authToken) {
    log('\n👨‍👩‍👧‍👦 6. CONSULTAS DE FAMILIAS', 'magenta');
    await testEndpoint('Consulta Madres', 'GET', `${API_URL}/consultas/madres`, 200, null, true);
    await testEndpoint('Consulta Padres', 'GET', `${API_URL}/consultas/padres`, 200, null, true);
    await testEndpoint('Madres Fallecidas', 'GET', `${API_URL}/consultas/madres-fallecidas`, 200, null, true);
    await testEndpoint('Padres Fallecidos', 'GET', `${API_URL}/consultas/padres-fallecidos`, 200, null, true);
    await testEndpoint('Familias Padres-Madres', 'GET', `${API_URL}/consultas/familias-padres-madres`, 200, null, true);
    await testEndpoint('Estadísticas Consultas', 'GET', `${API_URL}/consultas/estadisticas`, 200, null, true);
  }

  // 7. PRUEBAS DE DIFUNTOS
  if (authToken) {
    log('\n💀 7. SERVICIOS DE DIFUNTOS', 'magenta');
    
    // Difuntos Legacy
    await testEndpoint('Difuntos Legacy - Madres', 'GET', `${API_URL}/difuntos/legacy/consultas/madres`, 200, null, true);
    await testEndpoint('Difuntos Legacy - Padres', 'GET', `${API_URL}/difuntos/legacy/consultas/padres`, 200, null, true);
    await testEndpoint('Difuntos Legacy - Todos', 'GET', `${API_URL}/difuntos/legacy/consultas/todos`, 200, null, true);
    await testEndpoint('Difuntos Legacy - Stats', 'GET', `${API_URL}/difuntos/legacy/estadisticas`, 200, null, true);
    
    // Difuntos Consolidado
    await testEndpoint('Difuntos Consolidado - List', 'GET', `${API_URL}/difuntos`, 200, null, true);
    await testEndpoint('Difuntos - Aniversarios', 'GET', `${API_URL}/difuntos/aniversarios`, 200, null, true);
    await testEndpoint('Difuntos - Estadísticas', 'GET', `${API_URL}/difuntos/estadisticas`, 200, null, true);
  }

  // 8. PRUEBAS DE ENDPOINTS PROBLEMÁTICOS
  log('\n⚠️  8. ENDPOINTS POTENCIALMENTE PROBLEMÁTICOS', 'magenta');
  
  // Estos endpoints pueden no existir o tener problemas
  if (authToken) {
    await testEndpoint('Encuestas (si existe)', 'GET', `${API_URL}/encuesta/familias`, 200, null, true);
    await testEndpoint('Reportes (si existe)', 'GET', `${API_URL}/reportes/familias/excel`, 200, null, true);
    await testEndpoint('Familias Consolidado', 'GET', `${API_URL}/familias`, 200, null, true);
    await testEndpoint('Personas Salud', 'GET', `${API_URL}/personas/salud`, 200, null, true);
    await testEndpoint('Personas Capacidades', 'GET', `${API_URL}/personas/capacidades`, 200, null, true);
    await testEndpoint('Parroquias Consolidado', 'GET', `${API_URL}/parroquias`, 200, null, true);
  }

  // RESUMEN FINAL
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE PRUEBAS', 'bold');
  log('='.repeat(60), 'cyan');
  
  const total = testResults.passed + testResults.failed;
  const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
  
  log(`✅ Pruebas exitosas: ${testResults.passed}`, 'green');
  log(`❌ Pruebas fallidas: ${testResults.failed}`, 'red');
  log(`📈 Tasa de éxito: ${successRate}%`, successRate > 80 ? 'green' : successRate > 60 ? 'yellow' : 'red');
  
  if (testResults.errors.length > 0) {
    log('\n🚨 ERRORES ENCONTRADOS:', 'red');
    testResults.errors.forEach((error, index) => {
      log(`\n${index + 1}. ${error.name}`, 'yellow');
      log(`   ${error.method} ${error.url}`, 'cyan');
      if (error.expected && error.actual) {
        log(`   Expected: ${error.expected}, Got: ${error.actual}`, 'red');
      }
      if (error.error) {
        if (typeof error.error === 'string') {
          log(`   Error: ${error.error}`, 'red');
        } else if (error.error.message) {
          log(`   Error: ${error.error.message}`, 'red');
        }
      }
    });
  }

  // Guardar resultados en archivo
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${successRate}%`
    },
    errors: testResults.errors,
    authToken: authToken ? 'Token obtenido correctamente' : 'No se pudo obtener token'
  };

  fs.writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
  log(`\n📄 Resultados guardados en: test-results.json`, 'blue');
  
  if (authToken) {
    log(`\n🔑 Token de autenticación obtenido: ${authToken.substring(0, 20)}...`, 'green');
    log('   Puedes usar este token para pruebas manuales con Postman/curl', 'blue');
  } else {
    log('\n⚠️  No se pudo obtener token de autenticación', 'yellow');
    log('   Verifica las credenciales o crea un usuario manualmente', 'yellow');
  }

  log('\n🎯 Pruebas completadas!', 'bold');
  
  // Exit code basado en resultados
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Ejecutar pruebas
runAllTests().catch(error => {
  log(`\n💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});