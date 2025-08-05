'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla tipos_aguas_residuales
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_aguas_residuales"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('tipos_aguas_residuales', [
      {
        nombre: 'Alcantarillado Público',
        descripcion: 'Conexión al sistema de alcantarillado municipal',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Pozo Séptico',
        descripcion: 'Sistema de tratamiento individual',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Letrina',
        descripcion: 'Sistema básico de saneamiento',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Campo Abierto',
        descripcion: 'Sin sistema de tratamiento',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Río o Quebrada',
        descripcion: 'Descarga directa a fuente hídrica',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    }
  },

  async down(queryInterface, Sequelize) {
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_aguas_residuales', null, {});
  }
};
