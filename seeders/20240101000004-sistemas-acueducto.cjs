'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen registros en la tabla sistemas_acueducto
    const [results] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) as count FROM sistemas_acueducto"
    );

    // Solo insertar si no hay registros existentes
    if (results[0].count === 0) {
      await queryInterface.bulkInsert('sistemas_acueducto', [
      {
        nombre: 'Acueducto Público',
        descripcion: 'Sistema de acueducto municipal o departamental',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Pozo Propio',
        descripcion: 'Pozo de agua subterránea privado',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Aljibe',
        descripcion: 'Depósito de agua de lluvia',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Río o Quebrada',
        descripcion: 'Toma directa de fuente natural',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Carrotanque',
        descripcion: 'Suministro por vehículo cisterna',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'Nacimiento',
        descripcion: 'Manantial o nacedero',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('sistemas_acueducto', null, {});
  }
};
