// Prueba simple de login para verificar credenciales
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testLogin() {
  console.log('🔐 Probando diferentes credenciales...');

  const credenciales = [
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'admin@parroquia.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin', password: 'admin' },
    { email: 'administrador@parroquia.com', password: 'password' }
  ];

  for (const creds of credenciales) {
    console.log(`\n🔑 Probando: ${creds.email} / ${creds.password}`);
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });

      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
      
      if (response.ok && data.token) {
        console.log(`✅ ¡LOGIN EXITOSO! Token obtenido`);
        return data.token;
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  return null;
}

testLogin().then(token => {
  if (token) {
    console.log('\n🎉 Token válido encontrado, continuando con prueba de parroquia...');
  } else {
    console.log('\n❌ No se pudo obtener token con ninguna credencial');
  }
});
