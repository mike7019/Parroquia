import fs from 'fs';

// Configuración de servicios para aplicar el fix
const serviceConfigs = [
  {
    serviceName: 'parentescoService',
    modelName: 'Parentesco',
    idField: 'id_parentesco',
    createMethodPattern: /createParentesco/g
  },
  {
    serviceName: 'tallaService', 
    modelName: 'Talla',
    idField: 'id_talla',
    createMethodPattern: /createTalla/g
  },
  {
    serviceName: 'sexoService',
    modelName: 'Sexo', 
    idField: 'id_sexo',
    createMethodPattern: /createSexo/g
  }
];

function generateFindNextAvailableIdFunction(modelName, idField) {
  return `
  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      // Get all existing IDs ordered
      const existingRecords = await sequelize.models.${modelName}.findAll({
        attributes: ['${idField}'],
        order: [['${idField}', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.${idField}));
      
      // Find the first gap in the sequence
      for (let i = 1; i <= existingIds.length + 1; i++) {
        if (!existingIds.includes(i)) {
          return i;
        }
      }

      // If no gaps found, return the next sequential number
      return Math.max(...existingIds) + 1;
    } catch (error) {
      throw new Error(\`Error finding next available ID: \${error.message}\`);
    }
  }`;
}

function applyFixToService(config) {
  const servicePath = `src/services/catalog/${config.serviceName}.js`;
  
  console.log(`🔧 Aplicando fix a ${config.serviceName}...`);
  
  if (!fs.existsSync(servicePath)) {
    console.log(`   ❌ Archivo no encontrado: ${servicePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Verificar si ya tiene la función
    if (content.includes('findNextAvailableId')) {
      console.log(`   ✅ Ya tiene función findNextAvailableId`);
      return true;
    }

    // Agregar la función después de la declaración de clase
    const classDeclarationRegex = /class\s+\w+Service\s*{/;
    const match = content.match(classDeclarationRegex);
    
    if (!match) {
      console.log(`   ❌ No se encontró declaración de clase`);
      return false;
    }

    const insertPosition = match.index + match[0].length;
    const findIdFunction = generateFindNextAvailableIdFunction(config.modelName, config.idField);
    
    content = content.slice(0, insertPosition) + findIdFunction + content.slice(insertPosition);

    // Buscar el patrón de .create( y agregar el ID
    const createPattern = new RegExp(`(\\.create\\(\\s*{)`, 'g');
    
    content = content.replace(createPattern, (match, createCall) => {
      // Verificar si ya tiene asignación de ID
      const nextContext = content.substr(content.indexOf(match) + match.length, 200);
      if (nextContext.includes(config.idField)) {
        return match; // Ya tiene el ID asignado
      }
      
      return `${createCall}\n        ${config.idField}: nextId,`;
    });

    // Agregar la lógica para obtener el nextId antes de cada create
    const methodPatterns = [
      /async\s+create\w*\([^)]*\)\s*{/g
    ];

    methodPatterns.forEach(pattern => {
      content = content.replace(pattern, (match) => {
        const methodStart = content.indexOf(match);
        const methodBody = content.substr(methodStart + match.length, 1000);
        
        // Verificar si ya tiene la lógica de nextId
        if (methodBody.includes('findNextAvailableId')) {
          return match;
        }
        
        // Buscar dónde insertar la lógica del nextId (antes del .create)
        const createIndex = methodBody.indexOf('.create(');
        if (createIndex === -1) {
          return match;
        }
        
        // Insertar la lógica del nextId
        const beforeCreate = methodBody.substring(0, createIndex);
        const afterCreate = methodBody.substring(createIndex);
        
        const updatedMethodBody = beforeCreate + 
          '\n      // Find the next available ID\n      const nextId = await this.findNextAvailableId();\n\n      ' + 
          afterCreate;
        
        return match + updatedMethodBody.substring(0, 1000);
      });
    });

    // Escribir el archivo modificado
    fs.writeFileSync(servicePath, content);
    console.log(`   ✅ Fix aplicado exitosamente`);
    return true;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

console.log('🚀 Aplicando fix de reutilización de IDs a servicios seleccionados...\n');

let successCount = 0;
for (const config of serviceConfigs) {
  if (applyFixToService(config)) {
    successCount++;
  }
  console.log('');
}

console.log(`📊 Resultado: ${successCount}/${serviceConfigs.length} servicios actualizados exitosamente`);

if (successCount > 0) {
  console.log('\n✅ Próximos pasos:');
  console.log('1. Revisar los archivos modificados manualmente');
  console.log('2. Deshabilitar autoIncrement en los modelos correspondientes');
  console.log('3. Crear scripts de prueba para validar');
}