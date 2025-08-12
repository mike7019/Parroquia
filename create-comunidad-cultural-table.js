import sequelize from '../config/sequelize.js';
import ComunidadCultural from '../src/models/catalog/ComunidadCultural.js';

const createComunidadCulturalTable = async () => {
  try {
    console.log('🔄 Iniciando creación de tabla comunidad_cultural...');
    
    // Sincronizar el modelo con la base de datos
    await ComunidadCultural.sync({ force: false, alter: true });
    
    console.log('✅ Tabla comunidad_cultural creada/actualizada exitosamente');
    console.log('📋 Estructura de la tabla:');
    console.log('   - id_comunidad_cultural (BIGINT, PRIMARY KEY, AUTO_INCREMENT)');
    console.log('   - nombre (VARCHAR(255), NOT NULL, UNIQUE)');
    console.log('   - descripcion (TEXT, NULLABLE)');
    console.log('   - activo (BOOLEAN, NOT NULL, DEFAULT true)');
    console.log('   - createdAt (TIMESTAMP, NOT NULL)');
    console.log('   - updatedAt (TIMESTAMP, NOT NULL)');
    console.log('📊 Índices creados:');
    console.log('   - UNIQUE INDEX en nombre');
    console.log('   - INDEX en activo');
    
  } catch (error) {
    console.error('❌ Error creando tabla comunidad_cultural:', error.message);
    throw error;
  }
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createComunidadCulturalTable()
    .then(() => {
      console.log('✅ Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

export default createComunidadCulturalTable;
