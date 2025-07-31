'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla surveys
    await queryInterface.createTable('surveys', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      family_id: {
        type: Sequelize.UUID,
        allowNull: true,
        // Note: Will add foreign key after families table is created
      },
      // Información General
      sector: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      family_head: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      family_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      housing_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      observations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Control de Estado
      status: {
        type: Sequelize.ENUM('draft', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      current_stage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      total_stages: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 4
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      // Datos JSON
      stages_data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]'
      },
      family_members: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '[]'
      },
      temp_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      // Timestamps
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_auto_save: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Metadatos
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      last_saved_stage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices para surveys
    await queryInterface.addIndex('surveys', ['user_id']);
    await queryInterface.addIndex('surveys', ['status']);
    await queryInterface.addIndex('surveys', ['sector']);
    await queryInterface.addIndex('surveys', ['progress']);
    await queryInterface.addIndex('surveys', ['created_at']);
    await queryInterface.addIndex('surveys', ['family_head']);

    // Crear tabla sectors
    await queryInterface.createTable('sectors', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      families: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      completed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      pending: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      coordinator: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      last_update: {
        type: Sequelize.DATE,
        allowNull: true
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      municipio_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'id_municipio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vereda_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'veredas',
          key: 'id_vereda'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices para sectors
    await queryInterface.addIndex('sectors', ['name']);
    await queryInterface.addIndex('sectors', ['status']);
    await queryInterface.addIndex('sectors', ['coordinator']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('surveys');
    await queryInterface.dropTable('sectors');
  }
};
