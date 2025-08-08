/**
 * Script para verificar que la documentación de Swagger se ha actualizado correctamente
 */

import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';

console.log('🧪 Verificando actualización de documentación Swagger...\n');

async function verifySwaggerUpdates() {
  try {
    console.log('1. Cargando configuración de Swagger...'); 
    
    // Importar la configuración de swagger
    const { swaggerSpec } = await import('./src/config/swagger.js');
    
    console.log('   ✅ Configuración de Swagger cargada');
    
    console.log('\n2. Verificando esquemas de parámetros...');
    
    // Verificar si hay parámetros definidos en los paths
    const paths = swaggerSpec.paths;
    const userPaths = Object.keys(paths).filter(path => path.includes('/users/{id}'));
    
    console.log(`   📋 Paths de usuarios encontrados: ${userPaths.length}`);
    
    userPaths.forEach(path => {
      console.log(`\n   🔍 Analizando path: ${path}`);
      const pathObj = paths[path];
      
      ['get', 'put', 'delete'].forEach(method => {
        if (pathObj[method]) {
          console.log(`     📌 Método: ${method.toUpperCase()}`);
          
          const parameters = pathObj[method].parameters;
          if (parameters) {
            const idParam = parameters.find(p => p.name === 'id' && p.in === 'path');
            if (idParam) {
              console.log(`       🆔 Parámetro ID encontrado:`);
              console.log(`         - Tipo: ${idParam.schema?.type}`);
              console.log(`         - Formato: ${idParam.schema?.format || 'no especificado'}`);
              console.log(`         - Ejemplo: ${idParam.example}`);
              
              if (idParam.schema?.type === 'string' && idParam.schema?.format === 'uuid') {
                console.log(`         ✅ CORRECTO: Configurado como UUID string`);
              } else if (idParam.schema?.type === 'integer') {
                console.log(`         ❌ ERROR: Aún configurado como integer`);
              } else {
                console.log(`         ⚠️  ADVERTENCIA: Configuración no estándar`);
              }
            } else {
              console.log(`       ℹ️  Sin parámetro ID en path`);
            }
          } else {
            console.log(`       ℹ️  Sin parámetros definidos`);
          }
        }
      });
    });
    
    console.log('\n3. Verificando esquema User...');
    const userSchema = swaggerSpec.components?.schemas?.User;
    if (userSchema) {
      const idProperty = userSchema.properties?.id;
      if (idProperty) {
        console.log(`   🆔 Propiedad ID del esquema User:`);
        console.log(`     - Tipo: ${idProperty.type}`);
        console.log(`     - Formato: ${idProperty.format || 'no especificado'}`);
        console.log(`     - Ejemplo: ${idProperty.example}`);
        
        if (idProperty.type === 'string' && idProperty.format === 'uuid') {
          console.log(`     ✅ CORRECTO: Esquema User.id configurado como UUID`);
        } else {
          console.log(`     ❌ ERROR: Esquema User.id mal configurado`);
        }
      } else {
        console.log('   ❌ ERROR: No se encontró propiedad ID en esquema User');
      }
    } else {
      console.log('   ❌ ERROR: No se encontró esquema User');
    }
    
    console.log('\n🎉 Verificación completada');
    console.log('\n📋 Pasos siguientes:');
    console.log('   1. Reiniciar el servidor para aplicar cambios');
    console.log('   2. Probar en Swagger UI con UUIDs:');
    console.log('      • Usuario regular: 31cb8fe4-bb24-4ad8-af66-d8c900d13c2a');
    console.log('      • Usuario admin: a2ba8955-e782-4aa2-9504-8af539cd89a8');
    
  } catch (error) {
    console.error('\n❌ Error durante verificación:', error.message);
    console.error('Stack:', error.stack);
  }
}

verifySwaggerUpdates().then(() => {
  console.log('\n🏁 Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
