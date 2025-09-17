#!/usr/bin/env node

/**
 * Script para probar servicios específicos de la API
 * Uso: node test-specific-service.js [servicio]
 * Ejemplo: node test-specific-service.js auth
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(method, url, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json().catch(() => ({}));
    
    return {
      status: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function testAuth() {
  log('🔐 Probando servicios de autenticación...', 'cyan');
  
  // Test health first
  const health = await makeRequest('GET', `${API_URL}/health`);
  log(`Health check: ${health.ok ? '✅' : '❌'} (${health.status})`, health.ok ? 'green' : 'red');
  
  // Test login
  const loginData = {
    correo_electronico: 'admin@parroquia.com',
    contrasena: 'Admin123!'
  };
  
  const login = await makeRequest('POST', `${API_URL}/auth/login`, loginData);
  log(`Login: ${login.ok ? '✅' : '❌'} (${login.status})`, login.ok ? 'green' : 'red');
  
  if (login.ok && login.data.data?.accessToken) {
    const token = login.data.data.accessToken;
    log(`Token obtenido: ${token.substring(0, 20)}...`, 'green');
    
    // Test profile
    const profile = await makeRequest('GET', `${API_URL}/auth/profile`, null, token);
    log(`Profile: ${profile.ok ? '✅' : '❌'} (${profile.status})`, profile.ok ? 'green' : 'red');
    
    return token;
  } else {
    log('❌ No se pudo obtener token', 'red');
    if (login.data?.message) {
      log(`Error: ${login.data.message}`, 'yellow');
    }
    return null;
  }
}

async function testCatalog(token = null) {
  log('📚 Probando servicios de catálogos...', 'cyan');
  
  const endpoints = [
    'catalog/health',
    'catalog/tipos-identificacion',
    'catalog/departamentos',
    'catalog/municipios',
    'catalog/parroquias',
    'catalog/sectores',
    'catalog/veredas',
    'catalog/sexos',
    'catalog/enfermedades',
    'catalog/parentescos'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', `${API_URL}/${endpoint}`, null, token);
    const name = endpoint.split('/').pop();
    log(`${name}: ${result.ok ? '✅' : '❌'} (${result.status})`, result.ok ? 'green' : 'red');
    
    if (result.ok && result.data?.data) {
      const count = Array.isArray(result.data.data) ? result.data.data.length : 'N/A';
      log(`  📊 Items: ${count}`, 'blue');
    }
  }
}

async function testFamilias(token = null) {
  log('👨‍👩‍👧‍👦 Probando servicios de familias...', 'cyan');
  
  const endpoints = [
    'consultas/madres',
    'consultas/padres',
    'consultas/familias-padres-madres',
    'consultas/estadisticas',
    'familias', // consolidado
    'encuesta/familias' // si existe
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', `${API_URL}/${endpoint}`, null, token);
    const name = endpoint.replace('/', '-');
    log(`${name}: ${result.ok ? '✅' : '❌'} (${result.status})`, result.ok ? 'green' : 'red');
    
    if (!result.ok && result.data?.message) {
      log(`  Error: ${result.data.message}`, 'yellow');
    }
  }
}

async function testDifuntos(token = null) {
  log('💀 Probando servicios de difuntos...', 'cyan');
  
  const endpoints = [
    'difuntos/legacy/consultas/todos',
    'difuntos/legacy/estadisticas',
    'difuntos', // consolidado
    'difuntos/aniversarios',
    'difuntos/estadisticas'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', `${API_URL}/${endpoint}`, null, token);
    const name = endpoint.replace('/', '-');
    log(`${name}: ${result.ok ? '✅' : '❌'} (${result.status})`, result.ok ? 'green' : 'red');
  }
}

async function testUsers(token = null) {
  log('👥 Probando servicios de usuarios...', 'cyan');
  
  if (!token) {
    log('❌ Token requerido para probar usuarios', 'red');
    return;
  }
  
  const endpoints = [
    'users',
    'users/deleted'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', `${API_URL}/${endpoint}`, null, token);
    log(`${endpoint}: ${result.ok ? '✅' : '❌'} (${result.status})`, result.ok ? 'green' : 'red');
  }
}

async function testReportes(token = null) {
  log('📊 Probando servicios de reportes...', 'cyan');
  
  if (!token) {
    log('❌ Token requerido para probar reportes', 'red');
    return;
  }
  
  const endpoints = [
    'reportes/familias/excel',
    'reportes/personas/excel',
    'reportes/difuntos/excel',
    'reportes/demografico/pdf'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', `${API_URL}/${endpoint}`, null, token);
    log(`${endpoint}: ${result.ok ? '✅' : '❌'} (${result.status})`, result.ok ? 'green' : 'red');
  }
}

async function main() {
  const service = process.argv[2];
  
  log('🚀 Probador de servicios específicos', 'bold');
  log('=' .repeat(50), 'cyan');
  
  // Siempre intentar obtener token primero
  const token = await testAuth();
  
  if (!service) {
    log('\n📋 Servicios disponibles:', 'yellow');
    log('  - auth: Servicios de autenticación', 'blue');
    log('  - catalog: Catálogos y datos maestros', 'blue');
    log('  - familias: Consultas de familias', 'blue');
    log('  - difuntos: Servicios de difuntos', 'blue');
    log('  - users: Gestión de usuarios', 'blue');
    log('  - reportes: Generación de reportes', 'blue');
    log('  - all: Probar todos los servicios', 'blue');
    log('\nUso: node test-specific-service.js [servicio]', 'cyan');
    return;
  }
  
  log(`\n🎯 Probando servicio: ${service}`, 'magenta');
  
  switch (service.toLowerCase()) {
    case 'auth':
      // Ya se probó arriba
      break;
    case 'catalog':
      await testCatalog(token);
      break;
    case 'familias':
      await testFamilias(token);
      break;
    case 'difuntos':
      await testDifuntos(token);
      break;
    case 'users':
      await testUsers(token);
      break;
    case 'reportes':
      await testReportes(token);
      break;
    case 'all':
      await testCatalog(token);
      await testFamilias(token);
      await testDifuntos(token);
      await testUsers(token);
      await testReportes(token);
      break;
    default:
      log(`❌ Servicio '${service}' no reconocido`, 'red');
      break;
  }
  
  log('\n✅ Pruebas completadas', 'green');
}

main().catch(error => {
  log(`💥 Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});