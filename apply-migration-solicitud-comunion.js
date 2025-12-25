#!/usr/bin/env node

/**
 * Script para aplicar migración de solicitud_comunion_casa
 * Ejecutar directamente en el servidor con: node apply-migration-solicitud-comunion.js
 * Fecha: 2025-12-25
 */

import { execSync } from 'child_process';

console.log('🚀 Aplicando migración: solicitud_comunion_casa');
console.log('================================================\n');

// Detectar nombre del contenedor automáticamente
let CONTAINER_NAME = 'parroquia-postgres-1';
const DB_USER = 'parroquia_user';
const DB_NAME = 'parroquia_db';

try {
  console.log('🔍 Buscando contenedor de PostgreSQL...');
  
  // Buscar contenedor que contenga 'postgres' en el nombre
  const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' })
    .split('\n')
    .filter(name => name.includes('postgres'));
  
  if (containers.length === 0) {
    console.error('❌ Error: No se encontró ningún contenedor de PostgreSQL corriendo');
    console.log('\nContenedores disponibles:');
    console.log(execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' }));
    process.exit(1);
  }
  
  CONTAINER_NAME = containers[0];
  console.log(`✅ Contenedor encontrado: ${CONTAINER_NAME}\n`);
  
} catch (error) {
  console.error('❌ Error al buscar contenedores:', error.message);
  process.exit(1);
}

const SQL_COMMAND = `
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS solicitud_comunion_casa BOOLEAN DEFAULT false;
`;

const VERIFY_QUERY = `
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'personas' AND column_name = 'solicitud_comunion_casa';
`;

try {
  console.log('🔧 Ejecutando ALTER TABLE...');
  
  // Ejecutar migración
  const migrateCommand = `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "${SQL_COMMAND}"`;
  
  const output = execSync(migrateCommand, { encoding: 'utf-8' });
  console.log(output);
  
  console.log('✅ Migración aplicada exitosamente\n');
  
  console.log('🔍 Verificando columna creada...');
  
  // Verificar columna
  const verifyCommand = `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "${VERIFY_QUERY}"`;
  
  const verifyOutput = execSync(verifyCommand, { encoding: 'utf-8' });
  console.log(verifyOutput);
  
  console.log('================================================');
  console.log('✅ Proceso completado exitosamente');
  console.log('================================================');
  
} catch (error) {
  console.error('\n❌ Error durante la ejecución:');
  console.error(error.message);
  
  if (error.stderr) {
    console.error('\nDetalles del error:');
    console.error(error.stderr.toString());
  }
  
  console.log('\n================================================');
  console.log('❌ La migración falló');
  console.log('================================================');
  
  process.exit(1);
}
