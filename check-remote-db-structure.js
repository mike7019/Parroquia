#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('🔍 Verificando estructura de base de datos REMOTA');
console.log('======================================================================');

const remoteHost = '206.62.139.100';
const remotePort = '5433';
const dbUser = 'parroquia_user';
const dbName = 'parroquia_db';

console.log(`\n📡 Conectando a: ${remoteHost}:${remotePort}`);
console.log(`   Base de datos: ${dbName}`);
console.log(`   Usuario: ${dbUser}\n`);

// Tablas a verificar
const tables = [
  'persona_habilidad',
  'persona_destreza', 
  'persona_celebracion',
  'persona_enfermedad'
];

for (const table of tables) {
  console.log(`\n📋 Tabla: ${table}`);
  console.log('----------------------------------------------------------------------');
  
  try {
    const command = `psql -h ${remoteHost} -p ${remotePort} -U ${dbUser} -d ${dbName} -c "\\d ${table}"`;
    
    const result = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' }
    });
    
    console.log(result);
  } catch (error) {
    console.error(`❌ Error al consultar tabla ${table}:`);
    console.error(error.message);
    if (error.stderr) {
      console.error('STDERR:', error.stderr.toString());
    }
  }
}

console.log('\n======================================================================');
console.log('✅ Verificación completada');
