'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla departamentos
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM departamentos"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('departamentos', [
        { nombre: 'Amazonas', codigo_dane: '91', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Antioquia', codigo_dane: '05', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Arauca', codigo_dane: '81', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Atlántico', codigo_dane: '08', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Bogotá D.C.', codigo_dane: '11', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Bolívar', codigo_dane: '13', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Boyacá', codigo_dane: '15', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Caldas', codigo_dane: '17', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Caquetá', codigo_dane: '18', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Casanare', codigo_dane: '85', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Cauca', codigo_dane: '19', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Cesar', codigo_dane: '20', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Chocó', codigo_dane: '27', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Córdoba', codigo_dane: '23', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Cundinamarca', codigo_dane: '25', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Guainía', codigo_dane: '94', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Guaviare', codigo_dane: '95', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Huila', codigo_dane: '41', created_at: new Date(), updated_at: new Date() },
        { nombre: 'La Guajira', codigo_dane: '44', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Magdalena', codigo_dane: '47', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Meta', codigo_dane: '50', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Nariño', codigo_dane: '52', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Norte de Santander', codigo_dane: '54', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Putumayo', codigo_dane: '86', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Quindío', codigo_dane: '63', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Risaralda', codigo_dane: '66', created_at: new Date(), updated_at: new Date() },
        { nombre: 'San Andrés y Providencia', codigo_dane: '88', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Santander', codigo_dane: '68', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Sucre', codigo_dane: '70', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Tolima', codigo_dane: '73', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Valle del Cauca', codigo_dane: '76', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Vaupés', codigo_dane: '97', created_at: new Date(), updated_at: new Date() },
        { nombre: 'Vichada', codigo_dane: '99', created_at: new Date(), updated_at: new Date() }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departamentos', null, {});
  }
};
