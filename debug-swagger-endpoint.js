/**
 * Debug script to check what the server is actually returning
 */

import axios from 'axios';
import fs from 'fs';

async function debugSwaggerEndpoint() {
  try {
    console.log('🔍 Debugging Swagger endpoint...\n');
    
    // First, let's get the response and save it to a file for inspection
    console.log('1. Fetching swagger.json from server...');
    const response = await axios.get('http://localhost:3000/api-docs.json');
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']}`);
    
    // Save the response to a file
    fs.writeFileSync('./swagger-response.json', JSON.stringify(response.data, null, 2));
    console.log('   ✅ Response saved to swagger-response.json');
    
    // Check the structure
    console.log('\n2. Response structure analysis:');
    const data = response.data;
    
    console.log(`   OpenAPI version: ${data.openapi || 'not specified'}`);
    console.log(`   Title: ${data.info?.title || 'not specified'}`);
    console.log(`   Version: ${data.info?.version || 'not specified'}`);
    
    if (data.components) {
      console.log('   ✅ Components section exists');
      
      if (data.components.schemas) {
        const schemaCount = Object.keys(data.components.schemas).length;
        console.log(`   ✅ Schemas section exists with ${schemaCount} schemas`);
        
        // List all schemas
        const schemas = Object.keys(data.components.schemas);
        console.log('\n3. All schemas in response:');
        schemas.forEach((schema, index) => {
          console.log(`   ${index + 1}. ${schema}`);
        });
        
        // Check specific schemas we added
        console.log('\n4. Checking our specific schemas:');
        const ourSchemas = ['UserInput', 'UserUpdate', 'LoginInput', 'ForgotPasswordInput', 'RefreshTokenInput', 'ChangePasswordInput'];
        ourSchemas.forEach(schema => {
          if (schemas.includes(schema)) {
            console.log(`   ✅ ${schema}: present`);
            
            // Check if it has our specific fields
            const schemaData = data.components.schemas[schema];
            if (schema === 'UserInput' && schemaData.properties) {
              const hasSpanishFields = schemaData.properties.primer_nombre && schemaData.properties.correo_electronico;
              console.log(`      Spanish fields: ${hasSpanishFields ? '✅ present' : '❌ missing'}`);
            }
          } else {
            console.log(`   ❌ ${schema}: missing`);
          }
        });
        
      } else {
        console.log('   ❌ No schemas section in components');
      }
    } else {
      console.log('   ❌ No components section in response');
    }
    
    console.log('\n✅ Debug complete! Check swagger-response.json for full response.');
    
  } catch (error) {
    console.error('❌ Error debugging endpoint:', error.message);
    if (error.response) {
      console.error(`   Response status: ${error.response.status}`);
      console.error(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

debugSwaggerEndpoint();
