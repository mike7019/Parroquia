#!/usr/bin/env node

/**
 * Script para probar solo el seeder dinámico de departamentos
 */

import { seedDepartamentos } from './src/seeders/configSeeder.js';

async function testDepartamentosSeeder() {
  console.log('🧪 Probando seeder dinámico de departamentos...\n');
  
  try {
    const startTime = Date.now();
    const result = await seedDepartamentos();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n✅ Seeder completado en ${duration}ms`);
    console.log('📊 Resultado:', result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDepartamentosSeeder();
