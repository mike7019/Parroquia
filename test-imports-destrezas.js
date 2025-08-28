// Prueba rápida para verificar que el servidor arranca
console.log('🚀 Intentando cargar el servidor...');

try {
  const { loadAllModels } = await import('./syncDatabaseComplete.js');
  console.log('✅ syncDatabaseComplete importado correctamente');
  
  const destrezaService = await import('./src/services/catalog/destrezaService.js');
  console.log('✅ destrezaService importado correctamente');
  
  const destrezaController = await import('./src/controllers/catalog/destrezaController.js');
  console.log('✅ destrezaController importado correctamente');
  
  const destrezaRoutes = await import('./src/routes/catalog/destrezaRoutes.js');
  console.log('✅ destrezaRoutes importado correctamente');
  
  console.log('\n🎉 ¡Todas las importaciones fueron exitosas!');
  console.log('✅ El servicio de destrezas está listo para usar');
  
} catch (error) {
  console.error('❌ Error en las importaciones:', error.message);
  console.error(error.stack);
}
