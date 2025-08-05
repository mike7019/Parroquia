import fs from 'fs';
import path from 'path';

const catalogDir = 'src/models/catalog';

// Función para validar un modelo de catálogo
function validateCatalogModel(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.js');
    
    // Extraer información del modelo
    const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
    const tableName = tableNameMatch ? tableNameMatch[1] : null;
    
    const modelNameMatch = content.match(/modelName:\s*['"`]([^'"`]+)['"`]/) || 
                          content.match(/sequelize\.define\(['"`]([^'"`]+)['"`]/);
    const modelName = modelNameMatch ? modelNameMatch[1] : null;
    
    // Verificar estructura ES6
    const hasImport = content.includes('import');
    const hasExportDefault = content.includes('export default');
    const hasSequelizeImport = content.includes("from '../../../config/sequelize.js'");
    
    // Verificar definición de primary key
    const hasPrimaryKey = content.includes('primaryKey: true');
    
    // Verificar timestamps
    const timestampsMatch = content.match(/timestamps:\s*(true|false)/);
    const timestamps = timestampsMatch ? timestampsMatch[1] === 'true' : null;
    
    // Verificar si tiene validaciones
    const hasValidations = content.includes('validate:') || content.includes('allowNull:');
    
    // Verificar campos comunes
    const hasId = content.includes('id') || content.includes('_id');
    const hasNombre = content.includes('nombre');
    const hasDescripcion = content.includes('descripcion');
    
    // Detectar problemas potenciales
    const issues = [];
    
    if (!hasImport || !hasExportDefault) {
      issues.push('❌ No es módulo ES6 completo');
    }
    
    if (!hasSequelizeImport) {
      issues.push('❌ Import de sequelize incorrecto');
    }
    
    if (!hasPrimaryKey) {
      issues.push('⚠️ No tiene primary key definida');
    }
    
    if (modelName !== fileName) {
      issues.push(`⚠️ Nombre del modelo (${modelName}) no coincide con archivo (${fileName})`);
    }
    
    // Verificar convenciones de nombres de tabla
    const expectedTableName = fileName.toLowerCase();
    if (tableName && tableName !== expectedTableName && tableName !== expectedTableName + 's') {
      issues.push(`⚠️ Nombre de tabla (${tableName}) podría no seguir convención`);
    }
    
    return {
      fileName,
      filePath,
      tableName,
      modelName,
      timestamps,
      hasValidations,
      hasId,
      hasNombre,
      hasDescripcion,
      issues,
      size: content.length
    };
  } catch (error) {
    return {
      fileName: path.basename(filePath, '.js'),
      filePath,
      error: error.message
    };
  }
}

console.log('🔍 VALIDACIÓN DETALLADA DEL DIRECTORIO CATALOG\n');

// Obtener todos los archivos JS del catálogo
const catalogFiles = fs.readdirSync(catalogDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .map(file => path.join(catalogDir, file));

const validations = catalogFiles.map(validateCatalogModel);

// Agrupar por estado
const validModels = validations.filter(v => !v.error && v.issues.length === 0);
const modelsWithWarnings = validations.filter(v => !v.error && v.issues.length > 0);
const errorModels = validations.filter(v => v.error);

console.log('✅ MODELOS VÁLIDOS:');
validModels.forEach(model => {
  console.log(`  📄 ${model.fileName}.js`);
  console.log(`     └─ Tabla: ${model.tableName}`);
  console.log(`     └─ Modelo: ${model.modelName}`);
  console.log(`     └─ Timestamps: ${model.timestamps}`);
  console.log('');
});

console.log('⚠️ MODELOS CON ADVERTENCIAS:');
modelsWithWarnings.forEach(model => {
  console.log(`  📄 ${model.fileName}.js`);
  console.log(`     └─ Tabla: ${model.tableName}`);
  console.log(`     └─ Modelo: ${model.modelName}`);
  model.issues.forEach(issue => {
    console.log(`     └─ ${issue}`);
  });
  console.log('');
});

if (errorModels.length > 0) {
  console.log('❌ MODELOS CON ERRORES:');
  errorModels.forEach(model => {
    console.log(`  📄 ${model.fileName}: ${model.error}`);
  });
  console.log('');
}

// Análisis de archivos obsoletos
const allFiles = fs.readdirSync(catalogDir);
const obsoleteFiles = allFiles.filter(file => 
  file.includes('.backup') || 
  file.includes('_old') || 
  file.includes('_updated')
);

if (obsoleteFiles.length > 0) {
  console.log('🗑️ ARCHIVOS OBSOLETOS DETECTADOS:');
  obsoleteFiles.forEach(file => {
    console.log(`  📄 ${file}`);
  });
  console.log('');
}

console.log('📊 RESUMEN:');
console.log(`├─ Modelos válidos: ${validModels.length}`);
console.log(`├─ Modelos con advertencias: ${modelsWithWarnings.length}`);
console.log(`├─ Modelos con errores: ${errorModels.length}`);
console.log(`└─ Archivos obsoletos: ${obsoleteFiles.length}`);

// Validar consistencia de nombres de tabla
console.log('\n🏷️ ANÁLISIS DE NOMBRES DE TABLA:');
const tableNames = validations
  .filter(v => !v.error && v.tableName)
  .map(v => ({ model: v.fileName, table: v.tableName }));

tableNames.forEach(({ model, table }) => {
  const singular = table.endsWith('s') ? table.slice(0, -1) : table;
  const plural = table.endsWith('s') ? table : table + 's';
  
  console.log(`├─ ${model} → ${table} ${table.endsWith('s') ? '(plural)' : '(singular)'}`);
});
