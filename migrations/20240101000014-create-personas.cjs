'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('personas', {
      id_personas: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      primer_nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      segundo_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      primer_apellido: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      segundo_apellido: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      id_tipo_identificacion_tipo_identificacion: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      identificacion: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      sexo: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      id_familia_familias: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_estado_civil_estado_civil: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      camisa: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      blusa: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      pantalon: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      calzado: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      estudios: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      en_que_eres_lider: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      necesidad_enfermo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      id_profesion: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'profesiones',
          key: 'id_profesion'
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

    // Agregar índices únicos y de rendimiento
    await queryInterface.addIndex('personas', ['identificacion'], { unique: true });
    await queryInterface.addIndex('personas', ['correo_electronico'], { unique: true });
    await queryInterface.addIndex('personas', ['id_familia_familias']);
    await queryInterface.addIndex('personas', ['fecha_nacimiento']);
    await queryInterface.addIndex('personas', ['id_profesion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('personas');
  }
};
