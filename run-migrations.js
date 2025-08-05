/**
 * Script para ejecutar migraciones de base de datos
 * Uso: node run-migrations.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function checkMigrationFiles() {
  try {
    const migrationsPath = path.join(process.cwd(), 'migrations');
    const files = await fs.readdir(migrationsPath);
    const migrationFiles = files.filter(file => file.endsWith('.cjs')).sort();
    
    console.log('📁 Archivos de migración encontrados:');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    return migrationFiles.length;
  } catch (error) {
    console.error('❌ Error al leer archivos de migración:', error.message);
    return 0;
  }
}

async function checkMigrationStatus() {
  try {
    console.log('🔍 Verificando estado de migraciones...');
    const { stdout } = await execAsync('npx sequelize-cli db:migrate:status');
    console.log(stdout);
  } catch (error) {
    console.log('⚠️  No se pudo verificar el estado. Es posible que sea la primera ejecución.');
  }
}

async function runMigrations() {
  try {
    console.log('🚀 Ejecutando migraciones...');
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:migrate');
    
    if (stdout) {
      console.log('✅ Salida de migraciones:');
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('Sequelize CLI')) {
      console.log('⚠️  Advertencias/Errores:');
      console.log(stderr);
    }
    
    console.log('✅ Migraciones ejecutadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    if (error.stdout) {
      console.log('Salida:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error:', error.stderr);
    }
    return false;
  }
}

async function runSeeders() {
  try {
    console.log('🌱 Ejecutando seeders...');
    const { stdout, stderr } = await execAsync('npx sequelize-cli db:seed:all');
    
    if (stdout) {
      console.log('✅ Salida de seeders:');
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('Sequelize CLI')) {
      console.log('⚠️  Advertencias/Errores:');
      console.log(stderr);
    }
    
    console.log('✅ Seeders ejecutados exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al ejecutar seeders:', error.message);
    if (error.stdout) {
      console.log('Salida:', error.stdout);
    }
    if (error.stderr) {
      console.log('Error:', error.stderr);
    }
    return false;
  }
}

async function main() {
  console.log('🔧 Iniciando configuración de base de datos...\n');
  
  // Verificar archivos de migración
  const migrationCount = await checkMigrationFiles();
  if (migrationCount === 0) {
    console.log('❌ No se encontraron archivos de migración.');
    process.exit(1);
  }
  
  console.log(`\n📊 Total de migraciones: ${migrationCount}\n`);
  
  // Verificar estado actual
  await checkMigrationStatus();
  
  console.log('\n' + '='.repeat(50));
  
  // Ejecutar migraciones
  const migrationsSuccess = await runMigrations();
  
  if (migrationsSuccess) {
    console.log('\n' + '='.repeat(50));
    
    // Ejecutar seeders
    await runSeeders();
    
    console.log('\n🎉 Configuración de base de datos completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Verificar que las tablas se crearon correctamente');
    console.log('   2. Ejecutar npm run admin:create para crear el usuario administrador');
    console.log('   3. Iniciar la aplicación con npm start');
  } else {
    console.log('\n❌ La configuración de base de datos falló. Revisa los errores anteriores.');
    process.exit(1);
  }
}

// Ejecutar el script
main().catch(error => {
  console.error('❌ Error inesperado:', error);
  process.exit(1);
});
