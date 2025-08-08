import fetch from 'node-fetch';

async function testUserEndpoint() {
  const baseUrl = 'http://localhost:3000/api';
  const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
  
  try {
    console.log('🔍 Iniciando prueba del endpoint de usuario...');
    console.log('UUID a probar:', testUUID);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Login como administrador
    console.log('\n1️⃣ Iniciando sesión como administrador...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'diego.gahhrcsdia5105@yopmail.com',
        password: '12345678'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Login exitoso');
    console.log('Usuario:', loginData.data.user.correo_electronico);
    console.log('Rol:', loginData.data.user.role);
    
    // 2. Probar el endpoint con timeout
    console.log(`\n2️⃣ Probando GET /api/users/${testUUID}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
    try {
      const userResponse = await fetch(`${baseUrl}/users/${testUUID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.log('⏱️ TIMEOUT: El endpoint se quedó colgado después de 10 segundos');
        console.log('🔍 Esto confirma que hay un problema en el endpoint');
      } else {
        throw error;
      }
    }
    
    // 3. Probar un endpoint que sabemos que funciona
    console.log('\n3️⃣ Probando GET /api/users (endpoint que funciona)...');
    const usersResponse = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
