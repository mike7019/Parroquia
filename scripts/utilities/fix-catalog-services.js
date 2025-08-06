import fs from 'fs';
import path from 'path';

const servicesDir = path.join(process.cwd(), 'src', 'services', 'catalog');

const serviceFiles = [
  'parroquiaService.js',
  'sectorService.js',
  'sexoService.js'
];

const modelGetters = {
  'parroquiaService.js': 'Parroquia',
  'sectorService.js': 'Sector', 
  'sexoService.js': 'Sexo'
};

// Fix each service file
for (const serviceFile of serviceFiles) {
  const servicePath = path.join(servicesDir, serviceFile);
  
  if (fs.existsSync(servicePath)) {
    console.log(`🔧 Fixing ${serviceFile}...`);
    
    let content = fs.readFileSync(servicePath, 'utf8');
    const modelName = modelGetters[serviceFile];
    
    // Add model getter function if it doesn't exist
    if (!content.includes(`const get${modelName}Model = () =>`)) {
      const importIndex = content.indexOf('import sequelize');
      if (importIndex !== -1) {
        const afterImports = content.indexOf('\n', content.indexOf('\n', importIndex) + 1);
        const getter = `\n// Obtener el modelo ${modelName} desde Sequelize una vez que se cargue\nconst get${modelName}Model = () => sequelize.models.${modelName};\n`;
        content = content.slice(0, afterImports) + getter + content.slice(afterImports);
      }
    }
    
    // Replace all model usage with getter
    const regex = new RegExp(`await ${modelName}\\.`, 'g');
    content = content.replace(regex, `await get${modelName}Model().`);
    
    // Also fix direct usage without await
    const directRegex = new RegExp(`([^a-zA-Z])${modelName}\\.`, 'g');
    content = content.replace(directRegex, `$1get${modelName}Model().`);
    
    fs.writeFileSync(servicePath, content, 'utf8');
    console.log(`✅ Fixed ${serviceFile}`);
  } else {
    console.log(`❌ ${serviceFile} not found`);
  }
}

console.log('🎯 All catalog services fixed!');
