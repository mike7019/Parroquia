// Script para eliminar corregimientos de prueba (código que comienza con 'TEST-')

const path = require('path');
const { Sequelize, Op } = require('sequelize');
const sequelize = require(path.join(__dirname, 'src', 'config', 'sequelize.js')).default || require(path.join(__dirname, 'src', 'config', 'sequelize.js'));
const Corregimientos = require(path.join(__dirname, 'src', 'models', 'catalog', 'Corregimientos.js')).default || require(path.join(__dirname, 'src', 'models', 'catalog', 'Corregimientos.js'));

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
