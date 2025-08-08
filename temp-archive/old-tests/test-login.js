import axios from 'axios';

async function testLogin() {
  const baseURL = 'http://localhost:3000';
  
  const credentials = [
    { correo_electronico: 'diego.gahhrcsdia5105@yopmail.com', contrasena: 'Fuerte789&' },
    { correo_electronico: 'test.admin@yopmail.com', contrasena: 'Admin123!' },
    { correo_electronico: 'ana.test.short@yopmail.com', contrasena: 'Admin123!' }
  ];
  
  for (const cred of credentials) {
    console.log(`\n🔍 Probando login con: ${cred.correo_electronico}`);
    
    try {
      const response = await axios.post(`${baseURL}/api/auth/login`, cred, {
        timeout: 10000
      });
      
      console.log('✅ Login exitoso');
      console.log('📊 Status:', response.status);
      console.log('� Respuesta completa:', JSON.stringify(response.data, null, 2));
      console.log('�👤 Usuario:', response.data.data.user.correo_electronico);
      console.log('👥 Roles:', response.data.data.user.roles);
      console.log('🔑 Token recibido:', response.data.data.token ? 'Sí' : 'No');
      if (response.data.data.token) {
        console.log('🔑 Token (primeros 50 chars):', response.data.data.token.substring(0, 50) + '...');
      }
      break; // Si tiene éxito, no probar más
      
    } catch (error) {
      console.log('❌ Login falló');
      console.log('📊 Status:', error.response?.status);
      console.log('📨 Mensaje:', error.response?.data?.message || error.message);
      
      if (error.response?.data?.errors) {
        console.log('🔍 Errores detallados:', JSON.stringify(error.response.data.errors, null, 2));
      }
    }
  }
}

testLogin().catch(console.error);
