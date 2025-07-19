'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create personas table
    await queryInterface.createTable('personas', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      primer_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
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
        allowNull: false
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      id_tipo_identificacion: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'tipo_identificacion',
          key: 'id_tipo_identificacion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_estado_civil: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'estado_civil',
          key: 'id_estado_civil'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_parroquia: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'parroquia',
          key: 'id_parroquia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_tipo_vivienda: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'tipo_vivienda',
          key: 'id_tipo_vivienda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_sexo: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sexo',
          key: 'id_sexo'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Create usuarios table
    await queryInterface.createTable('usuarios', {
      id_usuario: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      primer_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      segundo_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      primer_apellido: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      segundo_apellido: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create familias table
    await queryInterface.createTable('familias', {
      id_familia: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      codigo_familia: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      nombre_familia: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      direccion_familia: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      numero_contacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      tutor_responsable: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('familias');
    await queryInterface.dropTable('usuarios');
    await queryInterface.dropTable('personas');
  }
};
