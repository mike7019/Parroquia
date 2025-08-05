'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('persona_destreza', {
      id_persona_destreza: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      id_personas_personas: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id_personas'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_destrezas_destrezas: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'destrezas',
          key: 'id_destreza'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nivel_habilidad: {
        type: Sequelize.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
        allowNull: true,
        defaultValue: 'basico'
      },
      fecha_adquisicion: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices únicos y de rendimiento
    await queryInterface.addIndex('persona_destreza', ['id_personas_personas', 'id_destrezas_destrezas'], { unique: true });
    await queryInterface.addIndex('persona_destreza', ['id_personas_personas']);
    await queryInterface.addIndex('persona_destreza', ['id_destrezas_destrezas']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('persona_destreza');
  }
};
