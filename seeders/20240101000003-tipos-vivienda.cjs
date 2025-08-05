'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla tipos_vivienda
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_vivienda"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('tipos_vivienda', [
      {
        nombre: 'Casa',
        descripcion: 'Vivienda unifamiliar independiente',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Apartamento',
        descripcion: 'Vivienda en edificio multifamiliar',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Finca',
        descripcion: 'Vivienda rural con terreno',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Rancho',
        descripcion: 'Vivienda rural básica',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Cuarto',
        descripcion: 'Habitación en vivienda compartida',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Inquilinato',
        descripcion: 'Vivienda multifamiliar con servicios compartidos',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_vivienda', null, {});
  }
};
