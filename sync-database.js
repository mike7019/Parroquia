import sequelize from './config/sequelize.js';
import './src/models/index.js';

(async () => {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    // Sincronizar con force para recrear todo limpio
    await sequelize.sync({ 
      force: true,
      logging: console.log 
    });
    
    console.log('✅ Base de datos sincronizada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  }
})();
