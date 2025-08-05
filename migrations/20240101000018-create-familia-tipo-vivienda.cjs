'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familia_tipo_vivienda', {
      id_familia_tipo_vivienda: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_tipo_vivienda: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_vivienda',
          key: 'id_tipo_vivienda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices únicos y de rendimiento
    await queryInterface.addIndex('familia_tipo_vivienda', ['id_familia', 'id_tipo_vivienda'], { unique: true });
    await queryInterface.addIndex('familia_tipo_vivienda', ['id_familia']);
    await queryInterface.addIndex('familia_tipo_vivienda', ['id_tipo_vivienda']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('familia_tipo_vivienda');
  }
};
