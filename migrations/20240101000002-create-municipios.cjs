'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('municipios', {
      id_municipio: {
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
      id_departamento: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'departamentos',
          key: 'id_departamento'
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
    await queryInterface.addIndex('municipios', ['id_departamento']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('municipios');
  }
};
