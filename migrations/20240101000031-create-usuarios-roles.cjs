'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios_roles', {
      id_usuarios: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_roles: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'roles',
          key: 'id'
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

    // Índice compuesto para la clave primaria (ya se crea automáticamente)
    // Índice para optimizar consultas por usuario
    await queryInterface.addIndex('usuarios_roles', ['id_usuarios'], {
      name: 'usuarios_roles_id_usuarios_index'
    });

    // Índice para optimizar consultas por rol
    await queryInterface.addIndex('usuarios_roles', ['id_roles'], {
      name: 'usuarios_roles_id_roles_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios_roles');
  }
};
