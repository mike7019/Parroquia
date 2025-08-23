// Script para investigar la estructura real de la respuesta
import fetch from 'node-fetch';

async function investigateResponseStructure() {
  try {
    console.log('🔍 Investigando estructura real de la respuesta...\n');
    
    // Login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: "admin@parroquia.com",
        contrasena: "Admin123!"
      })
    });
    
    const loginResult = await loginResponse.json();
    const authToken = loginResult.data.accessToken;
    
    // Obtener sectores
    const sectorsResponse = await fetch('http://localhost:3000/api/catalog/sectors', {
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const sectorsResult = await sectorsResponse.json();
    
    console.log('📋 RESPUESTA COMPLETA:');
    console.log(JSON.stringify(sectorsResult, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

investigateResponseStructure();
