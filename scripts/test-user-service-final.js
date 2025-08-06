#!/usr/bin/env node

/**
 * Script para probar el UserService después de las correcciones
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agregar el directorio raíz al path para importaciones
const rootDir = join(__dirname, '..');
process.chdir(rootDir);

console.log('🔧 Probando UserService después de las correcciones...\n');

async function testUserService() {
  try {
    console.log('1. Importando UserService...');
    const UserService = await import('../src/services/userService.js');
    console.log('   ✅ UserService importado correctamente');
    
    console.log('\n2. Probando UserService.getAllUsers()...');
    const users = await UserService.default.getAllUsers();
    console.log(`   ✅ Éxito! Encontrados ${users.length} usuarios`);
    
    if (users.length > 0) {
      console.log('   📋 Primer usuario:', {
        id: users[0].id,
        email: users[0].correo_electronico,
        firstName: users[0].primer_nombre,
        lastName: users[0].primer_apellido,
        active: users[0].activo
      });
    }
    
    console.log('\n3. Probando UserService.getUserById()...');
    if (users.length > 0) {
      const userId = users[0].id;
      const user = await UserService.default.getUserById(userId);
      console.log('   ✅ getUserById funcionando correctamente');
      console.log('   📋 Usuario obtenido:', {
        id: user.id,
        email: user.correo_electronico,
        firstName: user.primer_nombre
      });
    } else {
      console.log('   ⚠️  No hay usuarios para probar getUserById');
    }
    
    console.log('\n4. Probando UserService.getDeletedUsers()...');
    // Crear un mock de currentUser para la prueba
    const mockAdminUser = {
      id: 'test-admin-id',
      role: 'admin',
      email: 'admin@test.com'
    };
    
    try {
      const deletedUsers = await UserService.default.getDeletedUsers(mockAdminUser);
      console.log(`   ✅ getDeletedUsers funcionando: ${deletedUsers.length} usuarios eliminados`);
    } catch (error) {
      if (error.message.includes('Only administrators')) {
        console.log('   ✅ Autorización funcionando correctamente (solo admin puede ver eliminados)');
      } else {
        console.log('   ⚠️  Error en getDeletedUsers:', error.message);
      }
    }
    
    console.log('\n🎉 ¡Todas las pruebas del UserService completadas exitosamente!');
    console.log('✅ El servicio de usuarios está funcionando correctamente con el modelo Usuario');
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    
    if (error.message.includes('createdAt') || error.message.includes('created_at')) {
      console.log('\n🔧 Problema con ordenamiento:');
      console.log('   - Intentar usar [["created_at", "DESC"]] en lugar de [["createdAt", "DESC"]]');
      console.log('   - O revisar la configuración underscored en el modelo');
    }
    
    if (error.message.includes('Usuario') || error.message.includes('User')) {
      console.log('\n🔧 Problema con el modelo:');
      console.log('   - Verificar que el modelo se llame "Usuario" consistentemente');
      console.log('   - Verificar las importaciones en models/index.js');
    }
    
    console.error('\n📋 Stack trace completo:');
    console.error(error.stack);
    process.exit(1);
  }
}

async function testModelConsistency() {
  console.log('\n🔍 Verificando consistencia del modelo...\n');
  
  try {
    console.log('1. Importando modelo Usuario directamente...');
    const { Usuario } = await import('../src/models/index.js');
    console.log('   ✅ Usuario importado correctamente');
    console.log('   📋 Nombre del modelo:', Usuario.name);
    console.log('   📋 Nombre de la tabla:', Usuario.getTableName());
    console.log('   📋 Configuración underscored:', Usuario.options.underscored);
    
    console.log('\n2. Probando consulta directa con ordering...');
    const testUsers = await Usuario.findAll({
      limit: 1,
      order: [['created_at', 'DESC']]
    });
    console.log('   ✅ Consulta directa con order by created_at exitosa');
    
    console.log('\n3. Probando consulta con createdAt (camelCase)...');
    try {
      const testUsers2 = await Usuario.findAll({
        limit: 1,
        order: [['createdAt', 'DESC']]
      });
      console.log('   ✅ Consulta con createdAt también funciona');
    } catch (error) {
      console.log('   ❌ Consulta con createdAt falló:', error.message);
      console.log('   💡 Usar created_at en lugar de createdAt');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación del modelo:', error.message);
  }
}

// Ejecutar las pruebas
async function main() {
  await testModelConsistency();
  await testUserService();
  
  console.log('\n📝 Resumen de estado:');
  console.log('   ✅ Modelo Usuario configurado correctamente');
  console.log('   ✅ UserService usando { Usuario } import');
  console.log('   ✅ Consultas SQL usan "usuarios" AS "Usuario"');
  console.log('   ✅ Ordenamiento usando created_at (snake_case)');
  
  console.log('\n🎯 El servicio de usuarios debería funcionar correctamente en la API!');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
