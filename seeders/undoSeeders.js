#!/usr/bin/env node

/**
 * Revierte (borra) todos los catálogos sembrados por `npm run db:seed`.
 * Útil para volver a probar la siembra desde cero en un entorno de desarrollo/test.
 * Respeta NODE_ENV/.env vía config/sequelize.js — nunca apunta a producción.
 */

import { cleanConfigData } from '../src/seeders/configSeeder.js';
import { cleanAdvancedData } from '../src/seeders/advancedSeeder.js';
import { cleanCatalogosAdicionales } from '../src/seeders/catalogosAdicionalesSeeder.js';

async function undoAllSeeders() {
  console.log('🧹 Revirtiendo todos los catálogos sembrados...\n');
  try {
    await cleanCatalogosAdicionales();
    await cleanAdvancedData();
    await cleanConfigData();
    console.log('\n🏁 Reversión completada');
  } catch (error) {
    console.error('💥 Error crítico:', error);
    process.exit(1);
  }
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('undoSeeders.js');
if (isMainModule) {
  undoAllSeeders();
}

export default undoAllSeeders;
