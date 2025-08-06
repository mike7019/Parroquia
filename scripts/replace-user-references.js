#!/usr/bin/env node

/**
 * Script para reemplazar todas las referencias de User por Usuario en archivos específicos
 */

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/services/authService.js',
  'src/services/surveyService.js',
  'src/services/reportService.js'
];

console.log('🔧 Reemplazando referencias de User por Usuario...\n');

for (const filePath of filesToUpdate) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    continue;
  }
  
  console.log(`📝 Procesando: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Contar reemplazos antes
  const beforeCount = (content.match(/User\./g) || []).length;
  
  // Reemplazar User. por Usuario. (solo métodos estáticos del modelo)
  content = content.replace(/User\./g, 'Usuario.');
  
  // También reemplazar referencias en imports si existen
  content = content.replace(/import.*\{\s*User\s*\}/g, (match) => {
    return match.replace(/User/g, 'Usuario');
  });
  
  // Contar después
  const afterCount = (content.match(/User\./g) || []).length;
  const replacements = beforeCount - afterCount;
  
  fs.writeFileSync(fullPath, content);
  
  console.log(`   ✅ ${replacements} reemplazos realizados`);
}

console.log('\n🎉 ¡Reemplazos completados!');
console.log('\n📝 Archivos actualizados para usar Usuario en lugar de User');
console.log('   - Todas las consultas ahora usan Usuario.findOne(), Usuario.findByPk(), etc.');
console.log('   - Los servicios mantienen consistencia con el nombre del modelo');
