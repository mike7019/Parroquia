'use strict';

/**
 * Migración para crear la tabla centros_poblados
 * Similar a la tabla corregimientos
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('centros_poblados', {
      id_centro_poblado: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo_centro_poblado: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      id_municipio_municipios: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'id_municipio'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices para mejorar el rendimiento de las consultas
    await queryInterface.addIndex('centros_poblados', ['nombre'], {
      name: 'idx_centros_poblados_nombre'
    });

    await queryInterface.addIndex('centros_poblados', ['id_municipio_municipios'], {
      name: 'idx_centros_poblados_municipio'
    });

    console.log('✅ Tabla centros_poblados creada exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('centros_poblados');
    console.log('✅ Tabla centros_poblados eliminada');
  }
};
