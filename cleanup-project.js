#!/usr/bin/env node

/**
 * Script de limpieza del proyecto
 * Elimina archivos de prueba, debug y temporales que ya no son necesarios
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Archivos y patrones a eliminar
const filesToDelete = [
  // Archivos de prueba específicos
  'add-comunion-en-casa-column.js',
  'add-test-difuntos.js',
  'analisis-profundo-destrezas.js',
  'check-capacidades-tables.mjs',
  'check-departamentos-columns.mjs',
  'check-difuntos-estructura.js',
  'check-difuntos-sequence.js',
  'check-difuntos-structure.js',
  'check-estructura-infraestructura.mjs',
  'check-familias-columns-temp.js',
  'check-familias-columns.mjs',
  'check-familias-structure.cjs',
  'check-familias-table.js',
  'check-infraestructura.mjs',
  'check-municipios-schema.js',
  'check-parroquia-estructura.js',
  'check-parroquia-table.js',
  'check-persona-destreza.js',
  'check-personas-table.js',
  'check-sistemas-acueducto.js',
  'check-tables-structure.js',
  'check-tables.js',
  'check-ubicacion-tables.mjs',
  'correct-sequence.js',
  'create-familias-sequence.js',
  'create-test-user.js',
  
  // Archivos de debug
  'debug-difuntos-service.js',
  'debug-familia-valida.ps1',
  'debug-familias-service.js',
  'debug-municipio-associations.js',
  'debug-reportes-simple.js',
  'debug-simple.ps1',
  
  // Scripts de deploy temporales
  'deploy-comunion-fix.sh',
  'deploy-database-sync.ps1',
  'deploy-database-sync.sh',
  'deploy-enhanced-validation.sh',
  'deploy-familias-fix.ps1',
  'deploy-familias-fix.sh',
  'deploy-instructions.sh',
  'deploy-to-server-fixed.sh',
  'deploy-to-server.ps1',
  'deploy-to-server.sh',
  
  // Archivos de diagnóstico
  'diagnosticar-familia.cjs',
  'diagnosticar-familia.js',
  'ejemplo-sector-creation.js',
  'endpoint-debug.js',
  'ensure-sequence-sync.js',
  'find-comunion-field.js',
  'find-structure-issue.mjs',
  
  // Fix scripts temporales
  'fix-associations.mjs',
  'fix-encuestas-endpoint.js',
  'fix-endpoint.sh',
  'fix-familias-sequence-model.js',
  'fix-familias-sequence.js',
  'fix-parroquia-table.js',
  'fix-production-comunion.sh',
  'fix-sector-data.js',
  'fix-sequence-simple.js',
  'fix-server-urgent.ps1',
  'fix-server-urgent.sh',
  'fix-to-66.js',
  'force-associations-test.js',
  
  // Archivos de investigación
  'inspect-and-seed.js',
  'investigate-response.js',
  
  // Notebooks de prueba
  'model-associations-analysis.ipynb',
  'municipio-veredas-association-fix.ipynb',
  'municipios-bulk-creation-guide.ipynb',
  'test-encuesta-completa.ipynb',
  
  // Scripts de check pre-deployment
  'pre-deployment-check-simple.ps1',
  'pre-deployment-check.ps1',
  'pre-deployment-check.sh',
  
  // Archivos de prueba específicos
  'probar-descarga-mejorada.js',
  'probar-todas-rutas.js',
  'prueba-encuesta-absoluta.js',
  'prueba-integridad-final.js',
  'prueba-validacion-completa.js',
  'prueba-validacion-final.js',
  
  // Quick scripts
  'quick-db-check.js',
  'quick-deploy.sh',
  'quick-sync-db.sh',
  'reactivate-admin.mjs',
  
  // Seeders temporales
  'runSeeders.js',
  'seed-basic-data.js',
  'seed-using-models.js',
  
  // Show scripts
  'show-familias-table.js',
  'simple-server.js',
  
  // Swagger verification
  'swagger-example-verification.js',
  'swagger-update-summary.js',
  
  // Sync scripts temporales
  'sync-database-server.ps1',
  'sync-database-server.sh',
  'sync-direct.mjs',
  'sync-familias-comunion.js',
  'sync-familias-model-fix.js',
  'sync-familias-model.js',
  'sync-models.js',
  'sync-sector-model.js',
  'syncDatabaseComplete.js',
  
  // Update scripts
  'update-test-user.js',
  
  // Validation scripts
  'validar-destrezas-corregidas.js',
  'validate-swagger.mjs',
  'verificar-simple.js',
  'verify-database-sync.mjs',
  'verify-no-id-sector.ps1',
  'verify-no-id-sector.sh',
  'verify-post-deployment.cjs',
  'verify-pre-deploy.js',
  'verify-sector-municipios.js',
  'verify-swagger-schemas.cjs',
  
  // Archivos corrupted
  'src/services/familiasConsultasService.corrupted.js',
];

// Archivos de test (todos los que empiecen con test-)
const testFiles = [
  'test-all-endpoints.ps1',
  'test-api-endpoints-associations.js',
  'test-associations-departamentos-municipios.js',
  'test-associations.js',
  'test-bulk-municipios.js',
  'test-capacidades-endpoints.ps1',
  'test-capacidades-simple.ps1',
  'test-complete-system.js',
  'test-comunion-en-casa.js',
  'test-comunion-encuesta.js',
  'test-comunion-endpoint.ps1',
  'test-comunion-query.js',
  'test-consultas.js',
  'test-controlador-final.js',
  'test-corrected-bulk-request.js',
  'test-database-direct.cjs',
  'test-delete-endpoint.ps1',
  'test-destrezas-complete.js',
  'test-destrezas-final.js',
  'test-destrezas-routes.js',
  'test-destrezas-service.js',
  'test-destrezas-simple.js',
  'test-diagnostico-duplicados.ps1',
  'test-difuntos-detallado.ps1',
  'test-difuntos-endpoints.js',
  'test-difuntos-simple.js',
  'test-duplicate-prevention.js',
  'test-duplicate-validation.sh',
  'test-encuesta-creation.cjs',
  'test-encuesta-creation.js',
  'test-encuesta-endpoint.ps1',
  'test-encuesta-final.cjs',
  'test-encuesta-mia.js',
  'test-encuesta-real.json',
  'test-encuesta-with-auth.cjs',
  'test-encuesta.json',
  'test-encuestas-endpoints.ps1',
  'test-encuestas-mejoradas.js',
  'test-encuestas-simple.ps1',
  'test-endpoint-completo.js',
  'test-endpoint-encuesta.js',
  'test-endpoints-manual.js',
  'test-endpoints-simple.ps1',
  'test-enhanced-duplicate-validation.sh',
  'test-estudio-fix.js',
  'test-familia-fix.js',
  'test-familia-simple.ps1',
  'test-familias-db.js',
  'test-familias-insertion.js',
  'test-filtros-queries.mjs',
  'test-final-associations.js',
  'test-final-completo.ps1',
  'test-final-report.md',
  'test-force-associations.js',
  'test-identificacion-validation.mjs',
  'test-imports-destrezas.js',
  'test-insercion-completa.js',
  'test-integral-destrezas.js',
  'test-loadallmodels.js',
  'test-login-simple.ps1',
  'test-minimal-server.js',
  'test-modelo-destreza.js',
  'test-models-loading.js',
  'test-municipio-service.js',
  'test-parroquias-completo.ps1',
  'test-parroquias-endpoint.js',
  'test-parroquias-endpoint.ps1',
  'test-parroquias-fixed.ps1',
  'test-sector-complete.js',
  'test-sector-model-fix.js',
  'test-sector-municipio.js',
  'test-sectors-complete.js',
  'test-server-connection.cjs',
  'test-server-start.js',
  'test-servicio-completo.js',
  'test-simple-association.js',
  'test-simple-difuntos.js',
  'test-simple-duplicate.sh',
  'test-simple-endpoint.js',
  'test-simple.ps1',
  'test-sistema-completo.js',
  'test-specific-associations.js',
  'test-token-expiry.mjs',
  'test-validacion-final-definitivo.ps1',
  'test-validacion-final.ps1',
  'test-validacion-miembros-endpoint.ps1',
  'test-validacion-miembros-unicos.js',
  'test-validacion-simple.ps1',
  'test-vereda-service-final.js',
  'test-veredas-association-fix.js',
  'test-veredas-final.js',
  'test-veredas-post-deploy.ps1',
  'test-veredas-post-deploy.sh',
  'test-with-auth.js',
];

// Directorios temporales a eliminar (si están vacíos o contienen solo archivos temporales)
const tempDirectories = [
  'temp-archive',
  'test_reports',
  'reportes_generados'
];

// Función para eliminar archivo
function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Eliminado: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error eliminando ${filePath}:`, error.message);
    return false;
  }
}

// Función para eliminar directorio
function deleteDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🗂️ Eliminado directorio: ${path.basename(dirPath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error eliminando directorio ${dirPath}:`, error.message);
    return false;
  }
}

// Ejecutar limpieza
function cleanupProject() {
  console.log('🧹 Iniciando limpieza del proyecto...\n');
  
  let deletedFiles = 0;
  let deletedDirs = 0;
  
  console.log('📁 Eliminando archivos de prueba y temporales...');
  
  // Eliminar archivos específicos
  const allFilesToDelete = [...filesToDelete, ...testFiles];
  
  allFilesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (deleteFile(filePath)) {
      deletedFiles++;
    }
  });
  
  console.log('\n🗂️ Eliminando directorios temporales...');
  
  // Eliminar directorios temporales
  tempDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (deleteDirectory(dirPath)) {
      deletedDirs++;
    }
  });
  
  console.log('\n📊 Resumen de la limpieza:');
  console.log(`✅ Archivos eliminados: ${deletedFiles}`);
  console.log(`🗂️ Directorios eliminados: ${deletedDirs}`);
  console.log('\n🎉 ¡Limpieza completada!');
  
  // Mostrar archivos importantes que se mantienen
  console.log('\n📋 Archivos importantes que se mantienen:');
  const importantFiles = [
    'package.json',
    'package-lock.json',
    'docker-compose.yml',
    'Dockerfile',
    '.env.production.example',
    '.gitignore',
    'README.md',
    'ecosystem.config.cjs',
    'jenkinsfile'
  ];
  
  importantFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${file}`);
    }
  });
  
  console.log('\n📁 Directorios del proyecto que se mantienen:');
  const importantDirs = [
    'src/',
    'config/',
    'migrations/',
    'seeders/',
    'docs/',
    'scripts/',
    '.github/',
    'postman/',
    'jenkins/'
  ];
  
  importantDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`✓ ${dir}`);
    }
  });
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${__filename}`) {
  cleanupProject();
}

export default cleanupProject;
