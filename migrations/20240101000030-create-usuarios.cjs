'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      primer_nombre: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      segundo_nombre: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      primer_apellido: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      segundo_apellido: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      numero_documento: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fecha_ultimo_acceso: {
        type: Sequelize.DATE,
        allowNull: true
      },
      intentos_fallidos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      bloqueado_hasta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      token_recuperacion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      token_expiracion: {
        type: Sequelize.DATE,
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

    // Agregar índices únicos
    await queryInterface.addIndex('usuarios', ['correo_electronico'], {
      unique: true,
      name: 'usuarios_correo_electronico_unique'
    });

    await queryInterface.addIndex('usuarios', ['numero_documento'], {
      unique: true,
      name: 'usuarios_numero_documento_unique',
      where: {
        numero_documento: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex('usuarios', ['activo'], {
      name: 'usuarios_activo_index'
    });

    await queryInterface.addIndex('usuarios', ['fecha_ultimo_acceso'], {
      name: 'usuarios_fecha_ultimo_acceso_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  }
};
