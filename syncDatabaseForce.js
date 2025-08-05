import sequelize from './config/sequelize.js';
import './src/models/index.js'; // Importar todos los modelos

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
    
    console.log('🌱 Ahora puedes ejecutar seeders para agregar datos iniciales:');
    console.log('   npm run db:seed');
    
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
