import { sequelize } from './src/models/index.js';

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Forzar recreación de todas las tablas
    await sequelize.sync({ force: true });
    
    console.log('✅ Base de datos sincronizada exitosamente');
    console.log('📊 Tablas creadas desde los modelos');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error);
    process.exit(1);
  }
}

syncDatabase();
