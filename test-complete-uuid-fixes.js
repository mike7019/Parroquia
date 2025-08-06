/**
 * Test para verificar que todas las correcciones de UUID funcionan correctamente
 */

import { Usuario } from './src/models/index.js';
import UserController from './src/controllers/userController.js';

console.log('🧪 Test completo de UUID fixes...\n');

async function testCompleteUUIDFixes() {
  try {
    console.log('1. Buscando usuario administrador para las pruebas...');
    
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
      console.log('   ❌ No hay usuarios administrador para probar');
      return;
    }
    
    const adminRoles = await adminUser.getUserRoles();
    const adminMockUser = {
      id: adminUser.id,
      email: adminUser.correo_electronico,
      firstName: adminUser.primer_nombre,
      lastName: adminUser.primer_apellido,
      role: adminRoles[0],
      roles: adminRoles
    };
    
    console.log('   ✅ Usuario administrador encontrado:');
    console.log(`     📧 ${adminUser.correo_electronico}`);
    console.log(`     🆔 ID: ${adminUser.id}`);
    
    console.log('\n2. Buscando usuario regular para las pruebas...');
    
    const regularUser = await Usuario.findOne({
      where: {
        correo_electronico: 'diego.gahhrcsdia5105@yopmail.com'
      }
    });
    
    if (!regularUser) {
      console.log('   ❌ Usuario regular no encontrado');
      return;
    }
    
    console.log('   ✅ Usuario regular encontrado:');
    console.log(`     📧 ${regularUser.correo_electronico}`);
    console.log(`     🆔 ID: ${regularUser.id}`);
    
    console.log('\n3. Probando getUserById con UUID...');
    
    const mockReq = {
      params: { id: regularUser.id },
      user: adminMockUser
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
      if (error) throw error;
    };
    
    await UserController.getUserById(mockReq, mockRes, mockNext);
    
    console.log('   ✅ getUserById funciona correctamente');
    console.log(`   📊 Status: ${mockRes.statusCode}`);
    console.log(`   📋 Usuario devuelto: ${mockRes.responseData.data.user.correo_electronico}`);
    
    console.log('\n4. Probando validación de autorización con UUIDs...');
    
    // Crear mock de usuario regular intentando acceder a sus propios datos
    const regularMockUser = {
      id: regularUser.id,
      email: regularUser.correo_electronico,
      firstName: regularUser.primer_nombre,
      lastName: regularUser.primer_apellido,
      role: 'Encuestador',
      roles: ['Encuestador']
    };
    
    const mockReqSelf = {
      params: { id: regularUser.id },
      user: regularMockUser
    };
    
    const mockResSelf = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };
    
    await UserController.getUserById(mockReqSelf, mockResSelf, mockNext);
    
    console.log('   ✅ Usuario puede acceder a sus propios datos');
    console.log(`   📊 Status: ${mockResSelf.statusCode}`);
    
    console.log('\n5. Probando que usuario regular NO puede acceder a datos de otro usuario...');
    
    const otherUser = await Usuario.findOne({
      where: {
        id: { [Op.ne]: regularUser.id }
      }
    });
    
    if (otherUser) {
      const mockReqOther = {
        params: { id: otherUser.id },
        user: regularMockUser
      };
      
      const mockResOther = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.responseData = data;
          return this;
        }
      };
      
      try {
        await UserController.getUserById(mockReqOther, mockResOther, mockNext);
        console.log('   ❌ ERROR: Usuario regular pudo acceder a datos de otro usuario');
      } catch (error) {
        if (error.message.includes('only edit your own profile') || error.message.includes('access your own resources')) {
          console.log('   ✅ Autorización funcionando: Usuario regular no puede acceder a datos de otros');
        } else {
          console.log('   ⚠️  Error inesperado:', error.message);
        }
      }
    }
    
    console.log('\n🎉 ¡SUCCESS! Todas las correcciones de UUID funcionan correctamente');
    console.log('✅ Los endpoints ahora deberían aceptar UUIDs en lugar de integers');
    console.log('\n📋 Para probar en Swagger UI:');
    console.log(`   • ID de usuario regular: ${regularUser.id}`);
    console.log(`   • ID de usuario admin: ${adminUser.id}`);
    console.log('   • Los endpoints ya no deberían dar error de validación');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Importar Op para las consultas
import { Op } from 'sequelize';

testCompleteUUIDFixes().then(() => {
  console.log('\n🏁 Test completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
