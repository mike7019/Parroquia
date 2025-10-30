/**
 * Test simple para ver la estructura completa de respuesta
 */

const API_BASE_URL = 'http://localhost:3000/api';

async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    })
  });

  const data = await response.json();
  return data.data?.accessToken || data.datos?.token || data.token;
}

async function verEstructuraCompleta() {
  console.log('🔐 Autenticando...');
  const token = await login();
  
  console.log('\n📥 Obteniendo encuesta 80...');
  const response = await fetch(`${API_BASE_URL}/encuesta/80`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const result = await response.json();
  
  console.log('\n📊 ESTRUCTURA COMPLETA DE RESPUESTA:');
  console.log('='.repeat(80));
  console.log(JSON.stringify(result, null, 2));
}

verEstructuraCompleta().catch(console.error);
