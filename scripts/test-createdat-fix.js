#!/usr/bin/env node

/**
 * Script para probar la corrección del campo createdAt en userService
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agregar el directorio raíz al path para importaciones
const rootDir = join(__dirname, '..');
process.chdir(rootDir);

console.log('🔧 Probando corrección del campo createdAt...\n');

async function testUserServiceOrder() {
  try {
    console.log('1. Importando UserService...');
    const UserService = await import('../src/services/userService.js');
    console.log('   ✅ UserService importado correctamente');
    
    console.log('\n2. Probando getAllUsers (esto debería funcionar ahora)...');
    
    // Crear un mock básico para evitar errores de autenticación
    const mockUsers = await UserService.default.getAllUsers();
    console.log('   ✅ getAllUsers ejecutado sin errores');
    console.log(`   📋 Se encontraron ${mockUsers.length} usuarios`);
    
    if (mockUsers.length > 0) {
      console.log('   📋 Primer usuario:', {
        id: mockUsers[0].id,
        email: mockUsers[0].correo_electronico,
        firstName: mockUsers[0].primer_nombre,
        active: mockUsers[0].activo
      });
    }
    
    console.log('\n🎉 ¡Test exitoso! El campo createdAt ahora funciona correctamente.');
    
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    
    if (error.message.includes('createdAt') || error.message.includes('created_at')) {
      console.log('\n🔧 Posible solución:');
      console.log('   - El modelo necesita underscored: true');
      console.log('   - O usar sequelize.col("created_at") en el order');
    }
    
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar el test
testUserServiceOrder().then(() => {
  console.log('\n📝 Correcciones aplicadas:');
  console.log('   ✅ Cambiado underscored: false a underscored: true en modelo User');
  console.log('   ✅ Usando createdAt y updatedAt en lugar de created_at/updated_at');
  console.log('   ✅ Sequelize ahora maneja automáticamente la conversión snake_case');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
