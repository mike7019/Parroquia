'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla tipos_identificacion
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM tipos_identificacion"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('tipos_identificacion', [
        {
          nombre: 'Cédula de Ciudadanía',
          codigo: 'CC',
          descripcion: 'Documento de identificación para ciudadanos colombianos mayores de edad',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Tarjeta de Identidad',
          codigo: 'TI',
          descripcion: 'Documento de identificación para menores de edad',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Cédula de Extranjería',
          codigo: 'CE',
          descripcion: 'Documento de identificación para extranjeros residentes',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Pasaporte',
          codigo: 'PA',
          descripcion: 'Documento de identificación internacional',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'NIT',
          codigo: 'NIT',
          descripcion: 'Número de Identificación Tributaria',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipos_identificacion', null, {});
  }
};
