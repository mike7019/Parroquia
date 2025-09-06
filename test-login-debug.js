// Script para probar login y ver la respuesta completa
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🔐 Probando login...');
  
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

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response completa:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login exitoso');
      if (data.token) {
        console.log('✅ Token encontrado:', data.token.substring(0, 50) + '...');
        return data.token;
      } else if (data.accessToken) {
        console.log('✅ AccessToken encontrado:', data.accessToken.substring(0, 50) + '...');
        return data.accessToken;
      } else {
        console.log('❌ No se encontró token en la respuesta');
        return null;
      }
    } else {
      console.log('❌ Error en login');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

testLogin();
