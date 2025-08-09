// Test just the service file directly
try {
  console.log('Testing service file...');
  import('./src/services/catalog/sistemaAcueductoService.js')
    .then(module => {
      console.log('Module loaded:', Object.keys(module));
    })
    .catch(error => {
      console.error('Error loading module:', error.message);
      console.error('Full error:', error);
    });
} catch (error) {
  console.error('Sync error:', error);
}
