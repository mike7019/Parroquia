'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear ENUM para roles (si no existe)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_users_role AS ENUM ('admin', 'coordinator', 'surveyor');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear ENUM para status (si no existe)
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE enum_users_status AS ENUM ('active', 'inactive');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear tabla users
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'firstName'
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'lastName'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'coordinator', 'surveyor'),
        allowNull: false,
        defaultValue: 'surveyor'
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      surveys_completed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailVerificationToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      refreshToken: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar tabla users
    await queryInterface.dropTable('users');
    
    // Eliminar ENUMs
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_role;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_status;');
  }
};
