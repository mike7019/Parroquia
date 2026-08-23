#!/usr/bin/env node

/**
 * Punto de entrada único y seguro para sembrar catálogos.
 *
 * Ejecuta el sistema completo de seeders (configSeeder + profesiones +
 * tallas + catálogos adicionales) contra la base de datos configurada por
 * NODE_ENV/.env vía config/sequelize.js — nunca contra una IP hardcodeada.
 *
 * Deliberadamente NO siembra geografía específica de la parroquia
 * (parroquia, sector, vereda, corregimiento, centro poblado): esos datos
 * son propios de cada despliegue y se cargan manualmente desde la app.
 */

// Registra todos los modelos (Profesion, Talla, etc.) en la instancia
// compartida de Sequelize antes de que los seeders los usen vía
// sequelize.models — si no se importa, profesionesSeeder/tallasSeeder
// fallan con "Cannot read properties of undefined (reading 'count')".
import '../src/models/index.js';
import { runAllSeeders as runAllCatalogSeeders } from '../src/seeders/advancedSeeder.js';

async function runAllSeeders() {
  console.log('🌱 Iniciando ejecución de todos los seeders de catálogos...\n');

  try {
    const results = await runAllCatalogSeeders();

    console.log('\n🏁 Ejecución de seeders completada');
    console.log(`📊 Resumen: ${results.errores.length} errores`);

    if (results.errores.length > 0) {
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
