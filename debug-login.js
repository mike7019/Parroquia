// Script para depurar el login y verificar la respuesta
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function debugLogin() {
  console.log('🔍 Depurando respuesta del login...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });

    console.log('📊 Status del response:', response.status);
    console.log('📊 Headers del response:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('📊 Datos completos de la respuesta:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      if (data.token) {
        console.log('✅ Token encontrado:', data.token.substring(0, 20) + '...');
      } else if (data.accessToken) {
        console.log('✅ AccessToken encontrado:', data.accessToken.substring(0, 20) + '...');
      } else if (data.data && data.data.token) {
        console.log('✅ Token en data encontrado:', data.data.token.substring(0, 20) + '...');
      } else {
        console.log('❌ No se encontró token en la respuesta');
        console.log('📋 Claves disponibles:', Object.keys(data));
      }
    } else {
      console.log('❌ Login falló');
    }
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
  }
}

debugLogin();
