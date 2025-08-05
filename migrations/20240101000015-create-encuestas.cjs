'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('encuestas', {
      id_encuesta: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
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
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      id_sector: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sectores',
          key: 'id_sector'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_vereda: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'veredas',
          key: 'id_vereda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tratamiento_datos: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      firma: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('encuestas', ['fecha']);
    await queryInterface.addIndex('encuestas', ['id_municipio', 'id_sector']);
    await queryInterface.addIndex('encuestas', ['fecha', 'id_parroquia']);
    await queryInterface.addIndex('encuestas', ['id_parroquia']);
    await queryInterface.addIndex('encuestas', ['id_vereda']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('encuestas');
  }
};
