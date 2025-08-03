'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🌱 Poblando roles del sistema...');

    // Insert system roles
    await queryInterface.bulkInsert('roles', [
      { 
        id: '00000000-0000-0000-0000-000000000001', 
        nombre: 'Administrador'
      },
      { 
        id: '00000000-0000-0000-0000-000000000002', 
        nombre: 'Usuario'
      },
      { 
        id: '00000000-0000-0000-0000-000000000003', 
        nombre: 'Encuestador'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Roles del sistema poblados exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
