/**
 * Ver estructura completa de estadísticas
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

async function verEstructura() {
  const token = await login();
  
  const response = await fetch(`${API_BASE_URL}/estadisticas/salud`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const result = await response.json();
  
  console.log(JSON.stringify(result, null, 2));
}

verEstructura().catch(console.error);
