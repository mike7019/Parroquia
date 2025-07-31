'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if createdAt column exists
    const [createdAtResults] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'departamentos' AND column_name = 'createdAt'"
    );
    
    // If createdAt doesn't exist, add it
    if (createdAtResults.length === 0) {
      await queryInterface.addColumn('departamentos', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }

    // Check if updatedAt column exists
    const [updatedAtResults] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'departamentos' AND column_name = 'updatedAt'"
    );
    
    // If updatedAt doesn't exist, add it
    if (updatedAtResults.length === 0) {
      await queryInterface.addColumn('departamentos', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('departamentos', 'createdAt');
    await queryInterface.removeColumn('departamentos', 'updatedAt');
  }
};
