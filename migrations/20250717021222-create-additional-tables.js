'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create liderazgos table
    await queryInterface.createTable('liderazgos', {
      id_liderazgo: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }
    });

    // Create areas_liderazgo table
    await queryInterface.createTable('areas_liderazgo', {
      id_areas_liderazgo: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Create comunidades_culturales table
    await queryInterface.createTable('comunidades_culturales', {
      id_comunidades_culturales: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create niveles_educativos table
    await queryInterface.createTable('niveles_educativos', {
      id_niveles_educativos: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nivel: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    // Create talla_vestimenta table
    await queryInterface.createTable('talla_vestimenta', {
      id_talla_vestimenta: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    // Create municipios table
    await queryInterface.createTable('municipios', {
      id_municipio: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create veredas table
    await queryInterface.createTable('veredas', {
      id_vereda: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create sector table
    await queryInterface.createTable('sector', {
      id_sector: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create destrezas table
    await queryInterface.createTable('destrezas', {
      id_destrezas: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create roles table
    await queryInterface.createTable('roles', {
      id_rol: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre_rol: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create enfermedades table
    await queryInterface.createTable('enfermedades', {
      id_enfermedades: {
        type: Sequelize.SMALLINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('enfermedades');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('destrezas');
    await queryInterface.dropTable('sector');
    await queryInterface.dropTable('veredas');
    await queryInterface.dropTable('municipios');
    await queryInterface.dropTable('talla_vestimenta');
    await queryInterface.dropTable('niveles_educativos');
    await queryInterface.dropTable('comunidades_culturales');
    await queryInterface.dropTable('areas_liderazgo');
    await queryInterface.dropTable('liderazgos');
  }
};
