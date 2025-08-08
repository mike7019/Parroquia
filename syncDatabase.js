import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos
import { runConfigSeeders } from './src/seeders/configSeeder.js';

async function syncDatabase() {
  try {
    console.log('🔄 Iniciando sincronización de la base de datos...');
    
    // Opción 1: Sincronización básica (no elimina datos)
    await sequelize.sync();
    console.log('✅ Base de datos sincronizada correctamente');
    
    // Ejecutar seeders de configuración
    console.log('\n🌱 Ejecutando seeders de configuración...');
    try {
      const seederResults = await runConfigSeeders();
      console.log(`✅ Seeders ejecutados: ${seederResults.success}/${seederResults.total} exitosos`);
      if (seederResults.errors > 0) {
        console.warn(`⚠️  ${seederResults.errors} seeders tuvieron errores`);
      }
    } catch (error) {
      console.error('❌ Error ejecutando seeders de configuración:', error.message);
    }
    
    // Opción 2: Sincronización con alter (modifica tablas existentes)
    // await sequelize.sync({ alter: true });
    // console.log('✅ Base de datos sincronizada con alter');
    
    // Opción 3: Sincronización con force (ELIMINA Y RECREA TABLAS)
    // await sequelize.sync({ force: true });
    // console.log('✅ Base de datos recreada completamente');
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();