'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sexos', {
      id_sexo: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      codigo: {
        type: Sequelize.STRING(1),
        allowNull: false,
        unique: true
      },
      descripcion: {
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

    // Insertar los datos básicos de sexos
    await queryInterface.bulkInsert('sexos', [
      {
        nombre: 'Masculino',
        codigo: 'M',
        descripcion: 'Sexo masculino',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Femenino',
        codigo: 'F',
        descripcion: 'Sexo femenino',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Otro',
        codigo: 'O',
        descripcion: 'Otro sexo o no especificado',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sexos');
  }
};
