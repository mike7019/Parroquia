import axios from 'axios';
import { Usuario } from './src/models/index.js';

async function testGetUserByUUID() {
  const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
  const baseURL = 'http://localhost:3000'; // Cambia por tu URL base
  
  try {
    console.log('🔍 Iniciando prueba del endpoint getUserById...');
    console.log('UUID a probar:', testUUID);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Primero verificar que el usuario existe en la base de datos
    console.log('\n1️⃣ Verificando existencia del usuario en BD...');
    const userInDB = await Usuario.findByPk(testUUID, {
      include: [{
        association: 'roles',
        attributes: ['id', 'nombre']
      }],
      paranoid: false
    });
    
    if (userInDB) {
      console.log('✅ Usuario encontrado en BD:');
      console.log('   📧 Email:', userInDB.correo_electronico);
      console.log('   🔑 ID:', userInDB.id);
      console.log('   ✅ Activo:', userInDB.activo ? 'Sí' : 'No');
      console.log('   🗑️ Eliminado:', userInDB.deleted_at ? 'Sí (' + userInDB.deleted_at + ')' : 'No');
      console.log('   👥 Roles:', userInDB.roles?.map(r => r.nombre).join(', ') || 'Sin roles');
    } else {
      console.log('❌ Usuario NO encontrado en BD');
      return;
    }
    
    // 2. Obtener un token de autenticación válido usando credenciales conocidas
    console.log('\n2️⃣ Obteniendo token de autenticación...');
    
    let authToken = null;
    
    try {
      // Usar credenciales del usuario administrador conocido
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        correo_electronico: 'diego.gahhrcsdia5105@yopmail.com',
        contrasena: 'Fuerte789&'
      });
      
      authToken = loginResponse.data.data.accessToken;
      console.log('✅ Token obtenido exitosamente');
      console.log('👤 Autenticado como:', loginResponse.data.data.user.correo_electronico);
      console.log('👥 Rol:', loginResponse.data.data.user.roles?.join(', ') || 'No definido');
    } catch (loginError) {
      console.log('❌ Error obteniendo token:', loginError.response?.data?.message || loginError.message);
      console.log('🔧 Nota: Verificar credenciales de login');
      return;
    }
    
    // 3. Probar el endpoint GET /api/users/:id
    console.log('\n3️⃣ Probando endpoint GET /api/users/' + testUUID + '...');
    
    try {
      const response = await axios.get(`${baseURL}/api/users/${testUUID}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Endpoint respondió exitosamente');
      console.log('📊 Status Code:', response.status);
      console.log('📨 Response Body:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Verificar estructura de la respuesta
      if (response.data.status === 'success' && response.data.data && response.data.data.user) {
        const user = response.data.data.user;
        console.log('\n✅ Estructura de respuesta correcta:');
        console.log('   📧 Email:', user.correo_electronico);
        console.log('   🔑 ID:', user.id);
        console.log('   ✅ Activo:', user.activo ? 'Sí' : 'No');
        console.log('   📅 Creado:', user.created_at);
        
        // Verificar que no se exponen campos sensibles
        const sensitiveFields = ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'];
        const exposedSensitiveFields = sensitiveFields.filter(field => user[field] !== undefined);
        
        if (exposedSensitiveFields.length > 0) {
          console.log('⚠️ ADVERTENCIA: Campos sensibles expuestos:', exposedSensitiveFields);
        } else {
          console.log('✅ Campos sensibles correctamente excluidos');
        }
      } else {
        console.log('❌ Estructura de respuesta incorrecta');
      }
      
    } catch (apiError) {
      console.log('❌ Error en el endpoint:');
      console.log('   Status:', apiError.response?.status);
      console.log('   Status Text:', apiError.response?.statusText);
      console.log('   Response:', JSON.stringify(apiError.response?.data, null, 2));
      console.log('   Error:', apiError.message);
    }
    
    // 4. Probar con UUID inválido
    console.log('\n4️⃣ Probando con UUID inválido...');
    const invalidUUID = 'invalid-uuid-format';
    
    try {
      await axios.get(`${baseURL}/api/users/${invalidUUID}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Debería haber fallado con UUID inválido');
    } catch (validationError) {
      console.log('✅ Validación de UUID funcionando correctamente');
      console.log('   Status:', validationError.response?.status);
      console.log('   Message:', validationError.response?.data?.message);
    }
    
    // 5. Probar con UUID que no existe
    console.log('\n5️⃣ Probando con UUID que no existe...');
    const nonExistentUUID = '11111111-1111-1111-1111-111111111111';
    
    try {
      await axios.get(`${baseURL}/api/users/${nonExistentUUID}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Debería haber fallado con UUID inexistente');
    } catch (notFoundError) {
      console.log('✅ Manejo de usuario no encontrado funcionando correctamente');
      console.log('   Status:', notFoundError.response?.status);
      console.log('   Message:', notFoundError.response?.data?.message);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Pruebas del endpoint completadas');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar las pruebas
testGetUserByUUID().catch(console.error);
