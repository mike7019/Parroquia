'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create family-related tables

    // tipo_viviendas table
    await queryInterface.createTable('tipo_viviendas', {
      id_tipo_vivienda: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true,
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

    // tipos_disposicion_basura table
    await queryInterface.createTable('tipos_disposicion_basura', {
      id_tipos_disposicion_basura: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      metodo: {
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

    // sistemas_acueducto table
    await queryInterface.createTable('sistemas_acueducto', {
      id_sistemas_acueducto: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      proveedor: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      metodo_abastecimiento: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descripcion: {
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

    // tipos_aguas_residuales table
    await queryInterface.createTable('tipos_aguas_residuales', {
      id_tipos_aguas_residuales: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      metodo: {
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

    // parroquias table (different from parroquia)
    await queryInterface.createTable('parroquias', {
      id_parroquia: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
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

    // difuntos_familia table
    await queryInterface.createTable('difuntos_familia', {
      id_difunto: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      nombre_completo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      fecha_fallecimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    // celebraciones_familia table
    await queryInterface.createTable('celebraciones_familia', {
      id_celebracion: {
        type: Sequelize.BIGINT,
        primaryKey: true,
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
    await queryInterface.bulkInsert('tipo_viviendas', [
      { id_tipo_vivienda: 1, descripcion: 'Propia', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_vivienda: 2, descripcion: 'Arrendada', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_vivienda: 3, descripcion: 'Familiar', createdAt: new Date(), updatedAt: new Date() },
      { id_tipo_vivienda: 4, descripcion: 'Invasion', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('tipos_disposicion_basura', [
      { id_tipos_disposicion_basura: 1, metodo: 'Al aire libre', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_disposicion_basura: 2, metodo: 'Carro recolector', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_disposicion_basura: 3, metodo: 'Compostaje', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_disposicion_basura: 4, metodo: 'En tierra', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_disposicion_basura: 5, metodo: 'Reciclaje', createdAt: new Date(), updatedAt: new Date() },
    ]);

    await queryInterface.bulkInsert('tipos_aguas_residuales', [
      { id_tipos_aguas_residuales: 1, metodo: 'Alcantarillado', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_aguas_residuales: 2, metodo: 'Al aire libre', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_aguas_residuales: 3, metodo: 'Pozo septico', createdAt: new Date(), updatedAt: new Date() },
      { id_tipos_aguas_residuales: 4, metodo: 'Quebradas', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('celebraciones_familia');
    await queryInterface.dropTable('difuntos_familia');
    await queryInterface.dropTable('parroquias');
    await queryInterface.dropTable('tipos_aguas_residuales');
    await queryInterface.dropTable('sistemas_acueducto');
    await queryInterface.dropTable('tipos_disposicion_basura');
    await queryInterface.dropTable('tipo_viviendas');
  }
};
