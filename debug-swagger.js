import { specs } from './src/config/swagger.js';
import fs from 'fs';

// Función para verificar la especificación de Swagger
function debugSwaggerSpec() {
  console.log('\n🔍 DIAGNÓSTICO DE SWAGGER SPECIFICATION\n');
  
  // 1. Verificar que la especificación se genere correctamente
  console.log('1. ✅ Swagger specification generada correctamente');
  console.log(`   • Versión OpenAPI: ${specs.openapi}`);
  console.log(`   • Título: ${specs.info.title}`);
  console.log(`   • Total de rutas: ${Object.keys(specs.paths || {}).length}`);
  
  // 2. Verificar esquemas
  console.log('\n2. 📋 VERIFICACIÓN DE ESQUEMAS:');
  const schemas = specs.components?.schemas || {};
  console.log(`   • Total de esquemas: ${Object.keys(schemas).length}`);
  
  // Verificar específicamente SectorInput
  if (schemas.SectorInput) {
    console.log('\n   ✅ Esquema SectorInput encontrado:');
    console.log(`      • Tipo: ${schemas.SectorInput.type}`);
    console.log(`      • Propiedades: ${Object.keys(schemas.SectorInput.properties || {}).length}`);
    console.log(`      • Campos requeridos: ${(schemas.SectorInput.required || []).join(', ')}`);
    
    // Mostrar las propiedades
    if (schemas.SectorInput.properties) {
      console.log('\n      📝 Propiedades del esquema:');
      Object.entries(schemas.SectorInput.properties).forEach(([key, prop]) => {
        console.log(`         • ${key}: ${prop.type} ${prop.enum ? `[${prop.enum.join('|')}]` : ''}`);
      });
    }
  } else {
    console.log('\n   ❌ Esquema SectorInput NO encontrado');
  }
  
  // 3. Verificar endpoints de sectores
  console.log('\n3. 🛣️ VERIFICACIÓN DE ENDPOINTS DE SECTORES:');
  const sectorPaths = Object.entries(specs.paths || {})
    .filter(([path]) => path.includes('/sectors'));
    
  if (sectorPaths.length > 0) {
    sectorPaths.forEach(([path, methods]) => {
      console.log(`   • ${path}:`);
      Object.entries(methods).forEach(([method, spec]) => {
        console.log(`     - ${method.toUpperCase()}: ${spec.summary || 'Sin resumen'}`);
        
        // Verificar si el POST tiene requestBody con SectorInput
        if (method === 'post' && spec.requestBody) {
          const content = spec.requestBody.content;
          if (content && content['application/json']) {
            const schema = content['application/json'].schema;
            if (schema && schema.$ref) {
              console.log(`       📄 Schema: ${schema.$ref}`);
              if (schema.$ref.includes('SectorInput')) {
                console.log('       ✅ Referencia a SectorInput correcta');
              }
            }
          }
        }
      });
    });
  } else {
    console.log('   ❌ No se encontraron endpoints de sectores');
  }
  
  // 4. Guardar especificación completa para revisión
  console.log('\n4. 💾 GUARDANDO ESPECIFICACIÓN COMPLETA:');
  try {
    fs.writeFileSync('./swagger-debug.json', JSON.stringify(specs, null, 2));
    console.log('   ✅ Especificación guardada en: swagger-debug.json');
  } catch (error) {
    console.log(`   ❌ Error al guardar: ${error.message}`);
  }
  
  // 5. Verificar referencias circulares
  console.log('\n5. 🔄 VERIFICACIÓN DE REFERENCIAS CIRCULARES:');
  try {
    JSON.stringify(specs);
    console.log('   ✅ No hay referencias circulares detectadas');
  } catch (error) {
    console.log(`   ❌ Posible referencia circular: ${error.message}`);
  }
  
  console.log('\n🎯 DIAGNÓSTICO COMPLETADO\n');
}

// Ejecutar diagnóstico
debugSwaggerSpec();
