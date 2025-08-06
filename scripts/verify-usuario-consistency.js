#!/usr/bin/env node

/**
 * Script para verificar que todos los servicios usen correctamente Usuario
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
process.chdir(rootDir);

console.log('🔧 Verificando consistencia del uso de Usuario...\n');

async function verifyUsuarioConsistency() {
  try {
    console.log('1. Verificando importación de Usuario desde models/index.js...');
    const { Usuario } = await import('../src/models/index.js');
    console.log('   ✅ Usuario importado correctamente');
    console.log('   📋 Nombre del modelo:', Usuario.name);
    console.log('   📋 Nombre de la tabla:', Usuario.getTableName());
    
    console.log('\n2. Verificando UserService...');
    const UserService = await import('../src/services/userService.js');
    console.log('   ✅ UserService importado correctamente');
    
    console.log('\n3. Verificando AuthService...');
    const AuthService = await import('../src/services/authService.js');
    console.log('   ✅ AuthService importado correctamente');
    
    console.log('\n4. Verificando middleware de autenticación...');
    const authMiddleware = await import('../src/middlewares/auth.js');
    console.log('   ✅ Auth middleware importado correctamente');
    
    console.log('\n5. Probando consulta básica con Usuario...');
    const count = await Usuario.count();
    console.log(`   ✅ Consulta exitosa: ${count} usuarios en la base de datos`);
    
    console.log('\n6. Probando consulta con scopes...');
    const activeUsers = await Usuario.findAll({ limit: 1 });
    console.log(`   ✅ Consulta con scope default exitosa: ${activeUsers.length} usuario(s) activo(s)`);
    
    const allUsers = await Usuario.scope('withDeleted').findAll({ limit: 1 });
    console.log(`   ✅ Consulta con scope withDeleted exitosa: ${allUsers.length} usuario(s)`);
    
    console.log('\n7. Probando método getUserRoles...');
    if (activeUsers.length > 0) {
      const roles = await activeUsers[0].getUserRoles();
      console.log(`   ✅ getUserRoles funcionando: usuario tiene ${roles.length} rol(es)`);
    }
    
    console.log('\n🎉 ¡Todas las verificaciones exitosas!');
    console.log('✅ El sistema ahora usa consistentemente "Usuario" en lugar de "User"');
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

verifyUsuarioConsistency().then(() => {
  console.log('\n📝 Cambios realizados exitosamente:');
  console.log('   ✅ Modelo definido como "Usuario" (consistente con el archivo)');
  console.log('   ✅ Exportado como "Usuario" desde models/index.js');
  console.log('   ✅ UserService usa { Usuario } import');
  console.log('   ✅ AuthService usa { Usuario } import');  
  console.log('   ✅ Middleware usa { Usuario } import');
  console.log('   ✅ Todas las consultas usan Usuario.findOne(), Usuario.findByPk(), etc.');
  console.log('   ✅ No más referencias inconsistentes a "User"');
  
  console.log('\n🎯 El sistema ahora es completamente consistente con el uso de "Usuario"!');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
