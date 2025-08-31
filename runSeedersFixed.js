#!/usr/bin/env node

/**
 * Script para ejecutar seeders con modelos cargados correctamente
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar modelos primero
const modelsPath = join(__dirname, 'src', 'models', 'index.js');

async function runSeedersWithModels() {
  try {
    console.log('🔧 Cargando modelos...');
    
    // Importar modelos para inicializar la base de datos
    await import('./src/models/index.js');
    console.log('✅ Modelos cargados correctamente');
    
    console.log('🌱 Ejecutando seeders...');
    
    // Importar y ejecutar seeders
    const { runConfigSeeders } = await import('./src/seeders/configSeeder.js');
    const results = await runConfigSeeders();
    
    console.log('🏁 Seeders completados');
    console.log(`📊 Resumen: ${results.success}/${results.total} exitosos, ${results.errors} errores`);
    
    if (results.errors > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runSeedersWithModels();
