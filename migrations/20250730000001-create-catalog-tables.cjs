'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create catalog tables first (no dependencies)
    
    // tipo_identificacion table
    await queryInterface.createTable('tipo_identificacion', {
      id_tipo_identificacion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
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

    // estado_civil table
    await queryInterface.createTable('estado_civil', {
      id_estado_civil: {
        type: Sequelize.BIGINT,
        primaryKey: true,
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

    // sexo table
    await queryInterface.createTable('sexo', {
      id_sexo: {
        type: Sequelize.BIGINT,
        primaryKey: true,
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

    // parroquia table
    await queryInterface.createTable('parroquia', {
      id_parroquia: {
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

    // comunidades_culturales table
    await queryInterface.createTable('comunidades_culturales', {
      id_comunidades_culturales: {
        type: Sequelize.BIGINT,
        primaryKey: true,
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

    // municipios table
    await queryInterface.createTable('municipios', {
      id_municipio: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre_municipio: {
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

    // sector table
    await queryInterface.createTable('sector', {
      id_sector: {
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

    // Insert basic data for catalog tables
    await queryInterface.bulkInsert('tipo_identificacion', [
      { id_tipo_identificacion: 1, descripcion: 'Registro civil', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_identificacion: 2, descripcion: 'Tarjeta de identidad', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_identificacion: 3, descripcion: 'Contraseña', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_identificacion: 4, descripcion: 'Cedula', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_identificacion: 5, descripcion: 'Pasaporte', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_identificacion: 6, descripcion: 'NIT', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('estado_civil', [
      { id_estado_civil: 1, descripcion: 'Soltero', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 2, descripcion: 'Soltera', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 3, descripcion: 'Casado', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 4, descripcion: 'Casada', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 5, descripcion: 'Viudo', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 6, descripcion: 'Viuda', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 7, descripcion: 'Union libre', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 8, descripcion: 'Divorciado', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 9, descripcion: 'Divorciada', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 10, descripcion: 'Padre cabeza de hogar', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 11, descripcion: 'Madre cabeza de hogar', createdAt: new Date(), updatedAt: new Date() },
      { id_estado_civil: 12, descripcion: 'Matrimonio religioso', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('sexo', [
      { id_sexo: 1, descripcion: 'Masculino', createdAt: new Date(), updatedAt: new Date() },
      { id_sexo: 2, descripcion: 'Femenino', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sector');
    await queryInterface.dropTable('municipios');
    await queryInterface.dropTable('comunidades_culturales');
    await queryInterface.dropTable('parroquia');
    await queryInterface.dropTable('sexo');
    await queryInterface.dropTable('estado_civil');
    await queryInterface.dropTable('tipo_identificacion');
  }
};
