import sequelize from './config/sequelize.js';
import Usuario from './src/models/Usuario.js';

async function syncRefreshToken() {
  try {
    console.log('🔄 Sincronizando modelo Usuario para agregar refresh_token...');
    
    // Sincronizar solo el modelo Usuario con alter: true
    await Usuario.sync({ alter: true });
    
    console.log('✅ Campo refresh_token agregado exitosamente a la tabla usuarios');
    
    // Verificar que la columna se creó
    const tableDescription = await sequelize.getQueryInterface().describeTable('usuarios');
    
    if (tableDescription.refresh_token) {
      console.log('✅ Verificación exitosa: Campo refresh_token existe en la tabla');
      console.log('📋 Configuración del campo:', tableDescription.refresh_token);
    } else {
      console.log('❌ Error: Campo refresh_token no se encontró en la tabla');
    }
    
  } catch (error) {
    console.error('❌ Error al sincronizar:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

syncRefreshToken();
