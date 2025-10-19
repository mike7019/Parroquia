// Script para eliminar corregimientos de prueba (código que comienza con 'TEST-')
import sequelize from '../config/sequelize.js';
import Corregimientos from '../src/models/catalog/Corregimientos.js';
import { Op } from 'sequelize';

async function eliminarCorregimientosTest() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const eliminados = await Corregimientos.destroy({
      where: {
        codigo_corregimiento: {
          [Op.iLike]: 'TEST-%'
        }
      }
    });

    console.log(`🗑️ Corregimientos eliminados: ${eliminados}`);
  } catch (error) {
    console.error('❌ Error al eliminar corregimientos de prueba:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

eliminarCorregimientosTest();
