'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla families (nueva versión para encuestas)
    await queryInterface.createTable('families', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      family_head: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      sector: {
        type: Sequelize.STRING(100),
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
      survey_status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      surveys_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_survey_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      coordinates: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // Crear tabla family_members
    await queryInterface.createTable('family_members', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      survey_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombres: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tipo_identificacion: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      numero_identificacion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      sexo: {
        type: Sequelize.ENUM('M', 'F', 'Otro'),
        allowNull: false
      },
      situacion_civil: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      parentesco: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      talla: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '{"camisa":"","pantalon":"","calzado":""}'
      },
      estudio: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      comunidad_cultural: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      en_que_eres_lider: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      habilidad_destreza: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      enfermedad: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      necesidades_enfermo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      solicitud_comunion_casa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      profesion_motivo_fecha_celebrar: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: '{"profesion":"","motivo":"","dia":"","mes":""}'
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true
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

    // Crear tabla de auditoría para surveys
    await queryInterface.createTable('survey_audit_log', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      survey_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'surveys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      action: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      stage_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      old_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      new_data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('families', ['family_head']);
    await queryInterface.addIndex('families', ['sector']);
    await queryInterface.addIndex('families', ['survey_status']);
    await queryInterface.addIndex('families', ['active']);

    await queryInterface.addIndex('family_members', ['survey_id']);
    await queryInterface.addIndex('family_members', ['numero_identificacion']);
    await queryInterface.addIndex('family_members', ['parentesco']);
    await queryInterface.addIndex('family_members', ['active']);

    await queryInterface.addIndex('survey_audit_log', ['survey_id']);
    await queryInterface.addIndex('survey_audit_log', ['user_id']);
    await queryInterface.addIndex('survey_audit_log', ['timestamp']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('survey_audit_log');
    await queryInterface.dropTable('family_members');
    await queryInterface.dropTable('families');
  }
};
