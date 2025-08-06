import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Usuario, Role } from './src/models/index.js';

async function testGetUserByUUIDAdvanced() {
  const testUUID = 'cd5938f7-2ec9-4f29-87df-5ecdb084e9f1';
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🔍 Iniciando prueba avanzada del endpoint getUserById...');
    console.log('UUID a probar:', testUUID);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 1. Verificar usuario en BD
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
    
    // 2. Obtener información de usuarios administradores disponibles
    console.log('\n2️⃣ Listando usuarios administradores disponibles...');
    const adminUsers = await Usuario.findAll({
      include: [{
        association: 'roles',
        where: { nombre: 'Administrador' },
        required: true
      }],
      where: { activo: true },
      limit: 3
    });
    
    if (adminUsers.length === 0) {
      console.log('❌ No se encontraron usuarios administradores activos');
      return;
    }
    
    console.log('👥 Usuarios administradores encontrados:');
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.correo_electronico} (ID: ${admin.id})`);
    });
    
    // 3. Generar token temporal para testing (SOLO PARA DESARROLLO)
    console.log('\n3️⃣ Generando token temporal para testing...');
    const adminUser = adminUsers[0];
    
    // Obtener la clave secreta del JWT desde variables de entorno o configuración
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Cambia esto
    
    const tokenPayload = {
      id: adminUser.id,
      email: adminUser.correo_electronico,
      role: 'Administrador',
      roles: adminUser.roles?.map(r => r.nombre) || ['Administrador']
    };
    
    const testToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Token temporal generado');
    
    // 4. Probar el endpoint GET /api/users/:id
    console.log('\n4️⃣ Probando endpoint GET /api/users/' + testUUID + '...');
    
    try {
      const response = await axios.get(`${baseURL}/api/users/${testUUID}`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Endpoint respondió exitosamente');
      console.log('📊 Status Code:', response.status);
      console.log('📨 Headers:', JSON.stringify(response.headers, null, 2));
      console.log('📨 Response Body:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Verificar estructura de la respuesta
      if (response.data.status === 'success' && response.data.data && response.data.data.user) {
        const user = response.data.data.user;
        console.log('\n✅ Análisis de la respuesta:');
        console.log('   📧 Email:', user.correo_electronico);
        console.log('   🔑 ID:', user.id);
        console.log('   ✅ Activo:', user.activo ? 'Sí' : 'No');
        console.log('   📅 Creado:', user.created_at);
        console.log('   🔄 Actualizado:', user.updated_at);
        
        // Verificar que no se exponen campos sensibles
        const sensitiveFields = ['contrasena', 'token_recuperacion', 'token_verificacion_email', 'token_expiracion'];
        const exposedSensitiveFields = sensitiveFields.filter(field => user[field] !== undefined);
        
        if (exposedSensitiveFields.length > 0) {
          console.log('⚠️ ADVERTENCIA: Campos sensibles expuestos:', exposedSensitiveFields);
        } else {
          console.log('✅ Campos sensibles correctamente excluidos');
        }
        
        // Verificar campos incluidos
        console.log('\n📊 Campos incluidos en la respuesta:');
        Object.keys(user).forEach(field => {
          console.log(`   • ${field}: ${typeof user[field]}`);
        });
        
      } else {
        console.log('❌ Estructura de respuesta incorrecta');
        console.log('Expected: { status: "success", data: { user: {...} } }');
      }
      
    } catch (apiError) {
      console.log('❌ Error en el endpoint:');
      console.log('   Status:', apiError.response?.status);
      console.log('   Status Text:', apiError.response?.statusText);
      
      if (apiError.response?.data) {
        console.log('   Response Body:', JSON.stringify(apiError.response.data, null, 2));
      }
      
      if (apiError.code) {
        console.log('   Error Code:', apiError.code);
      }
      
      console.log('   Error Message:', apiError.message);
    }
    
    // 5. Probar validación de UUID inválido
    console.log('\n5️⃣ Probando validación con UUID inválido...');
    const invalidUUID = 'invalid-uuid-format';
    
    try {
      await axios.get(`${baseURL}/api/users/${invalidUUID}`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('❌ ERROR: Debería haber fallado con UUID inválido');
    } catch (validationError) {
      if (validationError.response?.status === 400) {
        console.log('✅ Validación de UUID funcionando correctamente');
        console.log('   Status:', validationError.response.status);
        console.log('   Message:', JSON.stringify(validationError.response.data, null, 2));
      } else {
        console.log('⚠️ Error inesperado en validación:', validationError.response?.status);
      }
    }
    
    // 6. Probar UUID que no existe
    console.log('\n6️⃣ Probando con UUID inexistente...');
    const nonExistentUUID = '11111111-1111-1111-1111-111111111111';
    
    try {
      await axios.get(`${baseURL}/api/users/${nonExistentUUID}`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('❌ ERROR: Debería haber fallado con UUID inexistente');
    } catch (notFoundError) {
      if (notFoundError.response?.status === 404) {
        console.log('✅ Manejo de usuario no encontrado funcionando correctamente');
        console.log('   Status:', notFoundError.response.status);
        console.log('   Message:', JSON.stringify(notFoundError.response.data, null, 2));
      } else {
        console.log('⚠️ Error inesperado:', notFoundError.response?.status);
      }
    }
    
    // 7. Probar sin token de autorización
    console.log('\n7️⃣ Probando sin token de autorización...');
    
    try {
      await axios.get(`${baseURL}/api/users/${testUUID}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('❌ ERROR: Debería haber fallado sin token');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Control de autorización funcionando correctamente');
        console.log('   Status:', authError.response.status);
        console.log('   Message:', JSON.stringify(authError.response.data, null, 2));
      } else {
        console.log('⚠️ Error inesperado en autorización:', authError.response?.status);
      }
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
testGetUserByUUIDAdvanced().catch(console.error);
