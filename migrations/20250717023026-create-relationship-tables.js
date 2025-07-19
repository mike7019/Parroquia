'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create personas_destrezas (many-to-many)
    await queryInterface.createTable('personas_destrezas', {
      id_persona_destreza: {
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
      id_destrezas: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'destrezas',
          key: 'id_destrezas'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nivel_competencia: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fecha_adquisicion: {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    });

    // Create personas_liderazgos (many-to-many)
    await queryInterface.createTable('personas_liderazgos', {
      id_persona_liderazgo: {
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
      id_liderazgo: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'liderazgos',
          key: 'id_liderazgo'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_areas_liderazgo: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'areas_liderazgo',
          key: 'id_areas_liderazgo'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    // Create personas_roles (many-to-many)
    await queryInterface.createTable('personas_roles', {
      id_persona_rol: {
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
      id_rol: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id_rol'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_asignacion: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true
      }
    });

    // Create familias_parentesco (relationship between family members)
    await queryInterface.createTable('familias_parentesco', {
      id_familia_parentesco: {
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
      id_parentesco: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'parentesco',
          key: 'id_parentesco'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      es_jefe_familia: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      }
    });

    // Add missing fields to familias table
    await queryInterface.addColumn('familias', 'id_sistemas_acueducto', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'sistemas_acueducto',
        key: 'id_sistemas_acueducto'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('familias', 'id_tipos_disposicion_basura', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'tipos_disposicion_basura',
        key: 'id_tipos_disposicion_basura'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('familias', 'id_tipos_aguas_residuales', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'tipos_aguas_residuales',
        key: 'id_tipos_aguas_residuales'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('familias', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('familias', 'id_vereda', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'veredas',
        key: 'id_vereda'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('familias', 'id_sector', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'sector',
        key: 'id_sector'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove columns from familias
    await queryInterface.removeColumn('familias', 'id_sector');
    await queryInterface.removeColumn('familias', 'id_vereda');
    await queryInterface.removeColumn('familias', 'id_municipio');
    await queryInterface.removeColumn('familias', 'id_tipos_aguas_residuales');
    await queryInterface.removeColumn('familias', 'id_tipos_disposicion_basura');
    await queryInterface.removeColumn('familias', 'id_sistemas_acueducto');

    // Drop relationship tables
    await queryInterface.dropTable('familias_parentesco');
    await queryInterface.dropTable('personas_roles');
    await queryInterface.dropTable('personas_liderazgos');
    await queryInterface.dropTable('personas_destrezas');
  }
};
