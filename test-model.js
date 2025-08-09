// Test just the imports
try {
  console.log('Testing model import...');
  import('./src/models/catalog/SistemaAcueducto.js')
    .then(module => {
      console.log('Model loaded successfully:', typeof module.default);
    })
    .catch(error => {
      console.error('Error loading model:', error.message);
    });
} catch (error) {
  console.error('Sync error:', error);
}
