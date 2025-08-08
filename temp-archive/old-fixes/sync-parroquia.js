import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos
import { getParroquiaModel } from './src/models/catalog/Parroquia.js';

async function syncParroquiaModel() {
  try {
    console.log('🔄 Iniciando sincronización específica del modelo Parroquia...');
    
    const Parroquia = getParroquiaModel();
    
    // Primero sincronizar el modelo sin índices
    console.log('📋 Sincronizando estructura de tabla...');
    await Parroquia.sync({ alter: true });
    console.log('✅ Estructura de tabla Parroquia sincronizada');
    
    // Verificar que las columnas existen antes de crear índices
    const tableInfo = await sequelize.getQueryInterface().describeTable('parroquia');
    console.log('📊 Columnas actuales en la tabla parroquia:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`  - ${column}: ${tableInfo[column].type}`);
    });
    
    console.log('✅ Sincronización del modelo Parroquia completada');
    
  } catch (error) {
    console.error('❌ Error al sincronizar el modelo Parroquia:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

syncParroquiaModel();
