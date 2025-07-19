'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add relationships to veredas table
    await queryInterface.addColumn('veredas', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add relationships to sector table
    await queryInterface.addColumn('sector', 'id_vereda', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'veredas',
        key: 'id_vereda'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('sector', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add relationships to parroquia table
    await queryInterface.addColumn('parroquia', 'id_municipio', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'municipios',
        key: 'id_municipio'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add additional fields to municipios
    await queryInterface.addColumn('municipios', 'codigo_dane', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('municipios', 'departamento', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Add additional fields to veredas
    await queryInterface.addColumn('veredas', 'codigo_vereda', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    // Add additional fields to sector
    await queryInterface.addColumn('sector', 'codigo_sector', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('sector', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add hierarchy level to areas_liderazgo
    await queryInterface.addColumn('areas_liderazgo', 'nivel_jerarquia', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('areas_liderazgo', 'id_area_padre', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'areas_liderazgo',
        key: 'id_areas_liderazgo'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add additional fields to niveles_educativos
    await queryInterface.addColumn('niveles_educativos', 'orden_nivel', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('niveles_educativos', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add relationship between personas and niveles_educativos
    await queryInterface.addColumn('personas', 'id_niveles_educativos', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'niveles_educativos',
        key: 'id_niveles_educativos'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add relationship between personas and comunidades_culturales
    await queryInterface.addColumn('personas', 'id_comunidades_culturales', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'comunidades_culturales',
        key: 'id_comunidades_culturales'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove persona relationships
    await queryInterface.removeColumn('personas', 'id_comunidades_culturales');
    await queryInterface.removeColumn('personas', 'id_niveles_educativos');
    
    // Remove niveles_educativos fields
    await queryInterface.removeColumn('niveles_educativos', 'descripcion');
    await queryInterface.removeColumn('niveles_educativos', 'orden_nivel');
    
    // Remove areas_liderazgo fields
    await queryInterface.removeColumn('areas_liderazgo', 'id_area_padre');
    await queryInterface.removeColumn('areas_liderazgo', 'nivel_jerarquia');
    
    // Remove sector fields
    await queryInterface.removeColumn('sector', 'descripcion');
    await queryInterface.removeColumn('sector', 'codigo_sector');
    
    // Remove veredas fields
    await queryInterface.removeColumn('veredas', 'codigo_vereda');
    
    // Remove municipios fields
    await queryInterface.removeColumn('municipios', 'departamento');
    await queryInterface.removeColumn('municipios', 'codigo_dane');
    
    // Remove geographic relationships
    await queryInterface.removeColumn('parroquia', 'id_municipio');
    await queryInterface.removeColumn('sector', 'id_municipio');
    await queryInterface.removeColumn('sector', 'id_vereda');
    await queryInterface.removeColumn('veredas', 'id_municipio');
  }
};
