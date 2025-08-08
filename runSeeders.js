import sequelize from './config/sequelize.js';
import { runConfigSeeders, cleanConfigData } from './src/seeders/configSeeder.js';

/**
 * Script para ejecutar solo los seeders de configuración
 * Uso:
 *   node runSeeders.js           - Ejecuta todos los seeders
 *   node runSeeders.js clean     - Limpia todos los datos de configuración
 *   node runSeeders.js reseed    - Limpia y vuelve a sembrar todos los datos
 */

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'seed';

  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    switch (mode.toLowerCase()) {
      case 'clean':
        console.log('\n🧹 Modo: Limpiar datos de configuración');
        await cleanConfigData();
        console.log('✅ Datos de configuración limpiados');
        break;

      case 'reseed':
        console.log('\n🔄 Modo: Limpiar y resembrar');
        await cleanConfigData();
        console.log('✅ Datos limpiados');
        
        console.log('\n🌱 Resembrando datos...');
        const reseedResults = await runConfigSeeders();
        console.log(`✅ Resembrado completado: ${reseedResults.success}/${reseedResults.total} exitosos`);
        break;

      case 'seed':
      default:
        console.log('\n🌱 Modo: Ejecutar seeders (sin limpiar)');
        const seedResults = await runConfigSeeders();
        console.log(`✅ Seeders completados: ${seedResults.success}/${seedResults.total} exitosos`);
        break;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Conexión cerrada');
    } catch (closeError) {
      console.warn('⚠️  Error cerrando conexión:', closeError.message);
    }
    process.exit(0);
  }
}

// Solo ejecutar si el archivo se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}

export { main };
