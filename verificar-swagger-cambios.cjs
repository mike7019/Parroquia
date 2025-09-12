// Script para verificar que los cambios de Swagger están aplicados
// y reiniciar el servidor para refrescar la documentación

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando cambios en Swagger...\n');

// Verificar archivo swagger.js
const swaggerPath = path.join(__dirname, 'src', 'config', 'swagger.js');
const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');

// Buscar los cambios aplicados
const hasNumericExample = swaggerContent.includes('type: \'integer\', example: 2');
const hasOneOfPattern = swaggerContent.includes('oneOf: [');
const hasStringParentesco = swaggerContent.includes('example: \'PADRE\'');

console.log('📋 Estado de cambios en swagger.js:');
console.log(`  ✅ Ejemplo numérico (id: 2): ${hasNumericExample ? '✅ PRESENTE' : '❌ FALTANTE'}`);
console.log(`  ✅ Patrón oneOf: ${hasOneOfPattern ? '✅ PRESENTE' : '❌ FALTANTE'}`);
console.log(`  ⚠️  Ejemplo string (PADRE): ${hasStringParentesco ? '⚠️  PRESENTE (para compatibilidad)' : '✅ REMOVIDO'}`);

// Verificar archivo de rutas
const routesPath = path.join(__dirname, 'src', 'routes', 'encuestaRoutes.js');
const routesContent = fs.readFileSync(routesPath, 'utf8');

const routeHasNumericExample = routesContent.includes('id: 2, nombre: "Padre"');
const routeHasOldExample = routesContent.includes('id: "PADRE"');

console.log('\n📋 Estado de cambios en encuestaRoutes.js:');
console.log(`  ✅ Ejemplo numérico en ruta: ${routeHasNumericExample ? '✅ PRESENTE' : '❌ FALTANTE'}`);
console.log(`  ❌ Ejemplo string antiguo: ${routeHasOldExample ? '❌ PRESENTE (problema)' : '✅ REMOVIDO'}`);

// Buscar cualquier referencia restante a formato string
const stringReferences = [
  swaggerContent.match(/id:\s*['"]\s*PADRE\s*['"][^,]/g) || [],
  routesContent.match(/id:\s*['"]\s*PADRE\s*['"][^,]/g) || []
].flat();

if (stringReferences.length > 0) {
  console.log('\n⚠️  Referencias a formato string encontradas:');
  stringReferences.forEach((ref, index) => {
    console.log(`  ${index + 1}. ${ref}`);
  });
} else {
  console.log('\n✅ No se encontraron referencias al formato string como ejemplo principal');
}

console.log('\n🔄 Pasos para aplicar cambios:');
console.log('1. Reiniciar servidor Node.js (Ctrl+C y npm run dev)');
console.log('2. Refrescar navegador en /api-docs');
console.log('3. Limpiar cache del navegador si es necesario');
console.log('4. Verificar que aparezca { "id": 2, "nombre": "Padre" } en ejemplos');

console.log('\n📝 Request body correcto para testing:');
console.log(JSON.stringify({
  "deceasedMembers": [
    {
      "nombres": "Pedro Antonio García",
      "fechaFallecimiento": "2020-05-15",
      "sexo": { "id": 1, "nombre": "Masculino" },
      "parentesco": { "id": 2, "nombre": "Padre" },  // ✅ Formato numérico
      "causaFallecimiento": "Enfermedad cardiovascular"
    }
  ]
}, null, 2));
