'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir columna id_municipio a la tabla parroquia
    await queryInterface.addColumn('parroquia', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true, // Inicialmente permitimos null para datos existentes
      references: {
        model: 'municipios',
        key: 'id_municipio',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Crear índice para mejor rendimiento
    await queryInterface.addIndex('parroquia', ['id_municipio'], {
      name: 'idx_parroquia_municipio',
    });

    console.log('✅ Relación parroquia-municipio añadida exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    await queryInterface.removeIndex('parroquia', 'idx_parroquia_municipio');
    
    // Eliminar columna id_municipio
    await queryInterface.removeColumn('parroquia', 'id_municipio');

    console.log('❌ Relación parroquia-municipio eliminada');
  }
};
