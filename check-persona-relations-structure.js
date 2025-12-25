#!/usr/bin/env node

/**
 * Script para verificar estructura de tablas de relaciones persona
 * Ejecutar con: node check-persona-relations-structure.js
 */

import { execSync } from 'child_process';

console.log('🔍 Verificando estructura de tablas de relaciones de personas\n');
console.log('='.repeat(70));

// Detectar contenedor de PostgreSQL
let CONTAINER_NAME;
try {
  const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' })
    .split('\n')
    .filter(name => name.includes('postgres'));
  
  if (containers.length === 0) {
    console.error('❌ No se encontró contenedor de PostgreSQL');
    process.exit(1);
  }
  
  CONTAINER_NAME = containers[0];
  console.log(`✅ Usando contenedor: ${CONTAINER_NAME}\n`);
} catch (error) {
  console.error('❌ Error al buscar contenedor:', error.message);
  process.exit(1);
}

const DB_USER = 'parroquia_user';
const DB_NAME = 'parroquia_db';

const tables = [
  'persona_habilidad',
  'persona_destreza',
  'persona_celebracion',
  'persona_enfermedad'
];

for (const table of tables) {
  console.log(`\n📋 Tabla: ${table}`);
  console.log('-'.repeat(70));
  
  try {
    const query = `\\d ${table}`;
    const cmd = `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "${query}"`;
    
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log(output);
    
  } catch (error) {
    console.error(`❌ Error al consultar ${table}:`, error.message);
  }
}

console.log('='.repeat(70));
console.log('✅ Verificación completada\n');
