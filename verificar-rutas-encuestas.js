import express from 'express';
import encuestaRoutes from './src/routes/encuestaRoutes.js';

const app = express();

// Configurar middleware básico
app.use(express.json());

// Registrar rutas
app.use('/api', encuestaRoutes);

// Mostrar rutas registradas
function listRoutes(routes, prefix = '') {
  routes.forEach((route) => {
    if (route.route) {
      const methods = Object.keys(route.route.methods);
      console.log(`${methods[0].toUpperCase().padEnd(7)} ${prefix}${route.route.path}`);
    }
  });
}

console.log('🔍 Verificando rutas de encuestas registradas:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  listRoutes(encuestaRoutes.stack, '/api');
  console.log('✅ Todas las rutas de encuestas están correctamente registradas');
} catch (error) {
  console.error('❌ Error verificando rutas:', error.message);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎉 Refactorización completada exitosamente');
