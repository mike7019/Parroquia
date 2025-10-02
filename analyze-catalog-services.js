import fs from 'fs';
import path from 'path';

const catalogServicesDir = 'src/services/catalog';
const catalogModelsDir = 'src/models/catalog';
const mainModelsDir = 'src/models/main';

async function analyzeServices() {
  console.log('🔍 Analizando servicios de catálogo para identificar los que necesitan fix de IDs...\n');

  try {
    // Leer todos los archivos de servicios
    const serviceFiles = fs.readdirSync(catalogServicesDir)
      .filter(file => file.endsWith('Service.js') && !file.includes('_old'))
      .sort();

    console.log(`📁 Encontrados ${serviceFiles.length} servicios de catálogo:\n`);

    const servicesNeedingFix = [];
    const servicesAlreadyFixed = [];

    for (const serviceFile of serviceFiles) {
      const servicePath = path.join(catalogServicesDir, serviceFile);
      const serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      const serviceName = serviceFile.replace('Service.js', '');
      console.log(`📋 Analizando: ${serviceName}Service`);

      // Verificar si ya tiene la función findNextAvailableId
      const hasIdReuseFunction = serviceContent.includes('findNextAvailableId');
      
      // Verificar si tiene método create
      const hasCreateMethod = serviceContent.includes('.create(') && !serviceContent.includes('// TODO');
      
      // Verificar si asigna ID manualmente en create
      const assignsManualId = serviceContent.includes('id_') && serviceContent.includes(': nextId');

      if (hasIdReuseFunction && assignsManualId) {
        console.log(`   ✅ YA TIENE FIX: Reutilización de IDs implementada`);
        servicesAlreadyFixed.push(serviceName);
      } else if (hasCreateMethod) {
        console.log(`   ❌ NECESITA FIX: Tiene método create pero no reutiliza IDs`);
        servicesNeedingFix.push(serviceName);
      } else {
        console.log(`   ⚪ SIN CREATE: No tiene método create implementado`);
      }
      console.log('');
    }

    console.log('📊 RESUMEN:\n');
    console.log(`✅ Servicios ya arreglados (${servicesAlreadyFixed.length}):`);
    servicesAlreadyFixed.forEach(service => console.log(`   - ${service}Service`));
    
    console.log(`\n❌ Servicios que necesitan fix (${servicesNeedingFix.length}):`);
    servicesNeedingFix.forEach(service => console.log(`   - ${service}Service`));

    return { servicesNeedingFix, servicesAlreadyFixed };

  } catch (error) {
    console.error('❌ Error analizando servicios:', error);
    return { servicesNeedingFix: [], servicesAlreadyFixed: [] };
  }
}

// Ejecutar análisis
analyzeServices().then(result => {
  if (result.servicesNeedingFix.length > 0) {
    console.log('\n🔧 Próximos pasos:');
    console.log('1. Aplicar fix de reutilización de IDs a los servicios listados');
    console.log('2. Deshabilitar autoIncrement en los modelos correspondientes');
    console.log('3. Crear scripts de prueba para validar funcionalidad');
  } else {
    console.log('\n🎉 ¡Todos los servicios ya tienen el fix implementado!');
  }
});