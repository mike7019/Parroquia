import https from 'https';
import http from 'http';
import { URL } from 'url';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data)),
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    // Timeout
    if (options.timeout) {
      req.setTimeout(options.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    }
    
    req.end();
  });
}

async function testUserEndpoint() {
  const baseUrl = 'http://localhost:3000/api';
  const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
  
  try {
    console.log('🔍 Iniciando prueba del endpoint de usuario...');
    console.log('UUID a probar:', testUUID);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Login como administrador
    console.log('\n1️⃣ Iniciando sesión como administrador...');
    const loginResponse = await makeRequest(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_electronico: 'diego.gahhrcsdia5105@yopmail.com',
        contrasena: '12345678'
      }),
      timeout: 5000
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText} - ${errorText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Login exitoso');
    console.log('Usuario:', loginData.data.user.correo_electronico);
    console.log('Rol:', loginData.data.user.role);
    
    // 2. Probar el endpoint con timeout
    console.log(`\n2️⃣ Probando GET /api/users/${testUUID}...`);
    console.log('⏱️ Aplicando timeout de 10 segundos...');
    
    try {
      const userResponse = await makeRequest(`${baseUrl}/users/${testUUID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos
      });
      
      console.log('📊 Respuesta HTTP:', userResponse.status, userResponse.statusText);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ Usuario obtenido exitosamente:');
        console.log('Email:', userData.data.correo_electronico);
        console.log('Activo:', userData.data.activo);
        console.log('Rol:', userData.data.role);
      } else {
        const errorData = await userResponse.text();
        console.log('❌ Error en la respuesta:', errorData);
      }
      
    } catch (error) {
      if (error.message === 'Request timeout') {
        console.log('⏱️ TIMEOUT: El endpoint se quedó colgado después de 10 segundos');
        console.log('🔍 Esto confirma que hay un problema en el endpoint');
        
        // Vamos a mostrar las consultas que están ejecutándose
        console.log('\n🔍 El problema parece estar en la lógica del endpoint...');
        console.log('💡 Revisar el controlador de usuarios y el middleware de autorización');
        
      } else {
        throw error;
      }
    }
    
    // 3. Probar un endpoint que sabemos que funciona
    console.log('\n3️⃣ Probando GET /api/users (endpoint que funciona)...');
    const usersResponse = await makeRequest(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('📊 Respuesta HTTP:', usersResponse.status, usersResponse.statusText);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Lista de usuarios obtenida exitosamente');
      console.log('Cantidad de usuarios:', usersData.data.users.length);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Prueba completada');
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:');
    console.error('Mensaje:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testUserEndpoint().catch(console.error);
