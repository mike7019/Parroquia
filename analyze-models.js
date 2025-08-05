import fs from 'fs';
import path from 'path';

const modelsDir = 'src/models';
const catalogDir = 'src/models/catalog';

// Función para extraer información del modelo
function extractModelInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar tableName
    const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
    const tableName = tableNameMatch ? tableNameMatch[1] : null;
    
    // Buscar modelName
    const modelNameMatch = content.match(/modelName:\s*['"`]([^'"`]+)['"`]/) || 
                          content.match(/sequelize\.define\(['"`]([^'"`]+)['"`]/) ||
                          content.match(/class\s+(\w+)\s+extends\s+Model/);
    const modelName = modelNameMatch ? modelNameMatch[1] : null;
    
    // Detectar si es ES6 o CommonJS
    const isES6 = content.includes('import') || content.includes('export');
    const isCommonJS = content.includes('module.exports') || content.includes('require(');
    
    return {
      filePath,
      tableName,
      modelName,
      moduleType: isES6 ? 'ES6' : isCommonJS ? 'CommonJS' : 'Unknown',
      size: content.length
    };
  } catch (error) {
    return {
      filePath,
      error: error.message
    };
  }
}

// Obtener todos los archivos JS
function getAllJsFiles(dir) {
  const files = [];
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.js') && item !== 'index.js') {
        files.push(fullPath);
      }
    }
  }
  traverse(dir);
  return files;
}

console.log('🔍 ANÁLISIS DE MODELOS DUPLICADOS\n');

const allFiles = getAllJsFiles(modelsDir);
const modelInfos = allFiles.map(extractModelInfo);

// Agrupar por nombre de archivo base
const groupedByFileName = {};
modelInfos.forEach(info => {
  if (info.error) return;
  
  const fileName = path.basename(info.filePath);
  if (!groupedByFileName[fileName]) {
    groupedByFileName[fileName] = [];
  }
  groupedByFileName[fileName].push(info);
});

// Encontrar duplicados
const duplicates = Object.entries(groupedByFileName)
  .filter(([fileName, infos]) => infos.length > 1);

console.log('📋 DUPLICADOS ENCONTRADOS:\n');

duplicates.forEach(([fileName, infos]) => {
  console.log(`🔄 ${fileName}:`);
  infos.forEach((info, index) => {
    const location = info.filePath.includes('/catalog/') ? 'CATALOG' : 'MAIN';
    console.log(`  ${index + 1}. ${location}: ${info.filePath}`);
    console.log(`     - Table: ${info.tableName || 'N/A'}`);
    console.log(`     - Model: ${info.modelName || 'N/A'}`);
    console.log(`     - Type: ${info.moduleType}`);
    console.log(`     - Size: ${info.size} chars`);
  });
  console.log('');
});

// Modelos únicos
const uniqueModels = Object.entries(groupedByFileName)
  .filter(([fileName, infos]) => infos.length === 1)
  .map(([fileName, infos]) => infos[0]);

console.log('✅ MODELOS ÚNICOS:');
uniqueModels.forEach(info => {
  const location = info.filePath.includes('/catalog/') ? 'CATALOG' : 'MAIN';
  console.log(`  ${location}: ${path.basename(info.filePath)} -> ${info.tableName || 'N/A'}`);
});

console.log(`\n📊 RESUMEN:`);
console.log(`- Total archivos: ${modelInfos.filter(i => !i.error).length}`);
console.log(`- Duplicados: ${duplicates.length}`);
console.log(`- Únicos: ${uniqueModels.length}`);
