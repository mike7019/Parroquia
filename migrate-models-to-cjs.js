/**
 * Script para migrar modelos de ES6 (catalog/) a CommonJS (main/)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogDir = path.join(__dirname, 'src', 'models', 'catalog');
const mainDir = path.join(__dirname, 'src', 'models', 'main');

// Archivos que necesitan migrarse
const filesToMigrate = [
  'CentrosPoblados.js',
  'Corregimientos.js',
  'Departamentos.js',
  'DifuntosFamilia.js',
  'Estudio.js',
  'Familias.js',
  'Habilidad.js',
  'Municipios.js',
  'Parentesco.js',
  'PersonaHabilidad.js',
  'Sector.js',
  'SituacionCivil.js',
  'Veredas.js'
];

// Función para convertir ES6 a CommonJS
function convertToCommonJS(content, modelName) {
  // Remover imports de sequelize
  let converted = content.replace(/import\s+{\s*DataTypes\s*}\s+from\s+['"]sequelize['"];?\s*/g, '');
  converted = converted.replace(/import\s+sequelize\s+from\s+['"].*?['"];?\s*/g, '');
  
  // Convertir sequelize.define a class extends Model
  const defineRegex = /const\s+(\w+)\s*=\s*sequelize\.define\(['"](\w+)['"],\s*{([\s\S]*?)},\s*{([\s\S]*?)}\);/;
  const match = converted.match(defineRegex);
  
  if (!match) {
    console.error(`❌ No se pudo parsear ${modelName}`);
    return null;
  }
  
  const [, varName, , fields, options] = match;
  
  // Extraer tableName y timestamps
  const tableNameMatch = options.match(/tableName:\s*['"](\w+)['"]/);
  const tableName = tableNameMatch ? tableNameMatch[1] : modelName.toLowerCase();
  
  // Construir clase CommonJS
  const classCode = `'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ${varName} extends Model {
    static associate(models) {
      // Asociaciones definidas en index.js
    }
  }

  ${varName}.init({${fields}}, {
    sequelize,
    modelName: '${varName}',
    tableName: '${tableName}',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return ${varName};
};
`;
  
  return classCode;
}

// Migrar archivos
console.log('🚀 Iniciando migración de modelos...\n');

for (const file of filesToMigrate) {
  const sourcePath = path.join(catalogDir, file);
  const targetPath = path.join(mainDir, file.replace('.js', '.cjs'));
  
  try {
    // Leer archivo fuente
    const content = fs.readFileSync(sourcePath, 'utf8');
    const modelName = file.replace('.js', '');
    
    // Convertir a CommonJS
    const converted = convertToCommonJS(content, modelName);
    
    if (converted) {
      // Escribir archivo destino
      fs.writeFileSync(targetPath, converted);
      console.log(`✅ Migrado: ${file} → ${modelName}.cjs`);
    }
  } catch (error) {
    console.error(`❌ Error migrando ${file}:`, error.message);
  }
}

console.log('\n✅ Migración completada');
