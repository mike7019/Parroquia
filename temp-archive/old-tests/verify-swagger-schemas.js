/**
 * Test script to verify that Swagger schemas match validation requirements
 * This script will validate that all required fields from validators are present in Swagger schemas
 */

import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

// Import the swagger config
const swaggerConfigPath = './src/config/swagger.js';

async function verifySwaggerSchemas() {
  console.log('🔍 Verificando schemas de Swagger...\n');

  try {
    // Read swagger config content
    const swaggerContent = fs.readFileSync('./src/config/swagger.js', 'utf8');
    
    // Extract schema definitions by parsing the content
    const schemas = {};
    
    // Check UserInput schema
    console.log('✅ UserInput Schema - Verificando campos requeridos:');
    const userInputMatch = swaggerContent.match(/UserInput:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\}\s*\}/);
    if (userInputMatch) {
      const userInputProps = userInputMatch[1];
      const requiredFields = ['primer_nombre', 'primer_apellido', 'correo_electronico', 'contrasena', 'rol'];
      const optionalFields = ['segundo_nombre', 'segundo_apellido', 'telefono'];
      
      requiredFields.forEach(field => {
        if (userInputProps.includes(field)) {
          console.log(`  ✓ ${field}: presente`);
        } else {
          console.log(`  ❌ ${field}: faltante`);
        }
      });
      
      optionalFields.forEach(field => {
        if (userInputProps.includes(field)) {
          console.log(`  ✓ ${field}: presente (opcional)`);
        }
      });
    }
    
    console.log('\n✅ UserUpdate Schema - Verificando campos en español:');
    const userUpdateMatch = swaggerContent.match(/UserUpdate:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\}\s*\}/);
    if (userUpdateMatch) {
      const userUpdateProps = userUpdateMatch[1];
      const spanishFields = ['primer_nombre', 'primer_apellido', 'correo_electronico', 'telefono'];
      const englishFields = ['firstName', 'lastName', 'email', 'phone'];
      
      spanishFields.forEach(field => {
        if (userUpdateProps.includes(field)) {
          console.log(`  ✓ ${field}: presente (español)`);
        } else {
          console.log(`  ❌ ${field}: faltante`);
        }
      });
      
      englishFields.forEach(field => {
        if (userUpdateProps.includes(field)) {
          console.log(`  ⚠️ ${field}: presente (inglés - debería ser español)`);
        }
      });
    }
    
    console.log('\n✅ LoginInput Schema - Verificando campos:');
    const loginInputMatch = swaggerContent.match(/LoginInput:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\}\s*\}/);
    if (loginInputMatch) {
      const loginProps = loginInputMatch[1];
      if (loginProps.includes('correo_electronico') && loginProps.includes('contrasena')) {
        console.log('  ✓ correo_electronico: presente');
        console.log('  ✓ contrasena: presente');
      } else {
        console.log('  ❌ Campos de login faltantes');
      }
    }
    
    console.log('\n✅ Nuevos schemas agregados:');
    const newSchemas = ['ForgotPasswordInput', 'RefreshTokenInput', 'FamiliaInput', 'PersonaInput'];
    newSchemas.forEach(schema => {
      if (swaggerContent.includes(`${schema}:`)) {
        console.log(`  ✓ ${schema}: presente`);
      } else {
        console.log(`  ❌ ${schema}: faltante`);
      }
    });
    
    console.log('\n✅ PasswordResetInput - Verificando validaciones:');
    const passwordResetMatch = swaggerContent.match(/PasswordResetInput:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\}\s*\}/);
    if (passwordResetMatch) {
      const passwordResetProps = passwordResetMatch[1];
      if (passwordResetProps.includes('minLength: 32') && passwordResetProps.includes('maxLength: 64')) {
        console.log('  ✓ Token: validaciones de longitud correctas (32-64)');
      } else {
        console.log('  ❌ Token: validaciones de longitud incorrectas');
      }
      
      if (passwordResetProps.includes('pattern:') && passwordResetProps.includes('(?=.*[a-z])(?=.*[A-Z])')) {
        console.log('  ✓ newPassword: validación de patrón presente');
      } else {
        console.log('  ❌ newPassword: validación de patrón faltante');
      }
    }
    
    console.log('\n✅ ChangePasswordInput - Verificando validaciones:');
    const changePasswordMatch = swaggerContent.match(/ChangePasswordInput:\s*\{[\s\S]*?properties:\s*\{([\s\S]*?)\}\s*\}/);
    if (changePasswordMatch) {
      const changePasswordProps = changePasswordMatch[1];
      if (changePasswordProps.includes('maxLength: 100')) {
        console.log('  ✓ currentPassword: longitud máxima correcta');
      }
      
      if (changePasswordProps.includes('pattern:') && changePasswordProps.includes('(?=.*[a-z])(?=.*[A-Z])')) {
        console.log('  ✓ newPassword: validación de patrón presente');
      }
    }
    
    console.log('\n🎉 Verificación de schemas completada!\n');
    
    // Check for pattern consistency
    console.log('🔧 Verificando consistencia de patrones:');
    const patterns = {
      'names': /pattern: '\^\\[a-zA-ZÀ-ÿ\\\\u00f1\\\\u00d1\\\\s\\]\\+\\$'/g,
      'email': /format: 'email'/g,
      'password': /pattern: '\^\\(\\?=\\.\\*\\[a-z\\]\\)\\(\\?=\\.\\*\\[A-Z\\]\\)/g,
      'phone': /pattern: '\^\\[\\\\\\+\\]\\?\\[0-9\\\\s\\\\\\-\\\\\\(\\\\\\)\\]\\+\\$'/g
    };
    
    Object.entries(patterns).forEach(([name, pattern]) => {
      const matches = swaggerContent.match(pattern);
      if (matches) {
        console.log(`  ✓ ${name}: patrón usado ${matches.length} veces`);
      } else {
        console.log(`  ⚠️ ${name}: patrón no encontrado`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error verificando schemas:', error.message);
  }
}

// Run verification
verifySwaggerSchemas();
