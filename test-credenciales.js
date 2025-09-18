// Script para probar diferentes credenciales de usuario
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

// Diferentes combinaciones de credenciales para probar
const credenciales = [
  { correo_electronico: 'admin@parroquia.com', contrasena: 'Admin123!' },
  { correo_electronico: 'admin@parroquia.com', contrasena: 'admin123' },
  { correo_electronico: 'admin@parroquia.com', contrasena: 'password' },
  { correo_electronico: 'admin@admin.com', contrasena: 'Admin123!' },
  { correo_electronico: 'admin@admin.com', contrasena: 'admin123' },
  { correo_electronico: 'admin@admin.com', contrasena: 'password' },
  { correo_electronico: 'diego.garcia5105@yopmail.com', contrasena: 'Admin123!' },
  { correo_electronico: 'diego.garcia5105@yopmail.com', contrasena: 'admin123' },
  { correo_electronico: 'diego.garcia5105@yopmail.com', contrasena: 'password' }
];

async function probarCredenciales() {
  console.log('🔐 PROBANDO DIFERENTES CREDENCIALES DE USUARIO');
  console.log('='.repeat(50));
  
  for (let i = 0; i < credenciales.length; i++) {
    const cred = credenciales[i];
    console.log(`\n${i + 1}. Probando: ${cred.correo_electronico} / ${cred.contrasena}`);
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cred)
      });
      
      const result = await response.json();
      
      if (response.ok && (result.data?.accessToken || result.token)) {
        const token = result.data?.accessToken || result.token;
        console.log('✅ ¡LOGIN EXITOSO!');
        console.log(`📋 Token obtenido: ${token.substring(0, 50)}...`);
        console.log(`👤 Usuario: ${result.data?.user?.primer_nombre || result.user?.primer_nombre} ${result.data?.user?.primer_apellido || result.user?.primer_apellido}`);
        
        // Probar el token con endpoint de encuestas
        console.log('\n🔍 Probando token con endpoint de encuestas...');
        const encuestaResponse = await fetch(`${API_BASE}/encuesta?page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (encuestaResponse.ok) {
          const encuestaData = await encuestaResponse.json();
          console.log('✅ Token válido para encuestas');
          console.log(`📊 Encuestas encontradas: ${encuestaData.data?.length || 0}`);
        } else {
          console.log(`❌ Error con token en encuestas: ${encuestaResponse.status}`);
        }
        
        return token; // Retornar el token válido
      } else {
        console.log(`❌ Error: ${result.message || 'Login failed'}`);
      }
    } catch (error) {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
  }
  
  console.log('\n❌ No se encontraron credenciales válidas');
  return null;
}

probarCredenciales();