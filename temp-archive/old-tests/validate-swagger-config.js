/**
 * Script to validate Swagger configuration syntax
 */

async function validateSwaggerConfig() {
  try {
    console.log('🔍 Validating Swagger configuration...\n');
    
    // Try to import the swagger config
    const { swaggerConfig, specs } = await import('./src/config/swagger.js');
    
    console.log('✅ Swagger config imported successfully');
    
    // Check if components exist
    if (swaggerConfig.definition?.components) {
      console.log('✅ Components section found');
      
      if (swaggerConfig.definition.components.schemas) {
        const schemaKeys = Object.keys(swaggerConfig.definition.components.schemas);
        console.log(`✅ Schemas section found with ${schemaKeys.length} schemas`);
        
        // List first 10 schemas
        console.log('\n📋 First 10 schemas:');
        schemaKeys.slice(0, 10).forEach((key, index) => {
          console.log(`${index + 1}. ${key}`);
        });
        
        // Check for our specific schemas
        const targetSchemas = ['UserInput', 'UserUpdate', 'LoginInput', 'ForgotPasswordInput'];
        console.log('\n🎯 Checking target schemas:');
        targetSchemas.forEach(schema => {
          if (schemaKeys.includes(schema)) {
            console.log(`✅ ${schema}: found`);
          } else {
            console.log(`❌ ${schema}: missing`);
          }
        });
        
      } else {
        console.log('❌ No schemas section found');
      }
    } else {
      console.log('❌ No components section found');
    }
    
    // Check the generated specs
    console.log('\n🔧 Checking generated specs...');
    if (specs) {
      console.log('✅ Specs generated successfully');
      
      if (specs.components?.schemas) {
        const specsSchemaKeys = Object.keys(specs.components.schemas);
        console.log(`✅ Generated specs contain ${specsSchemaKeys.length} schemas`);
        
        // Check if our schemas made it to the specs
        const targetSchemas = ['UserInput', 'UserUpdate', 'LoginInput'];
        console.log('\n🎯 Checking target schemas in generated specs:');
        targetSchemas.forEach(schema => {
          if (specsSchemaKeys.includes(schema)) {
            console.log(`✅ ${schema}: present in specs`);
          } else {
            console.log(`❌ ${schema}: missing from specs`);
          }
        });
        
      } else {
        console.log('❌ No schemas in generated specs');
      }
    } else {
      console.log('❌ No specs generated');
    }
    
  } catch (error) {
    console.error('❌ Error validating Swagger config:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

validateSwaggerConfig();
