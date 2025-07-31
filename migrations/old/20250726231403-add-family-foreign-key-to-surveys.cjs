'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add foreign key constraint for family_id in surveys table
    await queryInterface.addConstraint('surveys', {
      fields: ['family_id'],
      type: 'foreign key',
      name: 'surveys_family_id_fkey',
      references: {
        table: 'families',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better performance
    await queryInterface.addIndex('surveys', ['family_id'], {
      name: 'surveys_family_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('surveys', 'surveys_family_id_fkey');
    
    // Remove the index
    await queryInterface.removeIndex('surveys', 'surveys_family_id');
  }
};
