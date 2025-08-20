import sequelize from './config/sequelize.js';
import './src/models/index.js';

async function verificarBasico() {
  try {
    console.log('🔍 Verificando conexión y modelos básicos...');
    
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // 2. Verificar modelo Veredas
    const Veredas = sequelize.models.Veredas;
    if (!Veredas) {
      throw new Error('Modelo Veredas no encontrado');
    }
    console.log('✅ Modelo Veredas cargado');
    
    // 3. Probar consulta simple de veredas
    const count = await Veredas.count();
    console.log(`✅ Conteo de veredas: ${count}`);
    
    // 4. Probar obtener algunas veredas
    const veredas = await Veredas.findAll({ limit: 3 });
    console.log(`✅ Primeras 3 veredas obtenidas: ${veredas.length} registros`);
    
    console.log('🎉 Verificación básica completada exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarBasico()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
