// Test import to verify exports
import {
  createSistemaAcueducto,
  bulkCreateSistemasAcueducto
} from './src/services/catalog/sistemaAcueductoService.js';

console.log('Simple import successful!');
console.log('createSistemaAcueducto:', typeof createSistemaAcueducto);
console.log('bulkCreateSistemasAcueducto:', typeof bulkCreateSistemasAcueducto);
