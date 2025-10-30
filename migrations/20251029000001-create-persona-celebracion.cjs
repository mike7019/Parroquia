'use strict';

/**
 * Migración para crear la tabla persona_celebracion
 * Permite almacenar múltiples celebraciones por persona (cumpleaños, santo, aniversario, etc.)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear tabla persona_celebracion
    await queryInterface.createTable('persona_celebracion', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_persona: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id_personas'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Referencia a la persona que tiene la celebración'
      },
      motivo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Motivo de la celebración (Cumpleaños, Santo, Aniversario, etc.)'
      },
      dia: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 31
        },
        comment: 'Día de la celebración (1-31)'
      },
      mes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 12
        },
        comment: 'Mes de la celebración (1-12)'
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

    // Crear índice compuesto para evitar duplicados
    await queryInterface.addConstraint('persona_celebracion', {
      fields: ['id_persona', 'motivo', 'dia', 'mes'],
      type: 'unique',
      name: 'unique_persona_celebracion'
    });

    // Crear índices para optimizar búsquedas
    await queryInterface.addIndex('persona_celebracion', ['id_persona'], {
      name: 'idx_persona_celebracion_persona'
    });

    await queryInterface.addIndex('persona_celebracion', ['mes'], {
      name: 'idx_persona_celebracion_mes'
    });

    await queryInterface.addIndex('persona_celebracion', ['motivo'], {
      name: 'idx_persona_celebracion_motivo'
    });

    console.log('✅ Tabla persona_celebracion creada exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('persona_celebracion');
    console.log('✅ Tabla persona_celebracion eliminada');
  }
};
