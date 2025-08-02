'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Enable PostgreSQL extensions
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS citext;');
    
    console.log('✅ PostgreSQL extensions initialized successfully');
  },

  async down(queryInterface, Sequelize) {
    // Drop extensions (be careful with this in production)
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;');
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pg_stat_statements CASCADE;');
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS citext CASCADE;');
    
    console.log('❌ PostgreSQL extensions removed');
  }
};
