'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla estados_civiles
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM estados_civiles"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('estados_civiles', [
        {
          nombre: 'Soltero(a)',
          descripcion: 'Persona que no ha contraído matrimonio',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Casado(a)',
          descripcion: 'Persona que ha contraído matrimonio',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Divorciado(a)',
          descripcion: 'Persona que ha disuelto su matrimonio',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Viudo(a)',
          descripcion: 'Persona cuyo cónyuge ha fallecido',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Unión Libre',
          descripcion: 'Persona que vive en unión marital de hecho',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Separado(a)',
          descripcion: 'Persona que vive separada de su cónyuge',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('estados_civiles', null, {});
  }
};
