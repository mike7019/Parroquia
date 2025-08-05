'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla sexos
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM sexos"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('sexos', [
        {
          nombre: 'Masculino',
          codigo: 'M',
          descripcion: 'Sexo masculino',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Femenino',
          codigo: 'F',
          descripcion: 'Sexo femenino',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nombre: 'Otro',
          codigo: 'O',
          descripcion: 'Otro sexo o no especificado',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sexos', null, {});
  }
};
