'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create personas_celebraciones_personales
    await queryInterface.createTable('personas_celebraciones_personales', {
      id_persona_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_celebracion: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'celebraciones_personales',
          key: 'id_celebracion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Create familias_celebraciones_familia
    await queryInterface.createTable('familias_celebraciones_familia', {
      id_familia_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_celebracion: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'celebraciones_familia',
          key: 'id_celebracion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Create familias_difuntos
    await queryInterface.createTable('familias_difuntos', {
      id_familia_difunto: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_familia: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'familias',
          key: 'id_familia'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_difunto: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'difuntos_familia',
          key: 'id_difunto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Create personas_necesidades_enfermo
    await queryInterface.createTable('personas_necesidades_enfermo', {
      id_persona_necesidad: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_necesidad: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'necesidades_enfermo',
          key: 'id_necesidad'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Update enfermedades_persona table to include references
    await queryInterface.addColumn('enfermedades_persona', 'id_persona', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('enfermedades_persona', 'id_enfermedades', {
      type: Sequelize.SMALLINT,
      allowNull: true,
      references: {
        model: 'enfermedades',
        key: 'id_enfermedades'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('enfermedades_persona', 'fecha_diagnostico', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('enfermedades_persona', 'estado', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('enfermedades_persona', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Create personas_comunidades_culturales
    await queryInterface.createTable('personas_comunidades_culturales', {
      id_persona_comunidad: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_comunidades_culturales: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'comunidades_culturales',
          key: 'id_comunidades_culturales'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    });

    // Create personas_talla_vestimenta
    await queryInterface.createTable('personas_talla_vestimenta', {
      id_persona_talla: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      id_persona: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_talla_vestimenta: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'talla_vestimenta',
          key: 'id_talla_vestimenta'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_prenda: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      fecha_registro: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Drop relationship tables
    await queryInterface.dropTable('personas_talla_vestimenta');
    await queryInterface.dropTable('personas_comunidades_culturales');
    
    // Remove columns from enfermedades_persona
    await queryInterface.removeColumn('enfermedades_persona', 'observaciones');
    await queryInterface.removeColumn('enfermedades_persona', 'estado');
    await queryInterface.removeColumn('enfermedades_persona', 'fecha_diagnostico');
    await queryInterface.removeColumn('enfermedades_persona', 'id_enfermedades');
    await queryInterface.removeColumn('enfermedades_persona', 'id_persona');
    
    await queryInterface.dropTable('personas_necesidades_enfermo');
    await queryInterface.dropTable('familias_difuntos');
    await queryInterface.dropTable('familias_celebraciones_familia');
    await queryInterface.dropTable('personas_celebraciones_personales');
  }
};
