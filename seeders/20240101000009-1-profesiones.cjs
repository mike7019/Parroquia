'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla profesiones
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM profesiones"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('profesiones', [
        {
          nombre: 'Agricultor',
          descripcion: 'Persona dedicada a la agricultura',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Ganadero',
          descripcion: 'Persona dedicada a la ganadería',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Comerciante',
          descripcion: 'Persona dedicada al comercio',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Docente',
          descripcion: 'Profesional de la educación',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Enfermero/a',
          descripcion: 'Profesional de la salud',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Mecánico',
          descripcion: 'Técnico en mecánica',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Carpintero',
          descripcion: 'Artesano de la madera',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Electricista',
          descripcion: 'Técnico en electricidad',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Albañil',
          descripcion: 'Trabajador de la construcción',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Conductor',
          descripcion: 'Conductor de vehículos',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Cocinero/a',
          descripcion: 'Profesional de la cocina',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Empleado Doméstico',
          descripcion: 'Trabajador del hogar',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Estudiante',
          descripcion: 'Persona en proceso de formación',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Pensionado',
          descripcion: 'Persona jubilada',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Ama de Casa',
          descripcion: 'Persona dedicada al hogar',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Desempleado',
          descripcion: 'Sin ocupación laboral actual',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Trabajador Independiente',
          descripcion: 'Trabajador por cuenta propia',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Técnico en Sistemas',
          descripcion: 'Profesional en tecnología',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Vendedor',
          descripcion: 'Persona dedicada a las ventas',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Otros',
          descripcion: 'Otras profesiones no especificadas',
          created_at: new Date(),
          updated_at: new Date()
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('profesiones', null, {});
  }
};
