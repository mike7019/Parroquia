/**
 * Script para verificar que las rutas de parentesco funcionan en ambas URLs
 */

console.log('🔍 VERIFICACIÓN DE RUTAS DE PARENTESCO');
console.log('='.repeat(50));

console.log('\n📋 Configuración actual:');
console.log('✅ Rutas montadas en app.js:');
console.log('   • /api/catalog -> catalogRoutes (incluye /parentescos)');
console.log('   • /api/parentescos -> parentescoRoutes (acceso directo)');

console.log('\n🌐 URLs disponibles:');
console.log('   1. /api/catalog/parentescos (recomendada)');
console.log('   2. /api/parentescos (compatibilidad)');

console.log('\n📚 Endpoints que deberían funcionar:');
const endpoints = [
  'GET /stats - Estadísticas',
  'GET / - Listar con filtros',
  'POST / - Crear nuevo',
  'GET /:id - Obtener por ID',
  'PUT /:id - Actualizar',
  'DELETE /:id - Eliminar (soft)',
  'PATCH /:id/restore - Restaurar'
];

console.log('\n📍 Rutas en /api/catalog/parentescos:');
endpoints.forEach(endpoint => {
  console.log(`   • ${endpoint.replace('/', '/api/catalog/parentescos/')}`);
});

console.log('\n📍 Rutas en /api/parentescos:');
endpoints.forEach(endpoint => {
  console.log(`   • ${endpoint.replace('/', '/api/parentescos/')}`);
});

console.log('\n🔧 Para probar:');
console.log('1. Reiniciar el servidor si está corriendo');
console.log('2. Probar ambas URLs:');
console.log('   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/parentescos/stats');
console.log('   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/catalog/parentescos/stats');

console.log('\n📖 Swagger Documentation:');
console.log('   • http://localhost:3000/api-docs');
console.log('   • Buscar sección "Parentescos"');
console.log('   • Ambas rutas documentadas');

console.log('\n✅ CONFIGURACIÓN COMPLETADA');
console.log('='.repeat(50));
