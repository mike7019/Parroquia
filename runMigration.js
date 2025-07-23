import sequelize from './config/sequelize.js';
import { DataTypes } from 'sequelize';

/**
 * Simple migration runner for adding status column
 */
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if status column already exists
    const tableDescription = await queryInterface.describeTable('users');
    console.log('📋 Current table columns:', Object.keys(tableDescription));
    
    if (!tableDescription.status) {
      console.log('📝 Adding status column to users table...');
      
      // Add status column with ENUM type
      await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        allowNull: false,
        defaultValue: 'active'
      });
      
      console.log('🔄 Updating existing users to have active status...');
      // Update all existing users to have 'active' status
      await sequelize.query("UPDATE users SET status = 'active' WHERE status IS NULL");
      
      console.log('✅ Status column added and existing users updated successfully');
    } else {
      console.log('ℹ️  Status column already exists, skipping migration');
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run migrations
runMigrations();
