'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('familias', {
      id_familia: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.BIGINT,
        autoIncrement: true
      },
      apellido_familiar: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      direccion_familia: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      numero_contacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tamaño_familia: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      tipo_vivienda: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      estado_encuesta: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      numero_encuestas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      fecha_ultima_encuesta: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      codigo_familia: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      tutor_responsable: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      id_municipio: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'id_municipio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_vereda: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'veredas',
          key: 'id_vereda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_sector: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sectores',
          key: 'id_sector'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('familias', ['id_municipio']);
    await queryInterface.addIndex('familias', ['id_vereda']);
    await queryInterface.addIndex('familias', ['id_sector']);
    await queryInterface.addIndex('familias', ['estado_encuesta']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('familias');
  }
};
