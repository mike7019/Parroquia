'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: uuidv4(),
        nombre: 'Administrador',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        nombre: 'Encuestador',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Verificar si ya existen roles antes de insertar
    const existingRoles = await queryInterface.sequelize.query(
      'SELECT nombre FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const existingRoleNames = existingRoles.map(role => role.nombre);
    
    // Filtrar roles que no existen
    const newRoles = roles.filter(role => !existingRoleNames.includes(role.nombre));
    
    if (newRoles.length > 0) {
      await queryInterface.bulkInsert('roles', newRoles, {});
      console.log(`✅ Se insertaron ${newRoles.length} nuevos roles`);
    } else {
      console.log('ℹ️  Todos los roles ya existen en la base de datos');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
