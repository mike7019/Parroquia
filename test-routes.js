import express from 'express';
import tipoIdentificacionRoutes from './src/routes/catalog/tipoIdentificacionRoutes.js';
import catalogRoutes from './src/routes/catalog/index.js';

console.log('Testing route imports...');

console.log('1. tipoIdentificacionRoutes type:', typeof tipoIdentificacionRoutes);
console.log('2. catalogRoutes type:', typeof catalogRoutes);

// Test if routes are functions/routers
console.log('3. tipoIdentificacionRoutes stack length:', tipoIdentificacionRoutes.stack?.length || 'no stack');
console.log('4. catalogRoutes stack length:', catalogRoutes.stack?.length || 'no stack');

// Try creating an app and mounting the routes
const app = express();
app.use('/test', tipoIdentificacionRoutes);
app.use('/catalog', catalogRoutes);

console.log('5. App routes after mounting:');
app._router.stack.forEach((layer, index) => {
  console.log(`   ${index}: ${layer.regexp} -> ${layer.handle.stack?.length || 0} subroutes`);
});

console.log('Test completed successfully');
