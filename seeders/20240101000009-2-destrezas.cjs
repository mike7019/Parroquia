'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar destrezas (se ignoran duplicados por el índice único en 'nombre')
    try {
      await queryInterface.bulkInsert('destrezas', [
        {
          nombre: 'Manualidades',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Cocina',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Costura',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Carpintería',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Agricultura',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Ganadería',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Mecánica',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Electricidad',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Plomería',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Música',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Deportes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Tecnología',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Liderazgo',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Comunicación',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'Primeros Auxilios',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
      console.log('✅ Destrezas insertadas correctamente');
    } catch (error) {
      // Si falla por duplicados, solo registrar el error pero continuar
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.log('⚠️  Algunas destrezas ya existen, se omiten duplicados');
      } else {
        console.error('❌ Error al insertar destrezas:', error.message);
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('destrezas', null, {});
  }
};
