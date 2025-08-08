/**
 * Test para verificar que el endpoint /api/users ya no produce error User.createdAt
 */

import express from 'express';
import UserController from './src/controllers/userController.js';
import { Usuario } from './src/models/index.js';

console.log('🧪 Test API endpoint /api/users sin error User.createdAt...\n');

async function testUsersEndpoint() {
  try {
    console.log('1. Verificando conexión de modelos...');
    
    // Test directo del modelo
    const testUser = await Usuario.findOne({
      attributes: ['id', 'correo_electronico', 'primer_nombre'],
      order: [['created_at', 'DESC']]
    });
    
    if (testUser) {
      console.log('   ✅ Modelo Usuario funciona correctamente');
      console.log('   📧 Usuario encontrado:', testUser.correo_electronico);
    } else {
      console.log('   ℹ️  No hay usuarios en la base de datos');
    }
    
    console.log('\n2. Simulando llamada al controller...');
    
    // Crear mock request y response
    const mockReq = {};
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };
    
    const mockNext = function(error) {
      throw error;
    };
    
    // Llamar al controller
    await UserController.getAllUsers(mockReq, mockRes, mockNext);
    
    console.log('   ✅ Controller getAllUsers ejecutado sin errores');
    console.log('   📊 Status code:', mockRes.statusCode);
    console.log('   📋 Usuarios devueltos:', mockRes.responseData.data.users.length);
    
    if (mockRes.responseData.data.users.length > 0) {
      const firstUser = mockRes.responseData.data.users[0];
      console.log('   👤 Primer usuario:', {
        id: firstUser.id.substring(0, 8) + '...',
        email: firstUser.correo_electronico,
        name: `${firstUser.primer_nombre} ${firstUser.primer_apellido}`
      });
    }
    
    console.log('\n🎉 ¡SUCCESS! El endpoint /api/users ya NO produce error User.createdAt');
    console.log('✅ La corrección del authService.js funcionó correctamente');
    
  } catch (error) {
    console.error('\n❌ ERROR encontrado:');
    console.error('   🔥 Message:', error.message);
    console.error('   🔥 Stack:', error.stack);
    
    if (error.message.includes('User.createdAt')) {
      console.log('\n💡 El error User.createdAt AÚN persiste:');
      console.log('   - Revisar todos los lugares que usan order: [[createdAt]]');
      console.log('   - Cambiar a order: [[created_at]]');
    }
    
    if (error.message.includes('createdAt')) {
      console.log('\n💡 Error relacionado con createdAt:');
      console.log('   - Verificar configuración underscored: true en el modelo');
      console.log('   - Usar created_at en lugar de createdAt en queries');
    }
    
    process.exit(1);
  }
}

testUsersEndpoint().then(() => {
  console.log('\n🏁 Test completado exitosamente');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
