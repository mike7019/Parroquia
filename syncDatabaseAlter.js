import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos
import { runConfigSeeders } from './src/seeders/configSeeder.js';

async function syncDatabaseAlter() {
  try {
    console.log('🔄 Iniciando sincronización con ALTER de la base de datos...');
    
    // Verificar conexión primero
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Sincronización con alter (modifica tablas existentes para coincidir con modelos)
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada con ALTER - tablas modificadas para coincidir con modelos');
    
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
    
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    console.error('Detalles del error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

syncDatabaseAlter();
