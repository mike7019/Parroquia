'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familia_disposicion_basura', {
      id_familia_disposicion_basura: {
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
      id_tipo_disposicion_basura: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_disposicion_basura',
          key: 'id_tipo_disposicion_basura'
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
    await queryInterface.addIndex('familia_disposicion_basura', ['id_familia', 'id_tipo_disposicion_basura'], { unique: true });
    await queryInterface.addIndex('familia_disposicion_basura', ['id_familia']);
    await queryInterface.addIndex('familia_disposicion_basura', ['id_tipo_disposicion_basura']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('familia_disposicion_basura');
  }
};
