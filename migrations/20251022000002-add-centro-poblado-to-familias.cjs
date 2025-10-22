'use strict';

/**
 * Migración para agregar el campo id_centro_poblado a la tabla familias
 * Permite asociar familias con centros poblados (opcional)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna id_centro_poblado a familias
    await queryInterface.addColumn('familias', 'id_centro_poblado', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'centros_poblados',
        key: 'id_centro_poblado'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Crear índice para mejorar performance en consultas
    await queryInterface.addIndex('familias', ['id_centro_poblado'], {
      name: 'idx_familias_centro_poblado'
    });

    console.log('✅ Columna id_centro_poblado agregada a familias');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índice primero
    await queryInterface.removeIndex('familias', 'idx_familias_centro_poblado');
    
    // Eliminar columna
    await queryInterface.removeColumn('familias', 'id_centro_poblado');
    
    console.log('✅ Columna id_centro_poblado eliminada de familias');
  }
};
