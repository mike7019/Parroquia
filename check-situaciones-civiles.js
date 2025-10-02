import sequelize from './config/sequelize.js';
// Importar los modelos para que se registren en sequelize
import models from './src/models/index.js';

async function testExistingRecords() {
  try {
    await sequelize.sync({ alter: false });
    
    console.log('📋 Registros existentes en situaciones_civiles:');
    
    const SituacionCivil = sequelize.models.SituacionCivil;
    const registros = await SituacionCivil.findAll({
      paranoid: false, // incluir eliminados
      order: [['id_situacion_civil', 'ASC']]
    });
    
    if (registros.length === 0) {
      console.log('   No hay registros');
    } else {
      registros.forEach(registro => {
        const estado = registro.deletedAt ? '(ELIMINADO)' : registro.activo ? '(ACTIVO)' : '(INACTIVO)';
        console.log(`   ID ${registro.id_situacion_civil}: ${registro.nombre} ${estado}`);
      });
    }
    
    console.log(`\nTotal: ${registros.length} registros`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testExistingRecords();