'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen datos
    const existingRecords = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM tipos_disposicion_basura',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingRecords[0].count > 0) {
      console.log('Tipos de disposición de basura ya existen, omitiendo seeder...');
      return;
    }

    const tiposDisposicion = [
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
      },
      {
        nombre: 'Botadero',
        descripcion: 'Disposición en botadero',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Otro',
        descripcion: 'Otro método no especificado',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Reutilización',
        descripcion: 'Reutilización de materiales para otros fines',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Venta de Reciclables',
        descripcion: 'Venta de materiales reciclables a centros de acopio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Donación',
        descripcion: 'Donación de objetos en buen estado',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return queryInterface.bulkInsert('tipos_disposicion_basura', tiposDisposicion);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tipos_disposicion_basura', null, {});
  }
};
