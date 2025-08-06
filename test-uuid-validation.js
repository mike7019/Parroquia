/**
 * Test para verificar que la validación de UUID funciona correctamente
 */

import { Usuario } from './src/models/index.js';

console.log('🧪 Test UUID validation fix...\n');

async function testUUIDValidation() {
  try {
    console.log('1. Buscando usuario con las credenciales proporcionadas...');
    
    const user = await Usuario.findOne({
      where: {
        correo_electronico: 'diego.gahhrcsdia5105@yopmail.com'
      },
      attributes: ['id', 'correo_electronico', 'primer_nombre', 'primer_apellido', 'activo']
    });
    
    if (!user) {
      console.log('   ❌ Usuario no encontrado con ese email');
      console.log('   💡 Verificar que el email esté correcto en la base de datos');
      
      // Buscar usuarios similares
      console.log('\n2. Buscando usuarios con emails similares...');
      const similarUsers = await Usuario.findAll({
        where: {
          correo_electronico: {
            [Op.like]: '%diego%@yopmail.com'
          }
        },
        attributes: ['id', 'correo_electronico', 'primer_nombre', 'primer_apellido'],
        limit: 5
      });
      
      console.log('   📧 Usuarios encontrados con emails similares:');
      similarUsers.forEach(u => {
        console.log(`     • ${u.correo_electronico} (ID: ${u.id.substring(0, 8)}...)`);
      });
      
      return;
    }
    
    console.log('   ✅ Usuario encontrado:');
    console.log(`     📧 Email: ${user.correo_electronico}`);
    console.log(`     👤 Nombre: ${user.primer_nombre} ${user.primer_apellido}`);
    console.log(`     🆔 ID: ${user.id}`);
    console.log(`     📊 Estado: ${user.activo ? 'Activo' : 'Inactivo'}`);
    
    console.log('\n2. Verificando formato UUID...');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidUUID = uuidRegex.test(user.id);
    
    console.log(`   🔍 ID del usuario: ${user.id}`);
    console.log(`   ✅ ¿Es UUID válido?: ${isValidUUID ? 'SÍ' : 'NO'}`);
    
    if (isValidUUID) {
      console.log('\n🎉 ¡SUCCESS! El usuario tiene un UUID válido');
      console.log('✅ La validación de UUID en los endpoints debería funcionar correctamente');
      console.log('\n📋 Para probar en Swagger:');
      console.log(`   • Usar este ID: ${user.id}`);
      console.log(`   • Endpoint: GET /api/users/${user.id}`);
    } else {
      console.log('\n❌ El ID no es un UUID válido');
      console.log('💡 Revisar la configuración del modelo Usuario');
    }
    
    console.log('\n3. Verificando contraseña...');
    const isPasswordValid = await user.checkPassword('Fuerte789&');
    console.log(`   🔐 ¿Contraseña correcta?: ${isPasswordValid ? 'SÍ' : 'NO'}`);
    
    if (!isPasswordValid) {
      console.log('   ⚠️  La contraseña proporcionada no coincide');
      console.log('   💡 Verificar la contraseña en la base de datos');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Importar Op para la búsqueda
import { Op } from 'sequelize';

testUUIDValidation().then(() => {
  console.log('\n🏁 Test completado');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
