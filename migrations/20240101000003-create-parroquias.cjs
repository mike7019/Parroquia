'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parroquias', {
      id_parroquia: {
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
      id_municipio: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'municipios',
          key: 'id_municipio'
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
    await queryInterface.addIndex('parroquias', ['id_municipio']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parroquias');
  }
};
