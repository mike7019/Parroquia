/**
 * Test para verificar que el endpoint /api/users/deleted ya funciona correctamente
 */

import UserController from './src/controllers/userController.js';
import { Usuario } from './src/models/index.js';

console.log('🧪 Test /api/users/deleted authorization fix...\n');

async function testDeletedUsersEndpoint() {
  try {
    console.log('1. Buscando usuario administrador...');
    
    const adminUser = await Usuario.findOne({
      include: [{
        model: await import('./src/models/Role.js').then(m => m.default),
        as: 'roles',
        where: {
          nombre: 'Administrador'
        }
      }]
    });
    
    if (!adminUser) {
      console.log('   ❌ No hay usuarios con rol Administrador');
      console.log('   💡 Crear un usuario administrador para probar');
      return;
    }
    
    const adminRoles = await adminUser.getUserRoles();
    const primaryRole = adminRoles.length > 0 ? adminRoles[0] : 'Sin rol';
    
    console.log('   ✅ Usuario administrador encontrado:');
    console.log(`     📧 ${adminUser.correo_electronico}`);
    console.log(`     🎭 Rol: ${primaryRole}`);
    
    console.log('\n2. Simulando req.user object...');
    const mockUser = {
      id: adminUser.id,
      email: adminUser.correo_electronico,
      firstName: adminUser.primer_nombre,
      lastName: adminUser.primer_apellido,
      role: primaryRole,
      roles: adminRoles
    };
    
    console.log('   ', JSON.stringify(mockUser, null, 2));
    
    console.log('\n3. Simulando llamada al endpoint...');
    
    const mockReq = {
      user: mockUser
    };
    
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
    await UserController.getDeletedUsers(mockReq, mockRes, mockNext);
    
    console.log('   ✅ Controller getDeletedUsers ejecutado sin errores');
    console.log('   📊 Status code:', mockRes.statusCode);
    console.log('   📋 Usuarios eliminados encontrados:', mockRes.responseData.data.users.length);
    
    console.log('\n🎉 ¡SUCCESS! El endpoint /api/users/deleted ya funciona correctamente');
    console.log('✅ La corrección de roles (admin → Administrador) funcionó');
    
  } catch (error) {
    console.error('\n❌ ERROR encontrado:');
    console.error('   🔥 Message:', error.message);
    console.error('   🔥 Stack:', error.stack);
    
    if (error.message.includes('Only administrators can view deleted users')) {
      console.log('\n💡 El error de autorización AÚN persiste:');
      console.log('   - El usuario no tiene rol Administrador');
      console.log('   - Verificar que el usuario tenga el rol correcto en la BD');
    }
  }
}

testDeletedUsersEndpoint().then(() => {
  console.log('\n🏁 Test completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
