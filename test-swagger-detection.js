import swaggerJSDoc from 'swagger-jsdoc';

const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0'
    }
  },
  apis: [
    './src/routes/*.js',
    './src/routes/catalog/*.js'
  ]
};

console.log('🔍 Verificando detección de rutas de Swagger...');
console.log('Archivos que debería detectar:');
console.log('- ./src/routes/*.js');
console.log('- ./src/routes/catalog/*.js');

try {
  const specs = swaggerJSDoc(swaggerConfig);
  console.log('\n✅ Swagger JSDoc ejecutado exitosamente');
  
  // Verificar si hay paths definidos
  if (specs.paths) {
    const paths = Object.keys(specs.paths);
    console.log(`📋 Rutas detectadas: ${paths.length}`);
    
    // Buscar rutas de parentesco
    const parentescoRoutes = paths.filter(path => path.includes('parentesco'));
    if (parentescoRoutes.length > 0) {
      console.log('✅ Rutas de parentesco detectadas:');
      parentescoRoutes.forEach(route => console.log(`   - ${route}`));
    } else {
      console.log('❌ No se detectaron rutas de parentesco');
    }
    
    // Mostrar todas las rutas encontradas
    console.log('\n📋 Todas las rutas detectadas:');
    paths.forEach(path => console.log(`   - ${path}`));
  } else {
    console.log('❌ No se detectaron rutas');
  }
  
  // Verificar tags
  if (specs.tags) {
    console.log('\n🏷️  Tags detectados:');
    specs.tags.forEach(tag => console.log(`   - ${tag.name}`));
    
    const parentescoTag = specs.tags.find(tag => tag.name === 'Parentescos');
    if (parentescoTag) {
      console.log('✅ Tag de Parentescos detectado');
    } else {
      console.log('❌ Tag de Parentescos NO detectado');
    }
  }
  
} catch (error) {
  console.error('❌ Error al procesar Swagger JSDoc:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🔧 Para solucionar problemas:');
console.log('1. Verificar que el archivo existe en: src/routes/catalog/parentescoRoutes.js');
console.log('2. Verificar que contiene comentarios @swagger válidos');
console.log('3. Reiniciar el servidor después de mover archivos');
console.log('4. Revisar la consola del servidor para errores de Swagger');
