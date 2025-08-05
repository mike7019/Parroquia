'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar que la columna calzado existe antes de eliminarla
    const tableDescription = await queryInterface.describeTable('personas');
    
    if (tableDescription.calzado) {
      console.log('Eliminando campo calzado de la tabla personas...');
      await queryInterface.removeColumn('personas', 'calzado');
      console.log('Campo calzado eliminado exitosamente');
    } else {
      console.log('El campo calzado no existe en la tabla personas, saltando...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Restaurar el campo calzado si se hace rollback
    const tableDescription = await queryInterface.describeTable('personas');
    
    if (!tableDescription.calzado) {
      console.log('Restaurando campo calzado en la tabla personas...');
      await queryInterface.addColumn('personas', 'calzado', {
        type: Sequelize.STRING(10),
        allowNull: true
      });
      console.log('Campo calzado restaurado exitosamente');
    } else {
      console.log('El campo calzado ya existe en la tabla personas, saltando...');
    }
  }
};
