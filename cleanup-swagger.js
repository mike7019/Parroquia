import fs from 'fs';
import path from 'path';

console.log('🧹 LIMPIANDO CACHÉ DE SWAGGER\n');

// Archivos temporales creados durante el diagnóstico
const filesToClean = [
  './debug-swagger.js',
  './swagger-debug.json',
  './swagger-debug-endpoint.js'
];

console.log('📁 Limpiando archivos temporales:');
filesToClean.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   ✅ Eliminado: ${file}`);
    } else {
      console.log(`   ⚠️  No existe: ${file}`);
    }
  } catch (error) {
    console.log(`   ❌ Error eliminando ${file}: ${error.message}`);
  }
});

console.log('\n🎯 VERIFICACIÓN DEL ENDPOINT POST /api/catalog/sectors:');
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('│ ANTES: $ref: "#/components/schemas/SectorInput"         │');
console.log('│ DESPUÉS: Esquema inline completamente definido         │');
console.log('└─────────────────────────────────────────────────────────┘');

console.log('\n📋 ESQUEMA INLINE IMPLEMENTADO:');
console.log(`
{
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 255,
      "description": "Nombre del sector",
      "example": "La Esperanza"
    },
    "description": {
      "type": "string",
      "description": "Descripción del sector",
      "example": "Sector ubicado en la zona norte de la parroquia"
    },
    "coordinator": {
      "type": "integer",
      "minimum": 1,
      "description": "ID del coordinador (opcional)",
      "example": 2
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive"],
      "default": "active",
      "description": "Estado del sector",
      "example": "active"
    },
    "code": {
      "type": "string",
      "maxLength": 20,
      "description": "Código único del sector (opcional)",
      "example": "SEC001"
    },
    "municipioId": {
      "type": "integer",
      "minimum": 1,
      "description": "ID del municipio (opcional)",
      "example": 1
    },
    "veredaId": {
      "type": "integer",
      "minimum": 1,
      "description": "ID de la vereda (opcional)",
      "example": 1
    }
  },
  "example": {
    "name": "Sector San José",
    "description": "Sector ubicado en el centro de la parroquia",
    "coordinator": 2,
    "status": "active",
    "code": "SJ001",
    "municipioId": 1,
    "veredaId": 1
  }
}
`);

console.log('\n🔍 INSTRUCCIONES PARA VERIFICAR:');
console.log('1. Abre: http://localhost:3000/api-docs');
console.log('2. Busca la sección "Sectors"');
console.log('3. Expande "POST /api/catalog/sectors"');
console.log('4. Haz clic en "Try it out"');
console.log('5. Verifica que veas el esquema completo en lugar de "string"');

console.log('\n💡 ENDPOINTS DE DIAGNÓSTICO DISPONIBLES:');
console.log('• http://localhost:3000/api/swagger-debug');
console.log('• http://localhost:3000/api-docs.json');

console.log('\n✅ LIMPIEZA COMPLETADA\n');
