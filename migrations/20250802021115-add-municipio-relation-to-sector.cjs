'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Añadir columna id_municipio a la tabla sector
    await queryInterface.addColumn('sector', 'id_municipio', {
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
    await queryInterface.addIndex('sector', ['id_municipio'], {
      name: 'idx_sector_municipio',
    });

    console.log('✅ Relación sector-municipio añadida exitosamente');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice
    await queryInterface.removeIndex('sector', 'idx_sector_municipio');
    
    // Eliminar columna id_municipio
    await queryInterface.removeColumn('sector', 'id_municipio');

    console.log('❌ Relación sector-municipio eliminada');
  }
};
