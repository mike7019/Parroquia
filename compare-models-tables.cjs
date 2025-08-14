const { connectToDatabase, sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function compareModelsAndTables() {
  try {
    console.log('🔍 Comparando modelos con tablas en la base de datos...\n');
    
    // Conectar a la base de datos
    await connectToDatabase();
    
    // Obtener todas las tablas de la base de datos
    const [dbTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Base de datos tiene ${dbTables.length} tablas:`);
    dbTables.forEach(table => console.log(`  - ${table.table_name}`));
    console.log('');
    
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
          
          // Verificar si la tabla existe en la base de datos
          const tableExists = dbTables.some(t => t.table_name === tableName);
          if (!tableExists) {
            problems.push({
              type: 'MISSING_TABLE',
              model: modelName,
              tableName: tableName,
              description: `Modelo define tabla "${tableName}" que no existe en BD`
            });
          }
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
    modelTables.forEach(model => console.log(`  - ${model.file} → ${model.tableName}`));
    console.log('');
    
    // Buscar tablas huérfanas (en BD pero sin modelo)
    const modelTableNames = modelTables.map(m => m.tableName);
    const orphanTables = dbTables.filter(t => !modelTableNames.includes(t.table_name));
    
    if (orphanTables.length > 0) {
      console.log(`🔍 Tablas huérfanas (sin modelo correspondiente):`);
      orphanTables.forEach(table => {
        console.log(`  - ${table.table_name}`);
        problems.push({
          type: 'ORPHAN_TABLE',
          tableName: table.table_name,
          description: `Tabla existe en BD pero no tiene modelo`
        });
      });
      console.log('');
    }
    
    // Mostrar problemas encontrados
    if (problems.length > 0) {
      console.log(`⚠️  Problemas encontrados (${problems.length}):`);
      problems.forEach((problem, index) => {
        console.log(`${index + 1}. [${problem.type}] ${problem.description}`);
        if (problem.model) console.log(`   📄 Archivo: ${problem.model}`);
        if (problem.tableName) console.log(`   🗂️  Tabla: ${problem.tableName}`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron problemas de sincronización');
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`  - Tablas en BD: ${dbTables.length}`);
    console.log(`  - Modelos con tableName: ${modelTables.length}`);
    console.log(`  - Problemas encontrados: ${problems.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
compareModelsAndTables();
