'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create veredas table (depends on municipios and sector)
    await queryInterface.createTable('veredas', {
      id_vereda: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_municipio_municipios: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'id_municipio',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_sector_sector: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sector',
          key: 'id_sector',
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

    // Create familias table (depends on veredas)
    await queryInterface.createTable('familias', {
      id_familia: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      uuid_familia: {
        type: Sequelize.CHAR(36),
        allowNull: false,
      },
      nombre_familia: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      direccion_familia: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      numero_contrato_epm: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tratamiento_datos: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      observaciones: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_vereda_veredas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'veredas',
          key: 'id_vereda',
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

    // Create personas table (depends on multiple tables)
    await queryInterface.createTable('personas', {
      id_personas: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      primer_nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      segundo_nombre: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      primer_apellido: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      segundo_apellido: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      id_tipo_identificacion_tipo_identificacion: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'tipo_identificacion',
          key: 'id_tipo_identificacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      identificacion: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      telefono: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      correo_electronico: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      fecha_nacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      sexo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      direccion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_familia_familias: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'familias',
          key: 'id_familia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_estado_civil_estado_civil: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'estado_civil',
          key: 'id_estado_civil',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_parroquia_parroquia: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'parroquia',
          key: 'id_parroquia',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_sexo_sexo: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sexo',
          key: 'id_sexo',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      id_comunidades_culturales_comunidades_culturales: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'comunidades_culturales',
          key: 'id_comunidades_culturales',
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

    // Create parentesco table (depends on personas)
    await queryInterface.createTable('parentesco', {
      id_parentesco: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: true,
        unique: true,
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

    // Insert basic data for parentesco
    await queryInterface.bulkInsert('parentesco', [
      { id_parentesco: 1, nombre: 'Abuelo', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 2, nombre: 'Abuela', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 3, nombre: 'Tio', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 4, nombre: 'Tia', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 5, nombre: 'Primo', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 6, nombre: 'Prima', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 7, nombre: 'Hermano', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 8, nombre: 'Hermana', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 9, nombre: 'Padre', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 10, nombre: 'Madre', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 11, nombre: 'Sobrino', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 12, nombre: 'Sobrina', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 13, nombre: 'Nieto', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 14, nombre: 'Nieta', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 15, nombre: 'Adoptado', createdAt: new Date(), updatedAt: new Date() },
      { id_parentesco: 16, nombre: 'Adoptada', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('parentesco');
    await queryInterface.dropTable('personas');
    await queryInterface.dropTable('familias');
    await queryInterface.dropTable('veredas');
  }
};
