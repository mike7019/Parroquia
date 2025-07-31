'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create user management tables

    // usuarios table
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      primer_nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      segundo_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      primer_apellido: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      segundo_apellido: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      contrasena: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // roles table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // usuarios_roles table (many-to-many)
    await queryInterface.createTable('usuarios_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_usuarios: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_roles: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add composite unique constraint for usuarios_roles
    await queryInterface.addConstraint('usuarios_roles', {
      fields: ['id_usuarios', 'id_roles'],
      type: 'unique',
      name: 'usuarios_roles_unique'
    });

    // Insert basic roles
    await queryInterface.bulkInsert('roles', [
      {
        id: '00000000-0000-0000-0000-000000000001',
        nombre: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        nombre: 'Usuario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        nombre: 'Encuestador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios_roles');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('usuarios');
  }
};
