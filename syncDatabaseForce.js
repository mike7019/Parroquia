import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos
import { runConfigSeeders } from './src/seeders/configSeeder.js';

async function syncDatabaseForce() {
  try {
    console.log('⚠️  ATENCIÓN: Este script ELIMINARÁ Y RECREARÁ todas las tablas');
    console.log('🔄 Iniciando sincronización FORCE de la base de datos...');
    
    // Verificar conexión primero
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Sincronización con force (ELIMINA Y RECREA TODAS LAS TABLAS)
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos recreada completamente - TODOS LOS DATOS ANTERIORES HAN SIDO ELIMINADOS');
    
    // Ejecutar seeders de configuración automáticamente después de FORCE
    console.log('\n🌱 Ejecutando seeders de configuración automáticamente...');
    try {
      const seederResults = await runConfigSeeders();
      console.log(`✅ Seeders ejecutados: ${seederResults.success}/${seederResults.total} exitosos`);
      if (seederResults.errors > 0) {
        console.warn(`⚠️  ${seederResults.errors} seeders tuvieron errores`);
      }
    } catch (error) {
      console.error('❌ Error ejecutando seeders de configuración:', error.message);
      console.log('🔧 Puedes ejecutar manualmente: node runSeeders.js');
    }
    
  } catch (error) {
    console.error('❌ Error al recrear la base de datos:', error);
    console.error('Detalles del error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

console.log('⚠️  ADVERTENCIA: Este script eliminará TODOS los datos existentes');
console.log('¿Estás seguro de que quieres continuar? (Para continuar, ejecuta el script)');

syncDatabaseForce();
