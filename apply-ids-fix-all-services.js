import fs from 'fs';
import path from 'path';

const servicesNeedingFix = [
  'destrezaService',
  'disposicionBasuraService', 
  'estudioService',
  'parentescoService',
  'parroquiaService',
  'profesionService',
  'sectorService',
  'sexoService',
  'sistemaAcueductoService',
  'tallaService',
  'tipoIdentificacionService',
  'veredaService'
];

// Mapeo de servicios a modelos y campos ID
const serviceToModelMapping = {
  'destrezaService': { model: 'Destreza', idField: 'id_destreza', tableName: 'destrezas' },
  'disposicionBasuraService': { model: 'DisposicionBasura', idField: 'id_disposicion_basura', tableName: 'disposiciones_basura' },
  'estudioService': { model: 'Estudio', idField: 'id_estudio', tableName: 'estudios' },
  'parentescoService': { model: 'Parentesco', idField: 'id_parentesco', tableName: 'parentescos' },
  'parroquiaService': { model: 'Parroquia', idField: 'id_parroquia', tableName: 'parroquias' },
  'profesionService': { model: 'Profesion', idField: 'id_profesion', tableName: 'profesiones' },
  'sectorService': { model: 'Sector', idField: 'id_sector', tableName: 'sectores' },
  'sexoService': { model: 'Sexo', idField: 'id_sexo', tableName: 'sexos' },
  'sistemaAcueductoService': { model: 'SistemaAcueducto', idField: 'id_sistema_acueducto', tableName: 'sistemas_acueducto' },
  'tallaService': { model: 'Talla', idField: 'id_talla', tableName: 'tallas' },
  'tipoIdentificacionService': { model: 'TipoIdentificacion', idField: 'id_tipo_identificacion', tableName: 'tipos_identificacion' },
  'veredaService': { model: 'Vereda', idField: 'id_vereda', tableName: 'veredas' }
};

function generateFindNextAvailableIdFunction(modelName, idField) {
  return `  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      // Get all existing IDs ordered
      const existingRecords = await ${modelName}.findAll({
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

function applyFixToService(serviceName) {
  try {
    console.log(`🔧 Aplicando fix a ${serviceName}...`);
    
    const servicePath = `src/services/catalog/${serviceName}.js`;
    if (!fs.existsSync(servicePath)) {
      console.log(`   ⚠️ Archivo no encontrado: ${servicePath}`);
      return false;
    }

    const mapping = serviceToModelMapping[serviceName];
    if (!mapping) {
      console.log(`   ⚠️ Mapeo no encontrado para ${serviceName}`);
      return false;
    }

    let content = fs.readFileSync(servicePath, 'utf8');
    
    // Backup del archivo original
    const backupPath = `src/services/catalog/${serviceName}_backup.js`;
    fs.writeFileSync(backupPath, content);

    // Verificar si ya tiene la función
    if (content.includes('findNextAvailableId')) {
      console.log(`   ✅ Ya tiene función findNextAvailableId`);
      return true;
    }

    // Buscar el patrón de la clase
    const classMatch = content.match(/class\s+\w+\s*{/);
    if (!classMatch) {
      console.log(`   ❌ No se encontró declaración de clase`);
      return false;
    }

    // Encontrar la posición después de la declaración de clase
    const classStartPos = classMatch.index + classMatch[0].length;
    
    // Generar la función findNextAvailableId
    const findIdFunction = generateFindNextAvailableIdFunction(mapping.model, mapping.idField);
    
    // Insertar la función después de la declaración de clase
    const beforeClass = content.substring(0, classStartPos);
    const afterClass = content.substring(classStartPos);
    
    content = beforeClass + '\n' + findIdFunction + '\n' + afterClass;

    // Buscar y modificar el método create
    const createMethodRegex = new RegExp(`(async\\s+create\\w*\\([^)]*\\)\\s*{[^}]*?)(\\.create\\(\\s*{)([^}]*)}`, 'g');
    
    content = content.replace(createMethodRegex, (match, methodStart, createCall, createParams) => {
      // Agregar lógica para obtener el próximo ID disponible
      const nextIdLogic = `
      // Find the next available ID
      const nextId = await this.findNextAvailableId();

      const result = await ${mapping.model}${createCall}
        ${mapping.idField}: nextId,${createParams}}`;
      
      return methodStart + nextIdLogic;
    });

    // Escribir el archivo modificado
    fs.writeFileSync(servicePath, content);
    console.log(`   ✅ Fix aplicado exitosamente`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error aplicando fix a ${serviceName}:`, error.message);
    return false;
  }
}

async function applyFixToAllServices() {
  console.log('🚀 Iniciando aplicación de fix de reutilización de IDs...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const serviceName of servicesNeedingFix) {
    const success = applyFixToService(serviceName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log('');
  }

  console.log('📊 RESUMEN FINAL:');
  console.log(`✅ Servicios arreglados exitosamente: ${successCount}`);
  console.log(`❌ Servicios con errores: ${failCount}`);
  console.log(`📁 Total procesados: ${servicesNeedingFix.length}`);

  if (successCount > 0) {
    console.log('\n🔄 Próximos pasos:');
    console.log('1. Revisar los archivos modificados');
    console.log('2. Deshabilitar autoIncrement en los modelos correspondientes');
    console.log('3. Crear scripts de prueba');
    console.log('4. Hacer commit de los cambios');
  }
}

// Ejecutar el fix
applyFixToAllServices();