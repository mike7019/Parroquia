import axios from 'axios';

async function testEndpointStep() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🔍 Iniciando test paso a paso...');
    
    // 1. Login para obtener token
    console.log('\n1️⃣ Haciendo login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      correo_electronico: 'diego.gahhrcsdia5105@yopmail.com',
      contrasena: 'Fuerte789&'
    });
    
    console.log('✅ Login exitoso');
    const token = loginResponse.data.data.accessToken;
    console.log('🔑 Token obtenido (length):', token.length);
    console.log('🔑 Token (primeros 100 chars):', token.substring(0, 100));
    console.log('🔑 Token (últimos 20 chars):', token.substring(token.length - 20));
    
    // 2. Verificar que el token es válido haciendo una petición simple
    console.log('\n2️⃣ Probando token con /api/auth/profile...');
    
    try {
      const profileResponse = await axios.get(`${baseURL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Token válido - Profile response status:', profileResponse.status);
      console.log('👤 Profile user:', profileResponse.data.data.user.correo_electronico);
      
    } catch (profileError) {
      console.log('❌ Error con token en profile:', profileError.response?.status);
      console.log('Message:', profileError.response?.data?.message);
      return;
    }
    
    // 3. Ahora probar el endpoint de usuarios
    console.log('\n3️⃣ Probando endpoint GET /api/users/:id...');
    const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
    
    try {
      const userResponse = await axios.get(`${baseURL}/api/users/${testUUID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Endpoint getUserById exitoso!');
      console.log('📊 Status:', userResponse.status);
      console.log('📨 Response:');
      console.log(JSON.stringify(userResponse.data, null, 2));
      
      // Validar estructura de respuesta
      if (userResponse.data.status === 'success' && userResponse.data.data && userResponse.data.data.user) {
        const user = userResponse.data.data.user;
        console.log('\n✅ Análisis de la respuesta:');
        console.log('   📧 Email:', user.correo_electronico);
        console.log('   🔑 ID:', user.id);
        console.log('   ✅ Activo:', user.activo ? 'Sí' : 'No');
        console.log('   📅 Creado:', user.created_at);
        
        // Verificar campos sensibles
        const sensitiveFields = ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'];
        const exposedFields = sensitiveFields.filter(field => user[field] !== undefined);
        
        if (exposedFields.length > 0) {
          console.log('⚠️ Campos sensibles expuestos:', exposedFields);
        } else {
          console.log('✅ Campos sensibles correctamente filtrados');
        }
        
        console.log('\n📋 Todos los campos devueltos:');
        Object.keys(user).forEach(key => {
          console.log(`   • ${key}: ${typeof user[key]} = ${user[key]}`);
        });
      }
      
    } catch (userError) {
      console.log('❌ Error en endpoint getUserById:');
      console.log('   Status:', userError.response?.status);
      console.log('   Message:', userError.response?.data?.message);
      console.log('   Full error:', JSON.stringify(userError.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testEndpointStep().catch(console.error);
