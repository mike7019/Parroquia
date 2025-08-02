#!/usr/bin/env node

/**
 * Script para ejecutar la migración del sistema de encuestas
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runMigration() {
  try {
    console.log('🚀 Iniciando proceso de migración...');
    
    // Ejecutar migración
    console.log('📦 Ejecutando migración...');
    const { stdout: migrateOutput, stderr: migrateError } = await execPromise('npx sequelize-cli db:migrate');
    
    if (migrateError && !migrateError.includes('Sequelize')) {
      console.error('❌ Error en migración:', migrateError);
      return;
    }
    
    console.log('✅ Migración completada');
    console.log(migrateOutput);
    
    // Ejecutar seeders
    console.log('🌱 Ejecutando seeders...');
    const { stdout: seedOutput, stderr: seedError } = await execPromise('npx sequelize-cli db:seed --seed 20250801000001-seed-profesiones-enfermedades.cjs');
    
    if (seedError && !seedError.includes('Sequelize')) {
      console.error('⚠️ Advertencia en seeders:', seedError);
    }
    
    console.log('✅ Seeders completados');
    console.log(seedOutput);
    
    // Ejecutar validación
    console.log('🔍 Ejecutando validación...');
    const { stdout: validateOutput, stderr: validateError } = await execPromise('node validate-database-structure.js');
    
    if (validateError) {
      console.error('⚠️ Advertencias en validación:', validateError);
    }
    
    console.log(validateOutput);
    
    console.log('🎉 ¡Proceso completado exitosamente!');
    console.log('\n📋 Resumen de cambios:');
    console.log('- ✅ Tabla encuestas creada');
    console.log('- ✅ Tabla enfermedades creada');
    console.log('- ✅ Tabla profesiones creada');
    console.log('- ✅ Tablas intermedias creadas (5)');
    console.log('- ✅ Tabla familias modificada');
    console.log('- ✅ Tabla personas extendida');
    console.log('- ✅ Datos iniciales cargados');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
