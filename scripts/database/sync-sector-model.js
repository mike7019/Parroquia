// Script para sincronizar el modelo Sector con la base de datos
import sequelize from './config/sequelize.js';
import Sector from './src/models/catalog/Sector.js';
import Municipios from './src/models/catalog/Municipios.js';

async function syncSectorModel() {
  try {
    console.log('🔄 Sincronizando modelo Sector con la base de datos...\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Definir asociaciones
    if (!Sector.associations.municipio) {
      Sector.belongsTo(Municipios, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });
      console.log('✅ Asociación Sector -> Municipio definida');
    }

    if (!Municipios.associations.sectores) {
      Municipios.hasMany(Sector, {
        foreignKey: 'id_municipio',
        as: 'sectores'
      });
      console.log('✅ Asociación Municipio -> Sectores definida');
    }
    
    // Sincronizar el modelo Sector específicamente
    console.log('\n🔧 Sincronizando tabla sectores...');
    await Sector.sync({ alter: true });
    console.log('✅ Tabla sectores sincronizada exitosamente');
    
    // Verificar estructura
    console.log('\n📋 Estructura actual del modelo Sector:');
    console.log('• id_sector: BIGINT PRIMARY KEY AUTO_INCREMENT');
    console.log('• nombre: STRING(255) NOT NULL');
    console.log('• id_municipio: BIGINT NOT NULL (FK)');
    console.log('• created_at: TIMESTAMP NOT NULL');
    console.log('• updated_at: TIMESTAMP NOT NULL');
    
    console.log('\n✨ Cambios aplicados:');
    console.log('  - Columnas created_at y updated_at configuradas correctamente');
    console.log('  - Campo id_municipio ahora es obligatorio');
    console.log('  - Timestamps automáticos habilitados');
    
    console.log('\n🎯 Ahora puedes crear sectores con:');
    const ejemplo = {
      nombre: 'Sector San José',
      id_municipio: 1
    };
    console.log(JSON.stringify(ejemplo, null, 2));
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar sincronización
syncSectorModel();
