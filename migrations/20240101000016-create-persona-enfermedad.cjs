'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('persona_enfermedad', {
      id_persona_enfermedad: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      id_persona: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id_personas'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_enfermedad: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'enfermedades',
          key: 'id_enfermedad'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      fecha_diagnostico: {
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
    await queryInterface.addIndex('persona_enfermedad', ['id_persona', 'id_enfermedad'], { unique: true });
    await queryInterface.addIndex('persona_enfermedad', ['id_persona']);
    await queryInterface.addIndex('persona_enfermedad', ['id_enfermedad']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('persona_enfermedad');
  }
};
