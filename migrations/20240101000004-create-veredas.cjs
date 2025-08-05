'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('veredas', {
      id_vereda: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo_dane: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      id_parroquia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'parroquias',
          key: 'id_parroquia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Agregar índices
    await queryInterface.addIndex('veredas', ['id_parroquia']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('veredas');
  }
};
