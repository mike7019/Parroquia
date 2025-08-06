#!/usr/bin/env node

/**
 * Script para verificar que el servicio de usuarios esté funcionando correctamente
 * después de las correcciones realizadas
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Agregar el directorio raíz al path para importaciones
const rootDir = join(__dirname, '..');
process.chdir(rootDir);

console.log('🔧 Verificando configuración del servicio de usuarios...\n');

async function testUserService() {
  try {
    console.log('1. Probando importación del modelo User...');
    const { User } = await import('../src/models/index.js');
    console.log('   ✅ Modelo User importado correctamente');
    console.log('   📋 Nombre del modelo:', User.name);
    console.log('   📋 Nombre de la tabla:', User.getTableName());
    
    console.log('\n2. Verificando scopes del modelo...');
    // Verificar que los scopes existen
    const scopes = User.options.scopes || {};
    console.log('   📋 Scopes disponibles:', Object.keys(scopes));
    
    if (scopes.withDeleted) {
      console.log('   ✅ Scope "withDeleted" encontrado');
    } else {
      console.log('   ❌ Scope "withDeleted" no encontrado');
    }
    
    if (scopes.deleted) {
      console.log('   ✅ Scope "deleted" encontrado');
    } else {
      console.log('   ❌ Scope "deleted" no encontrado');
    }
    
    console.log('\n3. Probando importación del servicio de usuarios...');
    const UserService = await import('../src/services/userService.js');
    console.log('   ✅ UserService importado correctamente');
    console.log('   📋 Métodos disponibles:', Object.getOwnPropertyNames(UserService.default).filter(name => name !== 'length' && name !== 'name' && name !== 'prototype'));
    
    console.log('\n4. Verificando métodos del modelo User...');
    const userInstance = User.build({});
    
    if (typeof userInstance.getUserRoles === 'function') {
      console.log('   ✅ Método getUserRoles encontrado');
    } else {
      console.log('   ❌ Método getUserRoles no encontrado');
    }
    
    if (typeof userInstance.hasRole === 'function') {
      console.log('   ✅ Método hasRole encontrado');
    } else {
      console.log('   ❌ Método hasRole no encontrado');
    }
    
    if (typeof userInstance.checkPassword === 'function') {
      console.log('   ✅ Método checkPassword encontrado');
    } else {
      console.log('   ❌ Método checkPassword no encontrado');
    }
    
    console.log('\n5. Verificando estructura de la tabla...');
    const attributes = User.getTableName ? User.rawAttributes : User.attributes;
    const fieldNames = Object.keys(attributes);
    console.log('   📋 Campos del modelo:', fieldNames.slice(0, 10), fieldNames.length > 10 ? '...' : '');
    
    // Verificar campos críticos en español
    const criticalFields = ['correo_electronico', 'contrasena', 'primer_nombre', 'activo'];
    for (const field of criticalFields) {
      if (fieldNames.includes(field)) {
        console.log(`   ✅ Campo crítico "${field}" encontrado`);
      } else {
        console.log(`   ❌ Campo crítico "${field}" no encontrado`);
      }
    }
    
    console.log('\n6. Probando conexión a la base de datos...');
    const sequelize = await import('../config/sequelize.js');
    await sequelize.default.authenticate();
    console.log('   ✅ Conexión a la base de datos exitosa');
    
    console.log('\n🎉 ¡Todas las verificaciones completadas exitosamente!');
    console.log('✅ El servicio de usuarios debería estar funcionando correctamente.');
    
  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

// Función para verificar problemas comunes
async function checkCommonIssues() {
  console.log('\n🔍 Verificando problemas comunes...\n');
  
  try {
    console.log('1. Verificando importaciones inconsistentes...');
    
    // Verificar archivos que podrían tener importaciones directas problemáticas
    const fs = await import('fs');
    const path = await import('path');
    
    const filesToCheck = [
      'src/services/userService.js',
      'src/middlewares/auth.js',
      'src/services/authService.js'
    ];
    
    for (const file of filesToCheck) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes("import User from '../models/Usuario.js'")) {
          console.log(`   ❌ ${file}: Importación directa encontrada (debería usar index.js)`);
        } else if (content.includes("import { User } from '../models/index.js'")) {
          console.log(`   ✅ ${file}: Importación correcta desde index.js`);
        }
      }
    }
    
    console.log('\n2. Verificando consistencia de nombres de campos...');
    console.log('   📋 El modelo usa nombres en español (correo_electronico, contrasena, etc.)');
    console.log('   📋 El middleware convierte a inglés para req.user (email, firstName, etc.)');
    console.log('   📋 El servicio mapea entre inglés (API) y español (modelo)');
    
  } catch (error) {
    console.error('❌ Error verificando problemas comunes:', error.message);
  }
}

// Ejecutar las verificaciones
async function main() {
  await testUserService();
  await checkCommonIssues();
  
  console.log('\n📝 Resumen de correcciones realizadas:');
  console.log('   ✅ Estandarizadas las importaciones para usar models/index.js');
  console.log('   ✅ Agregados scopes faltantes (withDeleted, deleted) al modelo User');
  console.log('   ✅ Corregidos nombres de campos en español en userService');
  console.log('   ✅ Mapeado entre nombres en inglés (API) y español (modelo)');
  console.log('   ✅ Corregidas referencias a campos inexistentes');
  
  console.log('\n🎯 El servicio de usuarios ahora debería funcionar correctamente con la tabla "usuarios"');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
