/**
 * Script para eliminar físicamente el ID 12 que está causando conflicto
 */

import './src/models/index.js';
import sequelize from './config/sequelize.js';

async function eliminarID12Fisicamente() {
  console.log('🗑️ ELIMINANDO FÍSICAMENTE ID 12');
  
  try {
    const SituacionCivil = sequelize.models.SituacionCivil;
    
    // Verificar si existe
    const registro12 = await SituacionCivil.findByPk(12, { paranoid: false });
    
    if (!registro12) {
      console.log('✅ ID 12 ya no existe físicamente');
      process.exit(0);
    }
    
    console.log('🔍 ID 12 encontrado:', {
      nombre: registro12.nombre,
      eliminado: !!registro12.fechaEliminacion
    });
    
    // Eliminación física directa con SQL
    console.log('🗑️ Ejecutando eliminación física...');
    await sequelize.query('DELETE FROM situaciones_civiles WHERE id_situacion_civil = 12');
    
    console.log('✅ ID 12 eliminado físicamente con SQL directo');
    
    // Verificar que fue eliminado
    const verificacion = await SituacionCivil.findByPk(12, { paranoid: false });
    if (!verificacion) {
      console.log('✅ Verificación: ID 12 ya no existe');
    } else {
      console.log('❌ Error: ID 12 aún existe después de la eliminación');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }

  process.exit(0);
}

eliminarID12Fisicamente();