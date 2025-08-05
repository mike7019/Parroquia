'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla tipos_disposicion_basura
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_disposicion_basura"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('tipos_disposicion_basura', [
      {
        nombre: 'Recolección Pública',
        descripcion: 'Servicio de recolección municipal',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Quema',
        descripcion: 'Incineración de residuos',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Entierro',
        descripcion: 'Enterramiento de residuos',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Río o Quebrada',
        descripcion: 'Disposición en fuente hídrica',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Campo Abierto',
        descripcion: 'Disposición al aire libre',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Reciclaje',
        descripcion: 'Separación y reciclaje de materiales',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Compostaje',
        descripcion: 'Compostaje de residuos orgánicos',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    }
  },

  async down(queryInterface, Sequelize) {
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_disposicion_basura', null, {});
  }
};
