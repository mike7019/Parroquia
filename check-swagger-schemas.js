/**
 * Simple script to check what schemas are available in Swagger JSON
 */

import axios from 'axios';

async function checkSwaggerSchemas() {
  try {
    console.log('Checking Swagger JSON schemas...\n');
    
    const response = await axios.get('http://localhost:3000/api-docs/swagger.json');
    const swaggerDoc = response.data;
    
    if (!swaggerDoc.components || !swaggerDoc.components.schemas) {
      console.log('❌ No schemas found in components');
      return;
    }
    
    const schemas = Object.keys(swaggerDoc.components.schemas);
    console.log(`Found ${schemas.length} schemas:`);
    
    schemas.forEach((schema, index) => {
      console.log(`${index + 1}. ${schema}`);
    });
    
    // Check specifically for our updated schemas
    const expectedSchemas = ['UserInput', 'UserUpdate', 'LoginInput', 'ForgotPasswordInput', 'RefreshTokenInput'];
    console.log('\nChecking for expected schemas:');
    expectedSchemas.forEach(schema => {
      if (schemas.includes(schema)) {
        console.log(`✅ ${schema}: present`);
      } else {
        console.log(`❌ ${schema}: missing`);
      }
    });
    
    // Check for some that should be there
    const commonSchemas = ['User', 'Role', 'ApiResponse', 'ErrorResponse'];
    console.log('\nChecking for common schemas:');
    commonSchemas.forEach(schema => {
      if (schemas.includes(schema)) {
        console.log(`✅ ${schema}: present`);
      } else {
        console.log(`❌ ${schema}: missing`);
      }
    });
    
  } catch (error) {
    console.error('Error checking schemas:', error.message);
  }
}

checkSwaggerSchemas();
