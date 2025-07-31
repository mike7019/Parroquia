import express from 'express';
import tipoIdentificacionRoutes from './src/routes/catalog/tipoIdentificacionRoutes.js';

const app = express();
app.use(express.json());

// Mount the routes
app.use('/api/catalog/tipos-identificacion', tipoIdentificacionRoutes);

// Start test server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('GET /api/catalog/tipos-identificacion/codes');
  
  // Log route stack
  const router = tipoIdentificacionRoutes;
  console.log('\nRoute stack:');
  router.stack.forEach((layer, index) => {
    console.log(`${index}: ${layer.route?.path || layer.regexp} - ${layer.route?.methods || 'middleware'}`);
  });
});
