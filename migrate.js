#!/usr/bin/env node

/**
 * Database Migration Runner
 * This script helps manage database migrations for the parroquia application
 */

const { exec } = require('child_process');
const path = require('path');

// Define available commands
const commands = {
  'create-db': 'npx sequelize-cli db:create',
  'migrate': 'npx sequelize-cli db:migrate',
  'migrate-undo': 'npx sequelize-cli db:migrate:undo',
  'migrate-undo-all': 'npx sequelize-cli db:migrate:undo:all',
  'seed': 'npx sequelize-cli db:seed:all',
  'drop-db': 'npx sequelize-cli db:drop'
};

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 ${description}...`);
    console.log(`📋 Ejecutando: ${command}\n`);
    
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`⚠️  Warning: ${stderr}`);
      }
      
      if (stdout) {
        console.log(stdout);
      }
      
      console.log(`✅ ${description} completado exitosamente!\n`);
      resolve();
    });
  });
}

async function main() {
  const action = process.argv[2];
  
  if (!action || !commands[action]) {
    console.log(`
🏗️  Script de Gestión de Base de Datos - Parroquia API

Uso: node migrate.js <comando>

Comandos disponibles:
  create-db        Crear la base de datos
  migrate          Ejecutar todas las migraciones pendientes
  migrate-undo     Deshacer la última migración
  migrate-undo-all Deshacer todas las migraciones
  seed             Ejecutar todos los seeders
  drop-db          Eliminar la base de datos

Ejemplos:
  node migrate.js create-db
  node migrate.js migrate
  node migrate.js migrate-undo
    `);
    process.exit(1);
  }

  try {
    const command = commands[action];
    let description;
    
    switch(action) {
      case 'create-db':
        description = 'Creando base de datos';
        break;
      case 'migrate':
        description = 'Ejecutando migraciones';
        break;
      case 'migrate-undo':
        description = 'Deshaciendo última migración';
        break;
      case 'migrate-undo-all':
        description = 'Deshaciendo todas las migraciones';
        break;
      case 'seed':
        description = 'Ejecutando seeders';
        break;
      case 'drop-db':
        description = 'Eliminando base de datos';
        break;
      default:
        description = 'Ejecutando comando';
    }
    
    await runCommand(command, description);
    
    if (action === 'migrate') {
      console.log(`
🎉 ¡Migraciones completadas con éxito!

Las siguientes tablas han sido creadas en tu base de datos:
- tipo_identificacion
- estado_civil  
- parroquia
- tipo_vivienda
- parentesco
- sexo
- sistemas_acueducto
- tipos_disposicion_basura
- tipos_aguas_residuales
- personas (con relaciones)
- usuarios
- familias
- liderazgos
- areas_liderazgo
- comunidades_culturales
- niveles_educativos
- talla_vestimenta
- municipios
- veredas
- sector
- destrezas
- roles
- enfermedades
- difuntos_familia
- celebraciones_padre_madre
- celebraciones_personales
- celebraciones_familia
- necesidades_enfermo
- enfermedades_persona

Ahora puedes usar tu API con estas tablas creadas.
      `);
    }
    
  } catch (error) {
    console.error('❌ Error ejecutando el comando:', error.message);
    process.exit(1);
  }
}

main();
