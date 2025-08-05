'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familia_sistema_aguas_residuales', {
      id_familia_sistema_aguas_residuales: {
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
      id_tipo_aguas_residuales: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tipos_aguas_residuales',
          key: 'id_tipo_aguas_residuales'
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
    await queryInterface.addIndex('familia_sistema_aguas_residuales', ['id_familia', 'id_tipo_aguas_residuales'], { unique: true });
    await queryInterface.addIndex('familia_sistema_aguas_residuales', ['id_familia']);
    await queryInterface.addIndex('familia_sistema_aguas_residuales', ['id_tipo_aguas_residuales']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('familia_sistema_aguas_residuales');
  }
};
