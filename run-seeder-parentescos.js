/**
 * Script simple para ejecutar el seeder de parentescos
 * Ejecuta: node run-seeder-parentescos.js
 */

import seedParentescos from './seed-parentescos.js';

console.log('🚀 Ejecutando seeder de Parentescos...');
console.log('=====================================');

try {
  await seedParentescos();
  console.log('✅ Seeder ejecutado correctamente');
} catch (error) {
  console.error('❌ Error ejecutando seeder:', error.message);
  process.exit(1);
}
