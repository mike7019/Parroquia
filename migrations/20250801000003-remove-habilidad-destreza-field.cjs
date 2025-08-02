'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar el campo habilidad_destreza ya que existe la tabla intermedia persona_destreza
    console.log('Eliminando campo habilidad_destreza de la tabla personas...');
    await queryInterface.removeColumn('personas', 'habilidad_destreza');
    console.log('✅ Campo habilidad_destreza eliminado exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar el campo en caso de rollback
    await queryInterface.addColumn('personas', 'habilidad_destreza', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};
