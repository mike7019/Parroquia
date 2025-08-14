const fs = require('fs');
const path = require('path');

async function compareModelsAndTables() {
  try {
    console.log('🔍 Analizando modelos en el proyecto...\n');
    
    // Buscar todos los archivos de modelos
    const modelsDir = path.join(__dirname, 'src', 'models');
    const modelFiles = [];
    
    function findModelFiles(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          findModelFiles(fullPath);
        } else if (file.endsWith('.cjs') || file.endsWith('.js')) {
          modelFiles.push(fullPath);
        }
      }
    }
    
    findModelFiles(modelsDir);
    
    console.log(`📁 Encontrados ${modelFiles.length} archivos de modelos\n`);
    
    // Analizar cada modelo para extraer tableName
    const modelTables = [];
    const problems = [];
    
    for (const modelFile of modelFiles) {
      try {
        const content = fs.readFileSync(modelFile, 'utf8');
        
        // Buscar tableName en el contenido
        const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
        if (tableNameMatch) {
          const tableName = tableNameMatch[1];
          const modelName = path.basename(modelFile);
          
          modelTables.push({
            file: modelName,
            path: modelFile,
            tableName: tableName
          });
          
        } else {
          const modelName = path.basename(modelFile);
          if (!modelName.includes('index') && !modelName.includes('associations')) {
            problems.push({
              type: 'NO_TABLE_NAME',
              model: modelName,
              description: `Modelo no define tableName explícito`
            });
          }
        }
      } catch (error) {
        console.log(`❌ Error leyendo ${modelFile}: ${error.message}`);
      }
    }
    
    console.log(`📋 Modelos encontrados con tableName:`);
    modelTables.sort((a, b) => a.tableName.localeCompare(b.tableName));
    modelTables.forEach(model => console.log(`  - ${model.file} → ${model.tableName}`));
    console.log('');
    
    // Mostrar problemas encontrados
    if (problems.length > 0) {
      console.log(`⚠️  Problemas encontrados (${problems.length}):`);
      problems.forEach((problem, index) => {
        console.log(`${index + 1}. [${problem.type}] ${problem.description}`);
        if (problem.model) console.log(`   📄 Archivo: ${problem.model}`);
        console.log('');
      });
    } else {
      console.log('✅ Todos los modelos tienen tableName definido');
    }
    
    console.log(`\n📊 Resumen de modelos:`);
    console.log(`  - Archivos de modelos: ${modelFiles.length}`);
    console.log(`  - Modelos con tableName: ${modelTables.length}`);
    console.log(`  - Problemas encontrados: ${problems.length}`);
    
    console.log(`\n📝 Para comparar con la base de datos, usa:`);
    console.log(`   1. Conecta con MCP postgres para ver las tablas del servidor`);
    console.log(`   2. Compara las tablas listadas arriba con las del servidor`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar
compareModelsAndTables();
