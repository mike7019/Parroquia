// Script temporal para verificar la importación de rutas de encuestas
console.log('🔍 Probando importar rutas de encuestas...');

try {
  const encuestaRoutes = await import('./src/routes/encuestaRoutes.js');
  console.log('✅ Rutas importadas exitosamente');
  console.log('📊 Tipo de exportación:', typeof encuestaRoutes.default);
  console.log('📋 Propiedades:', Object.keys(encuestaRoutes));
  
  // Verificar si es un router de Express
  if (encuestaRoutes.default && encuestaRoutes.default.stack) {
    console.log(`🛤️  Rutas encontradas: ${encuestaRoutes.default.stack.length}`);
    encuestaRoutes.default.stack.forEach((layer, index) => {
      console.log(`  ${index + 1}. ${layer.route?.path || 'middleware'} - ${Object.keys(layer.route?.methods || {}).join(', ').toUpperCase()}`);
    });
  }
} catch (error) {
  console.error('❌ Error importando rutas:', error.message);
  console.error('📋 Stack:', error.stack);
}