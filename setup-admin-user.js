#!/usr/bin/env node

/**
 * Script para verificar y crear usuario administrador
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

async function makeRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

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

async function checkServerHealth() {
  log('🔍 Verificando servidor...', 'cyan');
  
  const result = await makeRequest('GET', `${API_URL}/health`);
  
  if (result.ok) {
    log('✅ Servidor funcionando correctamente', 'green');
    return true;
  } else {
    log('❌ Servidor no responde correctamente', 'red');
    return false;
  }
}

async function tryLogin(email, password) {
  log(`🔐 Intentando login con: ${email}`, 'cyan');
  
  const loginData = { correo_electronico: email, contrasena: password };
  const result = await makeRequest('POST', `${API_URL}/auth/login`, loginData);
  
  if (result.ok && result.data.data?.accessToken) {
    log('✅ Login exitoso', 'green');
    log(`🔑 Token: ${result.data.data.accessToken.substring(0, 30)}...`, 'blue');
    return result.data.data.accessToken;
  } else {
    log(`❌ Login falló: ${result.data?.message || 'Error desconocido'}`, 'red');
    return null;
  }
}

async function createAdminUser(email, password, firstName = 'Admin', lastName = 'Sistema') {
  log(`👤 Creando usuario administrador: ${email}`, 'cyan');
  
  const registerData = {
    correo_electronico: email,
    contrasena: password,
    primer_nombre: firstName,
    primer_apellido: lastName,
    rol: 'administrador'
  };
  
  const result = await makeRequest('POST', `${API_URL}/auth/register`, registerData);
  
  if (result.ok) {
    log('✅ Usuario administrador creado exitosamente', 'green');
    if (result.data.data?.accessToken) {
      log(`🔑 Token: ${result.data.data.accessToken.substring(0, 30)}...`, 'blue');
      return result.data.data.accessToken;
    }
    return true;
  } else {
    log(`❌ Error creando usuario: ${result.data?.message || 'Error desconocido'}`, 'red');
    if (result.data?.errors) {
      result.data.errors.forEach(error => {
        log(`   - ${error.msg || error.message}`, 'yellow');
      });
    }
    return null;
  }
}

async function testWithToken(token) {
  log('🧪 Probando endpoints con token...', 'cyan');
  
  const endpoints = [
    { name: 'Profile', url: `${API_URL}/auth/profile` },
    { name: 'Users List', url: `${API_URL}/users` },
    { name: 'Departamentos', url: `${API_URL}/catalog/departamentos` }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint.url, null);
    result.headers = { 'Authorization': `Bearer ${token}` };
    
    const testResult = await fetch(endpoint.url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    const status = testResult.ok ? '✅' : '❌';
    log(`   ${endpoint.name}: ${status} (${testResult.status})`, testResult.ok ? 'green' : 'red');
  }
}

async function main() {
  log('🚀 Configurador de Usuario Administrador', 'bold');
  log('=' .repeat(50), 'cyan');
  
  // 1. Verificar servidor
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    log('\n💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev', 'yellow');
    process.exit(1);
  }
  
  // 2. Credenciales a probar
  const credentials = [
    { email: 'admin@parroquia.com', password: 'Admin123!' },
    { email: 'admin@parroquia.com', password: 'admin123' },
    { email: 'administrador@parroquia.com', password: 'Admin123!' }
  ];
  
  let token = null;
  
  // 3. Intentar login con credenciales existentes
  log('\n🔐 Probando credenciales existentes...', 'magenta');
  for (const cred of credentials) {
    token = await tryLogin(cred.email, cred.password);
    if (token) break;
  }
  
  // 4. Si no hay login exitoso, crear usuario
  if (!token) {
    log('\n👤 No se pudo hacer login, creando usuario administrador...', 'magenta');
    token = await createAdminUser('admin@parroquia.com', 'Admin123!');
  }
  
  // 5. Probar funcionalidad con token
  if (token) {
    log('\n🧪 Probando funcionalidad con token obtenido...', 'magenta');
    await testWithToken(token);
    
    log('\n✅ Configuración completada exitosamente!', 'green');
    log('\n📋 Credenciales de acceso:', 'blue');
    log('   Email: admin@parroquia.com', 'cyan');
    log('   Password: Admin123!', 'cyan');
    log(`   Token: ${token.substring(0, 30)}...`, 'cyan');
    
    log('\n🎯 Ahora puedes usar:', 'yellow');
    log('   node test-specific-service.js auth', 'blue');
    log('   node test-all-services.js', 'blue');
    
  } else {
    log('\n❌ No se pudo configurar usuario administrador', 'red');
    log('\n🔧 Posibles soluciones:', 'yellow');
    log('   1. Verificar que la base de datos esté funcionando', 'blue');
    log('   2. Ejecutar seeders: npm run db:seed:roles', 'blue');
    log('   3. Verificar configuración de JWT en .env', 'blue');
    log('   4. Revisar logs del servidor para más detalles', 'blue');
    process.exit(1);
  }
}

main().catch(error => {
  log(`💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});