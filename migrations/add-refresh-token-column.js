const { Sequelize } = require('sequelize');

/**
 * Migration to add refresh_token column to usuarios table
 * This migration can be safely run on production
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔄 Checking if refresh_token column exists...');
      
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('usuarios');
      
      if (tableDescription.refresh_token) {
        console.log('✅ refresh_token column already exists, skipping migration');
        return;
      }

      console.log('➕ Adding refresh_token column to usuarios table...');
      
      await queryInterface.addColumn('usuarios', 'refresh_token', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JWT refresh token for user authentication'
      });
      
      console.log('✅ refresh_token column added successfully');
      
    } catch (error) {
      console.error('❌ Error adding refresh_token column:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 Removing refresh_token column from usuarios table...');
      
      await queryInterface.removeColumn('usuarios', 'refresh_token');
      
      console.log('✅ refresh_token column removed successfully');
      
    } catch (error) {
      console.error('❌ Error removing refresh_token column:', error);
      throw error;
    }
  }
};
