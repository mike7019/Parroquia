#!/usr/bin/env node

/**
 * Script para ejecutar todos los seeders de configuración
 * Incluyendo el nuevo seeder dinámico de departamentos y municipios
 */

import { 
  runConfigSeeders
} from './src/seeders/configSeeder.js';

async function runAllSeeders() {
  console.log('🌱 Iniciando ejecución de todos los seeders de configuración...\n');
  
  try {
    const results = await runConfigSeeders();
    
    console.log('\n🏁 Ejecución de seeders completada');
    console.log(`📊 Resumen: ${results.success}/${results.total} exitosos, ${results.errors} errores`);
    
    if (results.errors > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  }
}

// Ejecutar solo si este archivo es llamado directamente
const isMainModule = process.argv[1] && process.argv[1].endsWith('runSeeders.js');
if (isMainModule) {
  runAllSeeders().catch(error => {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  });
}

export default runAllSeeders;
