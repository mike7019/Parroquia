/**
 * Debug script para verificar exactamente qué está causando el error de User.createdAt
 */

import { Usuario } from './src/models/index.js';

console.log('🔍 Debugging User.createdAt error...\n');

async function debugCreatedAtError() {
  try {
    console.log('1. Verificando configuración del modelo Usuario...');
    console.log('   📋 Model name:', Usuario.name);
    console.log('   📋 Table name:', Usuario.tableName);
    console.log('   📋 createdAt mapping:', Usuario.options.createdAt);
    console.log('   📋 updatedAt mapping:', Usuario.options.updatedAt);
    console.log('   📋 underscored:', Usuario.options.underscored);
    
    console.log('\n2. Probando consulta simple con findAll...');
    const users = await Usuario.findAll({
      limit: 1,
      attributes: ['id', 'correo_electronico', 'primer_nombre']
    });
    console.log('   ✅ findAll básico funciona');
    
    console.log('\n3. Probando consulta con order usando created_at...');
    const usersWithOrder = await Usuario.findAll({
      limit: 1,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'correo_electronico', 'primer_nombre']
    });
    console.log('   ✅ findAll con order created_at funciona');
    
    console.log('\n4. Probando UserService.getAllUsers() directamente...');
    // Importar el servicio aquí para evitar problemas de circularidad
    const { default: UserService } = await import('./src/services/userService.js');
    const allUsers = await UserService.getAllUsers();
    console.log('   ✅ UserService.getAllUsers() funciona');
    console.log('   📊 Usuarios encontrados:', allUsers.length);
    
    console.log('\n🎉 ¡Todo funciona correctamente! El error debe estar en otro lugar.');
    
  } catch (error) {
    console.error('\n❌ Error encontrado:');
    console.error('   🔥 Message:', error.message);
    console.error('   🔥 Name:', error.name);
    console.error('   🔥 SQL:', error.sql || 'No SQL disponible');
    
    if (error.message.includes('User.createdAt')) {
      console.log('\n💡 Encontrado el problema del User.createdAt:');
      console.log('   - El error indica que algo está usando "User" en lugar de "Usuario"');
      console.log('   - Revisar imports y referencias al modelo');
    }
    
    if (error.message.includes('createdAt')) {
      console.log('\n💡 Problema relacionado con createdAt:');
      console.log('   - Usar created_at en lugar de createdAt en queries');
      console.log('   - Verificar configuración de underscored en el modelo');
    }
  }
}

debugCreatedAtError().then(() => {
  console.log('\n🏁 Debug completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
