// Direct test of the service exports
console.log('Testing direct import...');

try {
  const serviceModule = await import('./src/services/catalog/sistemaAcueductoService.js');
  console.log('Available exports:', Object.keys(serviceModule));
  console.log('bulkCreateSistemasAcueducto type:', typeof serviceModule.bulkCreateSistemasAcueducto);
} catch (error) {
  console.error('Import error:', error.message);
  console.error('Full error:', error);
}
