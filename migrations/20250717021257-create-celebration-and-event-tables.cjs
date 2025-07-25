'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create difuntos_familia table
    await queryInterface.createTable('difuntos_familia', {
      id_difunto: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre_completo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fecha_fallecimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Create celebraciones_padre_madre table
    await queryInterface.createTable('celebraciones_padre_madre', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      fecha_celebracion: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      nombre_evento: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    // Create celebraciones_personales table
    await queryInterface.createTable('celebraciones_personales', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      profesion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      motivo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });

    // Create celebraciones_familia table
    await queryInterface.createTable('celebraciones_familia', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      motivo: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });

    // Create necesidades_enfermo table
    await queryInterface.createTable('necesidades_enfermo', {
      id_necesidad: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      solicita_comunion: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      otras_necesidades: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Create enfermedades_persona table
    await queryInterface.createTable('enfermedades_persona', {
      id_enfermedades_persona: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('enfermedades_persona');
    await queryInterface.dropTable('necesidades_enfermo');
    await queryInterface.dropTable('celebraciones_familia');
    await queryInterface.dropTable('celebraciones_personales');
    await queryInterface.dropTable('celebraciones_padre_madre');
    await queryInterface.dropTable('difuntos_familia');
  }
};
