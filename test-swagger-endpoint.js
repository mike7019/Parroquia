/**
 * Test script to verify Swagger documentation is properly served and accessible
 * This will test the swagger endpoint and verify that schemas are correctly defined
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

async function testSwaggerDocumentation() {
  console.log('🔍 Verificando documentación Swagger en el servidor...\n');

  try {
    // Test if Swagger JSON endpoint is accessible
    console.log('1. Verificando endpoint de Swagger JSON...');
    const swaggerJsonResponse = await axios.get(`${API_BASE_URL}/api-docs.json`);
    
    if (swaggerJsonResponse.status === 200) {
      console.log('   ✅ Swagger JSON endpoint accesible');
      
      const swaggerDoc = swaggerJsonResponse.data;
      
      // Verify schemas exist
      console.log('\n2. Verificando schemas en la documentación...');
      const expectedSchemas = [
        'UserInput',
        'UserUpdate', 
        'LoginInput',
        'ForgotPasswordInput',
        'RefreshTokenInput',
        'PasswordResetInput',
        'ChangePasswordInput',
        'FamiliaInput',
        'PersonaInput',
        'FamilyMemberInput'
      ];
      
      expectedSchemas.forEach(schema => {
        if (swaggerDoc.components?.schemas?.[schema]) {
          console.log(`   ✅ ${schema}: presente`);
        } else {
          console.log(`   ❌ ${schema}: faltante`);
        }
      });
      
      // Verify UserInput has Spanish field names and required fields
      console.log('\n3. Verificando campos de UserInput...');
      const userInputSchema = swaggerDoc.components?.schemas?.UserInput;
      if (userInputSchema) {
        const requiredFields = userInputSchema.required || [];
        const properties = userInputSchema.properties || {};
        
        const expectedRequired = ['primer_nombre', 'primer_apellido', 'correo_electronico', 'contrasena', 'rol'];
        expectedRequired.forEach(field => {
          if (requiredFields.includes(field)) {
            console.log(`   ✅ ${field}: requerido`);
          } else {
            console.log(`   ❌ ${field}: no marcado como requerido`);
          }
          
          if (properties[field]) {
            console.log(`   ✅ ${field}: propiedad definida`);
          } else {
            console.log(`   ❌ ${field}: propiedad faltante`);
          }
        });
        
        // Check for pattern validation on password
        if (properties.contrasena?.pattern) {
          console.log('   ✅ contrasena: tiene validación de patrón');
        } else {
          console.log('   ❌ contrasena: falta validación de patrón');
        }
      }
      
      // Verify UserUpdate has Spanish field names
      console.log('\n4. Verificando campos de UserUpdate...');
      const userUpdateSchema = swaggerDoc.components?.schemas?.UserUpdate;
      if (userUpdateSchema) {
        const properties = userUpdateSchema.properties || {};
        const spanishFields = ['primer_nombre', 'primer_apellido', 'correo_electronico', 'telefono'];
        
        spanishFields.forEach(field => {
          if (properties[field]) {
            console.log(`   ✅ ${field}: presente en español`);
          } else {
            console.log(`   ❌ ${field}: faltante`);
          }
        });
      }
      
      // Verify password schemas have proper validation
      console.log('\n5. Verificando validaciones de contraseña...');
      const passwordResetSchema = swaggerDoc.components?.schemas?.PasswordResetInput;
      if (passwordResetSchema?.properties?.token) {
        const tokenProp = passwordResetSchema.properties.token;
        if (tokenProp.minLength === 32 && tokenProp.maxLength === 64) {
          console.log('   ✅ PasswordResetInput token: validación de longitud correcta');
        } else {
          console.log('   ❌ PasswordResetInput token: validación de longitud incorrecta');
        }
      }
      
    } else {
      console.log('   ❌ Swagger JSON endpoint no accesible');
    }
    
    // Test if Swagger UI is accessible
    console.log('\n6. Verificando Swagger UI...');
    try {
      const swaggerUIResponse = await axios.get(`${API_BASE_URL}/api-docs`);
      if (swaggerUIResponse.status === 200 && swaggerUIResponse.data.includes('swagger-ui')) {
        console.log('   ✅ Swagger UI accesible');
      } else {
        console.log('   ❌ Swagger UI no accesible o no contiene contenido esperado');
      }
    } catch (error) {
      console.log('   ❌ Error accediendo a Swagger UI:', error.message);
    }
    
    console.log('\n🎉 Verificación de documentación Swagger completada!\n');
    
  } catch (error) {
    console.log('❌ Error verificando Swagger:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
    }
  }
}

// Run verification
testSwaggerDocumentation();
