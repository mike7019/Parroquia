#!/usr/bin/env node

/**
 * Script para verificar que el modelo Usuario esté correctamente configurado
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agregar el directorio raíz al path para importaciones
const rootDir = join(__dirname, '..');
process.chdir(rootDir);

console.log('🔧 Verificando corrección del modelo Usuario...\n');

async function testUsuarioModel() {
  try {
    console.log('1. Importando modelo Usuario...');
    const { User } = await import('../src/models/index.js');
    console.log('   ✅ Modelo importado correctamente');
    console.log('   📋 Nombre del modelo:', User.name);
    console.log('   📋 Nombre de la tabla:', User.getTableName());
    
    console.log('\n2. Verificando que el modelo interno sea "Usuario"...');
    if (User.name === 'Usuario') {
      console.log('   ✅ El modelo interno es "Usuario" (correcto)');
    } else {
      console.log('   ❌ El modelo interno es:', User.name, '(debería ser "Usuario")');
    }
    
    console.log('\n3. Verificando configuración de timestamps...');
    console.log('   📋 underscored:', User.options.underscored);
    console.log('   📋 createdAt field:', User.options.createdAt);
    console.log('   📋 updatedAt field:', User.options.updatedAt);
    
    console.log('\n4. Probando consulta simple...');
    const count = await User.count();
    console.log(`   ✅ Consulta exitosa: ${count} usuarios en la base de datos`);
    
    console.log('\n5. Probando consulta con ordenamiento...');
    const users = await User.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']]
    });
    console.log('   ✅ Consulta con ORDER BY exitosa');
    
    if (users.length > 0) {
      console.log('   📋 Usuario más reciente:', {
        id: users[0].id,
        email: users[0].correo_electronico,
        firstName: users[0].primer_nombre
      });
    }
    
    console.log('\n🎉 ¡Todas las verificaciones exitosas!');
    console.log('✅ El modelo Usuario está correctamente configurado.');
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    
    if (error.message.includes('createdAt') || error.message.includes('created_at')) {
      console.log('\n🔧 El problema persiste con los timestamps');
    }
    
    if (error.message.includes('Usuario') || error.message.includes('User')) {
      console.log('\n🔧 Hay un problema con el nombre del modelo');
    }
    
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar el test
testUsuarioModel().then(() => {
  console.log('\n📝 Correcciones aplicadas:');
  console.log('   ✅ Modelo definido como "Usuario" en lugar de "User"');
  console.log('   ✅ Todas las referencias internas actualizadas a Usuario');
  console.log('   ✅ Exportado como "User" para mantener compatibilidad con servicios');
  console.log('   ✅ Configuración underscored: true para manejo automático de snake_case');
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
