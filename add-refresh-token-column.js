/**
 * Script to add refresh_token column to usuarios table in production
 * This script safely checks if the column exists before adding it
 */

const { sequelize } = require('./config/sequelize.js');
const { QueryTypes } = require('sequelize');

async function addRefreshTokenColumn() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Check if refresh_token column exists
    console.log('🔍 Checking if refresh_token column exists...');
    
    const columns = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name = 'refresh_token'
    `, { type: QueryTypes.SELECT });

    if (columns.length > 0) {
      console.log('✅ refresh_token column already exists');
      return;
    }

    console.log('➕ Adding refresh_token column...');
    
    await sequelize.query(`
      ALTER TABLE usuarios 
      ADD COLUMN refresh_token TEXT
    `);

    console.log('✅ refresh_token column added successfully');

    // Verify the column was added
    const verifyColumns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      AND column_name = 'refresh_token'
    `, { type: QueryTypes.SELECT });

    if (verifyColumns.length > 0) {
      console.log('✅ Verification successful:', verifyColumns[0]);
    } else {
      console.log('❌ Verification failed - column not found');
    }

  } catch (error) {
    console.error('❌ Error adding refresh_token column:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  addRefreshTokenColumn()
    .then(() => {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addRefreshTokenColumn };
