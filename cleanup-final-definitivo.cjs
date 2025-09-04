#!/usr/bin/env node

console.log('🧹 LIMPIEZA DEFINITIVA - ELIMINANDO ARCHIVOS NO DESEADOS');
console.log('======================================================');

const fs = require('fs');
const path = require('path');

let archivosEliminados = 0;

// Lista de archivos específicos a eliminar (que han reaparecido)
const archivosAEliminar = [
  // Archivos de ejecución del notebook
  'execute-notebook-cell1.cjs',
  'execute-notebook-cell2.cjs', 
  'execute-notebook-cell3.cjs',
  'execute-notebook-cell4.cjs',
  'execute-notebook-cell5.cjs',
  'execute-notebook-cell6.cjs',
  
  // Scripts de limpieza temporales
  'cleanup-project-final.js',
  'cleanup-test-files.cjs',
  'cleanup-ultra-final.cjs',
  'cleanup-duplicate-indexes.js',
  'final-cleanup.js',
  
  // Scripts de organización temporales
  'organize-seeders.cjs',
  
  // Scripts de validación temporales
  'validacion-database.cjs',
  'validacion-estructura.cjs', 
  'validacion-final.cjs',
  'validacion-temp.js',
  
  // Scripts de fix y análisis temporales
  'analyze-and-fix-foreign-keys.js',
  'analyze-repair-models.js',
  'apply-consolidation.js',
  'consolidate-models.js',
  'emergency-clean-indexes.js',
  'emergency-clean-indexes.sh',
  'fix-associations.js',
  'fix-catalog-tables.js',
  'fix-database-columns.js',
  'fix-database-dependencies.js',
  'fix-database-foreign-keys.js',
  'fix-long-indexes-definitivo.js',
  'fix-manual-conversions.js',
  'fix-sequelize-models.js',
  'list-models.js',
  'quick-fix-activo-column.js',
  'quick-fix-foreign-keys.js',
  
  // Scripts de sync temporales
  'sync-database-direct.js',
  'sync-database-enhanced.sh',
  'sync-database-fixed.sh', 
  'sync-database-linux.sh',
  'sync-database-windows.bat',
  'sync-database-windows.ps1',
  'sync-simple.sh',
  'windows-sync-db.cjs',
  
  // Scripts de test y validación
  'test-database-fix.js',
  'validate-and-consolidate-models.js',
  'validate-database-sync.js',
  'validate-models-complete.js'
];

console.log('\n🔍 Eliminando archivos específicos no deseados...');

// Función para eliminar archivo
function eliminarArchivo(archivo) {
  const rutaCompleta = path.join(__dirname, archivo);
  if (fs.existsSync(rutaCompleta)) {
    try {
      fs.unlinkSync(rutaCompleta);
      console.log(`   ❌ Eliminado: ${archivo}`);
      archivosEliminados++;
      return true;
    } catch (error) {
      console.log(`   ⚠️ Error eliminando ${archivo}: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Eliminar archivos específicos
archivosAEliminar.forEach(archivo => {
  eliminarArchivo(archivo);
});

console.log('\n📊 RESUMEN DE LIMPIEZA DEFINITIVA:');
console.log(`   ❌ Archivos eliminados: ${archivosEliminados}`);

console.log('\n✅ ARCHIVOS ESENCIALES QUE DEBEN MANTENERSE:');
console.log('   📁 src/ - Código fuente principal');
console.log('   📁 scripts/ - Scripts oficiales del proyecto');
console.log('   📁 seeders/ - Seeders del proyecto');
console.log('   📁 linux-scripts/ - Scripts de despliegue Linux');
console.log('   📄 package.json - Configuración optimizada');
console.log('   📄 package.json.backup - Respaldo');
console.log('   📄 runSeeders.js - Seeder principal');
console.log('   📄 seed-geographic-data.js - Datos geográficos');
console.log('   📄 seed-parroquias.js - Datos parroquias');
console.log('   📄 syncDatabase*.js - Scripts de sincronización DB');
console.log('   🐳 docker-compose.yml - Docker principal');
console.log('   📋 ecosystem.config.cjs - PM2');
console.log('   📝 gestion-scripts-npm.ipynb - Notebook principal');
console.log('   📝 test-encuesta-completa.ipynb - Notebook de test');
console.log('   📚 DOCUMENTACION_SCRIPTS_OPTIMIZADOS.md');
console.log('   📊 RESUMEN_EJECUTIVO.md');
console.log('   📄 .env* - Archivos de entorno');
console.log('   📄 nginx*.conf - Configuraciones nginx');

console.log('\n🎯 PROYECTO ULTRA LIMPIO DEFINITIVO');
console.log('   ✅ Solo archivos esenciales de producción');
console.log('   📦 Listo para clonación final en servidor');
console.log('   🚀 Sin archivos temporales ni de desarrollo');
