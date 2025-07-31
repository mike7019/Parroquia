'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column codigo_dane exists
    const [results] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'municipios' AND column_name = 'codigo_dane'"
    );
    
    // If column doesn't exist, add it
    if (results.length === 0) {
      await queryInterface.addColumn('municipios', 'codigo_dane', {
        type: Sequelize.STRING(5),
        allowNull: true,
        unique: true,
        comment: 'Código DANE del municipio (5 dígitos)'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('municipios', 'codigo_dane');
  }
};
