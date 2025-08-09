'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla destrezas
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM destrezas"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('destrezas', [
        {
          nombre: 'Manualidades',
          descripcion: 'Habilidades para trabajos manuales y artesanías',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Cocina',
          descripcion: 'Habilidades culinarias y preparación de alimentos',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Costura',
          descripcion: 'Habilidades para coser y confeccionar',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Carpintería',
          descripcion: 'Trabajos en madera y construcción',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Agricultura',
          descripcion: 'Conocimientos en cultivos y agricultura',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Ganadería',
          descripcion: 'Manejo de ganado y animales',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Mecánica',
          descripcion: 'Reparación de vehículos y maquinaria',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Electricidad',
          descripcion: 'Instalaciones y reparaciones eléctricas',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Plomería',
          descripcion: 'Instalaciones y reparaciones de agua',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Música',
          descripcion: 'Habilidades musicales e instrumentos',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Deportes',
          descripcion: 'Habilidades deportivas y recreativas',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Tecnología',
          descripcion: 'Conocimientos en computación y tecnología',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Liderazgo',
          descripcion: 'Habilidades de liderazgo y organización',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Comunicación',
          descripcion: 'Habilidades de comunicación y oratoria',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Primeros Auxilios',
          descripcion: 'Conocimientos básicos de salud y primeros auxilios',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('destrezas', null, {});
  }
};
