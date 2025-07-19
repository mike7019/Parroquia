'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing fields to personas table
    await queryInterface.addColumn('personas', 'numero_identificacion', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'fecha_nacimiento', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'lugar_nacimiento', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'telefono', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'celular', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'direccion', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'barrio', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'ocupacion', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'nivel_educativo', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'estado_salud', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'fecha_bautismo', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'fecha_primera_comunion', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'fecha_confirmacion', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });

    await queryInterface.addColumn('personas', 'id_familia', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'familias',
        key: 'id_familia'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('personas', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('personas', 'id_vereda', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'veredas',
        key: 'id_vereda'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('personas', 'id_sector', {
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
    await queryInterface.removeColumn('personas', 'id_sector');
    await queryInterface.removeColumn('personas', 'id_vereda');
    await queryInterface.removeColumn('personas', 'id_municipio');
    await queryInterface.removeColumn('personas', 'id_familia');
    await queryInterface.removeColumn('personas', 'fecha_confirmacion');
    await queryInterface.removeColumn('personas', 'fecha_primera_comunion');
    await queryInterface.removeColumn('personas', 'fecha_bautismo');
    await queryInterface.removeColumn('personas', 'observaciones');
    await queryInterface.removeColumn('personas', 'estado_salud');
    await queryInterface.removeColumn('personas', 'nivel_educativo');
    await queryInterface.removeColumn('personas', 'ocupacion');
    await queryInterface.removeColumn('personas', 'barrio');
    await queryInterface.removeColumn('personas', 'direccion');
    await queryInterface.removeColumn('personas', 'celular');
    await queryInterface.removeColumn('personas', 'telefono');
    await queryInterface.removeColumn('personas', 'lugar_nacimiento');
    await queryInterface.removeColumn('personas', 'fecha_nacimiento');
    await queryInterface.removeColumn('personas', 'numero_identificacion');
  }
};
