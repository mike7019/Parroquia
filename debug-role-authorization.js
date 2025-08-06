/**
 * Debug script para verificar los roles de usuario y el problema de autorización
 */

import { Usuario, Role } from './src/models/index.js';

console.log('🔍 Debugging role authorization issue...\n');

async function debugRoleAuthorization() {
  try {
    console.log('1. Verificando roles disponibles en la base de datos...');
    const roles = await Role.findAll();
    console.log('   📋 Roles encontrados:');
    roles.forEach(role => {
      console.log(`     - ID: ${role.id}, Nombre: "${role.nombre}"`);
    });
    
    console.log('\n2. Verificando usuarios y sus roles...');
    const users = await Usuario.findAll({
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'nombre']
      }],
      limit: 5
    });
    
    console.log('   👥 Usuarios y sus roles:');
    for (const user of users) {
      const userRoles = await user.getUserRoles();
      const primaryRole = userRoles.length > 0 ? userRoles[0] : 'Sin rol';
      
      console.log(`     📧 ${user.correo_electronico}:`);
      console.log(`        - Roles: [${userRoles.join(', ')}]`);
      console.log(`        - Rol principal: "${primaryRole}"`);
      console.log(`        - ¿Es admin?: ${primaryRole === 'admin' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`        - ¿Es Admin?: ${primaryRole === 'Admin' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`        - ¿Es administrador?: ${primaryRole === 'administrador' ? '✅ SÍ' : '❌ NO'}`);
      console.log(`        - ¿Es Administrador?: ${primaryRole === 'Administrador' ? '✅ SÍ' : '❌ NO'}`);
    }
    
    console.log('\n3. Verificando el primer usuario admin...');
    const adminUser = await Usuario.findOne({
      include: [{
        model: Role,
        as: 'roles',
        where: {
          nombre: ['admin', 'Admin', 'administrador', 'Administrador']
        }
      }]
    });
    
    if (adminUser) {
      const adminRoles = await adminUser.getUserRoles();
      const primaryRole = adminRoles.length > 0 ? adminRoles[0] : 'Sin rol';
      
      console.log('   👑 Usuario administrador encontrado:');
      console.log(`     📧 Email: ${adminUser.correo_electronico}`);
      console.log(`     👤 Nombre: ${adminUser.primer_nombre} ${adminUser.primer_apellido}`);
      console.log(`     🎭 Rol principal: "${primaryRole}"`);
      console.log(`     📋 Todos los roles: [${adminRoles.join(', ')}]`);
      
      console.log('\n4. Simulando verificación de autorización...');
      const mockCurrentUser = {
        id: adminUser.id,
        email: adminUser.correo_electronico,
        firstName: adminUser.primer_nombre,
        lastName: adminUser.primer_apellido,
        role: primaryRole,
        roles: adminRoles
      };
      
      console.log('   🧪 Mock user object:');
      console.log('     ', JSON.stringify(mockCurrentUser, null, 2));
      
      const isAuthorized = mockCurrentUser.role === 'admin';
      console.log(`   🔐 ¿Autorizado para ver usuarios eliminados? ${isAuthorized ? '✅ SÍ' : '❌ NO'}`);
      
      if (!isAuthorized) {
        console.log('\n💡 PROBLEMA IDENTIFICADO:');
        console.log(`   - El código busca role === 'admin'`);
        console.log(`   - Pero el rol actual es: "${primaryRole}"`);
        console.log('   - Posibles soluciones:');
        console.log('     1. Cambiar el rol en la BD a "admin"');
        console.log('     2. Modificar el código para aceptar el rol actual');
        console.log('     3. Usar roles array en lugar del rol principal');
      }
      
    } else {
      console.log('   ❌ No se encontró ningún usuario administrador');
      console.log('   💡 Crear un usuario con rol admin para probar');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante debug:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugRoleAuthorization().then(() => {
  console.log('\n🏁 Debug completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
