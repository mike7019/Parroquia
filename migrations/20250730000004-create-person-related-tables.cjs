'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create person-related tables

    // niveles_educativos table
    await queryInterface.createTable('niveles_educativos', {
      id_niveles_educativos: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nivel: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
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

    // talla_vestimenta table
    await queryInterface.createTable('talla_vestimenta', {
      id_talla_vestimenta: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
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

    // areas_liderazgo table
    await queryInterface.createTable('areas_liderazgo', {
      id_areas_liderazgo: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descripcion: {
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

    // liderazgos table
    await queryInterface.createTable('liderazgos', {
      id_liderazgos: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      fecha_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_fin: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_areas_liderazgo_areas_liderazgo: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'areas_liderazgo',
          key: 'id_areas_liderazgo',
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

    // destrezas table
    await queryInterface.createTable('destrezas', {
      id_destrezas: {
        type: Sequelize.BIGINT,
        primaryKey: true,
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

    // persona_destreza table (many-to-many)
    await queryInterface.createTable('persona_destreza', {
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_destrezas_destrezas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'destrezas',
          key: 'id_destrezas',
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

    // enfermedades table
    await queryInterface.createTable('enfermedades', {
      id_enfermedades: {
        type: Sequelize.SMALLINT,
        primaryKey: true,
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

    // enfermedades_persona table (many-to-many)
    await queryInterface.createTable('enfermedades_persona', {
      id_enfermedades_persona: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_enfermedades_enfermedades: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        references: {
          model: 'enfermedades',
          key: 'id_enfermedades',
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

    // celebraciones_personales table
    await queryInterface.createTable('celebraciones_personales', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      profesion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      motivo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
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

    // celebraciones_padre_madre table
    await queryInterface.createTable('celebraciones_padre_madre', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      rol: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      fecha_celebracion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      es_difunto: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      id_parentesco_parentesco: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'parentesco',
          key: 'id_parentesco',
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

    // necesidades_enfermo table
    await queryInterface.createTable('necesidades_enfermo', {
      id_necesidad: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      solicita_comunion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otras_necesidades: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'personas',
          key: 'id_personas',
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

    // Insert basic data
    await queryInterface.bulkInsert('niveles_educativos', [
      { id_niveles_educativos: 1, nivel: 'Primaria', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 2, nivel: 'Bachillerato', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 3, nivel: 'Pregrado', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 4, nivel: 'Posgrado', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 5, nivel: 'Maestria', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 6, nivel: 'Doctorado', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 7, nivel: 'Tecnico', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 8, nivel: 'Tecnologo', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 9, nivel: 'Sin estudios', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 10, nivel: 'Cursos', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 12, nivel: 'Diplomado', createdAt: new Date(), updatedAt: new Date() },
      { id_niveles_educativos: 13, nivel: 'Seminario', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('talla_vestimenta', [
      { id_talla_vestimenta: 1, descripcion: 'L', createdAt: new Date(), updatedAt: new Date() },
      { id_talla_vestimenta: 2, descripcion: 'M', createdAt: new Date(), updatedAt: new Date() },
      { id_talla_vestimenta: 3, descripcion: 'S', createdAt: new Date(), updatedAt: new Date() },
      { id_talla_vestimenta: 4, descripcion: 'XL', createdAt: new Date(), updatedAt: new Date() },
      { id_talla_vestimenta: 5, descripcion: 'XS', createdAt: new Date(), updatedAt: new Date() },
      { id_talla_vestimenta: 6, descripcion: 'XXL', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('necesidades_enfermo');
    await queryInterface.dropTable('celebraciones_padre_madre');
    await queryInterface.dropTable('celebraciones_personales');
    await queryInterface.dropTable('enfermedades_persona');
    await queryInterface.dropTable('enfermedades');
    await queryInterface.dropTable('persona_destreza');
    await queryInterface.dropTable('destrezas');
    await queryInterface.dropTable('liderazgos');
    await queryInterface.dropTable('areas_liderazgo');
    await queryInterface.dropTable('talla_vestimenta');
    await queryInterface.dropTable('niveles_educativos');
  }
};
