#!/usr/bin/env node

/**
 * Script simple para probar las correcciones
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

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

// Obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data.accessToken;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function testEndpoint(name, method, url, token = null, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data && method === 'POST') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const status = response.ok ? '✅' : '❌';
    log(`${name}: ${status} (${response.status})`, response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message) {
        log(`   Error: ${errorData.message}`, 'yellow');
      }
    }
    
    return response.ok;
    
  } catch (error) {
    log(`${name}: ❌ (Error: ${error.message})`, 'red');
    return false;
  }
}

async function main() {
  log('🧪 Probando correcciones aplicadas', 'bold');
  log('=' .repeat(40), 'cyan');
  
  // Obtener token
  log('🔐 Obteniendo token de autenticación...', 'cyan');
  const token = await getAuthToken();
  
  if (!token) {
    log('❌ No se pudo obtener token', 'red');
    return;
  }
  
  log('✅ Token obtenido correctamente', 'green');
  
  // Probar endpoints que estaban fallando
  log('\n🔍 Probando endpoints corregidos:', 'magenta');
  
  const results = [];
  
  // 1. Endpoint /refresh
  results.push(await testEndpoint(
    'Auth Refresh', 
    'POST', 
    `${API_URL}/auth/refresh`, 
    null, 
    { refreshToken: token }
  ));
  
  // 2. Estadísticas
  results.push(await testEndpoint(
    'Estadísticas', 
    'GET', 
    `${API_URL}/consultas/estadisticas`, 
    token
  ));
  
  // 3. Madres fallecidas
  results.push(await testEndpoint(
    'Madres Fallecidas', 
    'GET', 
    `${API_URL}/consultas/madres-fallecidas`, 
    token
  ));
  
  // 4. Padres fallecidos
  results.push(await testEndpoint(
    'Padres Fallecidos', 
    'GET', 
    `${API_URL}/consultas/padres-fallecidos`, 
    token
  ));
  
  // 5. Difuntos aniversarios
  results.push(await testEndpoint(
    'Difuntos Aniversarios', 
    'GET', 
    `${API_URL}/difuntos/aniversarios`, 
    token
  ));
  
  // 6. Encuestas familias (problema específico)
  results.push(await testEndpoint(
    'Encuestas Familias', 
    'GET', 
    `${API_URL}/encuesta/familias`, 
    token
  ));
  
  // Resumen
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log('\n📊 Resumen de correcciones:', 'bold');
  log(`✅ Endpoints corregidos: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  log(`📈 Tasa de éxito: ${((passed/total) * 100).toFixed(1)}%`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 ¡Todas las correcciones funcionan correctamente!', 'green');
  } else {
    log('\n⚠️  Algunos endpoints aún necesitan trabajo', 'yellow');
  }
}

main().catch(error => {
  log(`💥 Error: ${error.message}`, 'red');
  process.exit(1);
});