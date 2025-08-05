import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createRequire } from 'module';

// Crear require para módulos CommonJS
const require = createRequire(import.meta.url);

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar modelos principales (ES6)
import './src/models/index.js';

// Función para cargar modelos CommonJS desde la carpeta main
async function loadMainModels() {
  const mainModelsPath = join(__dirname, 'src', 'models', 'main');
  const files = fs.readdirSync(mainModelsPath);
  
  const models = {};
  
  for (const file of files) {
    if (file.endsWith('.cjs') && file !== 'index.js') {
      try {
        const modelPath = join(mainModelsPath, file);
        console.log(`📦 Cargando modelo: ${file}`);
        
        // Limpiar cache si existe
        delete require.cache[require.resolve(modelPath)];
        
        // Importar el modelo usando require
        const modelDefiner = require(modelPath);
        
        if (typeof modelDefiner === 'function') {
          const model = modelDefiner(sequelize, sequelize.constructor.DataTypes);
          models[model.name] = model;
          
          // Registrar el modelo en Sequelize
          sequelize.models[model.name] = model;
          
          console.log(`✅ Modelo ${model.name} cargado correctamente`);
        }
      } catch (error) {
        console.warn(`⚠️  No se pudo cargar el modelo ${file}:`, error.message);
      }
    }
  }
  
  // Configurar asociaciones para los modelos main
  console.log('\n🔗 Configurando asociaciones...');
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      try {
        // Pasar todos los modelos (tanto de catalog como de main)
        const allModels = { ...sequelize.models, ...models };
        models[modelName].associate(allModels);
        console.log(`✅ Asociaciones configuradas para ${modelName}`);
      } catch (error) {
        console.warn(`⚠️  Error configurando asociaciones para ${modelName}:`, error.message);
      }
    }
  });
  
  return models;
}

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronización completa de la base de datos...');
    console.log('📋 Incluyendo modelos de las carpetas: catalog, main y raíz');
    
    // Cargar modelos de la carpeta main
    console.log('\n📦 Cargando modelos de la carpeta main...');
    const mainModels = await loadMainModels();
    
    console.log('\n📊 Lista de todos los modelos registrados:');
    const allModels = sequelize.models;
    Object.keys(allModels).forEach(modelName => {
      console.log(`  - ${modelName}`);
    });
    
    console.log(`\n📈 Total de modelos: ${Object.keys(allModels).length}`);
    
    // Sincronización básica (no elimina datos existentes)
    console.log('\n🔄 Sincronizando modelos con la base de datos...');
    await sequelize.sync();
    console.log('✅ Base de datos sincronizada correctamente');
    
    // Mostrar tablas creadas/verificadas usando QueryTypes.SELECT
    try {
      const results = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
        { type: QueryTypes.SELECT }
      );
      
      console.log('\n📋 Tablas en la base de datos:');
      if (results && results.length > 0) {
        results.forEach(row => {
          if (row.table_name) {
            console.log(`  - ${row.table_name}`);
          }
        });
        console.log(`\n🎯 Total de tablas: ${results.length}`);
      } else {
        console.log('  - No se encontraron tablas, intentando consulta alternativa...');
        
        // Consulta alternativa para verificar
        const altResults = await sequelize.query(
          "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
          { type: QueryTypes.SELECT }
        );
        
        if (altResults && altResults.length > 0) {
          console.log('\n📋 Tablas (consulta alternativa):');
          altResults.forEach(row => {
            if (row.tablename) {
              console.log(`  - ${row.tablename}`);
            }
          });
          console.log(`\n🎯 Total de tablas: ${altResults.length}`);
        } else {
          console.log('  - No se pudieron obtener las tablas');
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo las tablas:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Opción para sincronización con alter (modifica tablas existentes)
async function syncDatabaseWithAlter() {
  try {
    console.log('🔄 Iniciando sincronización con ALTER...');
    await loadMainModels();
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada con ALTER');
  } catch (error) {
    console.error('❌ Error al sincronizar con ALTER:', error);
  } finally {
    await sequelize.close();
  }
}

// Opción para sincronización con force (RECREAR TABLAS - ELIMINA DATOS)
async function syncDatabaseWithForce() {
  try {
    console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos existentes');
    console.log('🔄 Iniciando sincronización con FORCE...');
    await loadMainModels();
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada completamente');
  } catch (error) {
    console.error('❌ Error al sincronizar con FORCE:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar según argumentos de línea de comandos
const args = process.argv.slice(2);
const mode = args[0] || 'basic';

switch (mode) {
  case 'alter':
    syncDatabaseWithAlter();
    break;
  case 'force':
    syncDatabaseWithForce();
    break;
  case 'basic':
  default:
    syncDatabase();
    break;
}

export { syncDatabase, syncDatabaseWithAlter, syncDatabaseWithForce };
