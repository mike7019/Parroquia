'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create tipo_identificacion table
    await queryInterface.createTable('tipo_identificacion', {
      id_tipo_identificacion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      tipo_identificacion_pk: {
        type: Sequelize.STRING(25),
        allowNull: true,
        unique: true
      }
    });

    // Create estado_civil table
    await queryInterface.createTable('estado_civil', {
      id_estado_civil: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(15),
        allowNull: true
      }
    });

    // Create parroquia table
    await queryInterface.createTable('parroquia', {
      id_parroquia: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create tipo_vivienda table
    await queryInterface.createTable('tipo_vivienda', {
      id_tipo_vivienda: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      tipo_vivienda: {
        type: Sequelize.STRING(31),
        allowNull: true
      }
    });

    // Create parentesco table
    await queryInterface.createTable('parentesco', {
      id_parentesco: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    });

    // Create sexo table
    await queryInterface.createTable('sexo', {
      id_sexo: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      sexo: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    // Create sistemas_acueducto table
    await queryInterface.createTable('sistemas_acueducto', {
      id_sistemas_acueducto: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      proveedor: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      metodo_abastecimiento: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Create tipos_disposicion_basura table
    await queryInterface.createTable('tipos_disposicion_basura', {
      id_tipos_disposicion_basura: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      metodo: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });

    // Create tipos_aguas_residuales table
    await queryInterface.createTable('tipos_aguas_residuales', {
      id_tipos_aguas_residuales: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      metodo: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tipos_aguas_residuales');
    await queryInterface.dropTable('tipos_disposicion_basura');
    await queryInterface.dropTable('sistemas_acueducto');
    await queryInterface.dropTable('sexo');
    await queryInterface.dropTable('parentesco');
    await queryInterface.dropTable('tipo_vivienda');
    await queryInterface.dropTable('parroquia');
    await queryInterface.dropTable('estado_civil');
    await queryInterface.dropTable('tipo_identificacion');
  }
};
