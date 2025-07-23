import sequelize from './config/sequelize.js';
import { DataTypes } from 'sequelize';

async function addStatusColumn() {
  try {
    console.log('🔄 Adding status column to users table...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Check if status column exists
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.status) {
      console.log('📝 Adding status column with ENUM type...');
      
      // First, create the ENUM type if it doesn't exist
      try {
        await sequelize.query(`
          DO $$ BEGIN
            CREATE TYPE enum_users_status AS ENUM ('active', 'inactive', 'deleted');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `);
        console.log('✅ ENUM type created or already exists');
      } catch (error) {
        console.log('⚠️  ENUM type already exists, continuing...');
      }
      
      // Add the status column
      await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        allowNull: false,
        defaultValue: 'active',
        after: 'role' // Add after role column
      });
      
      console.log('🔄 Updating existing users to have active status...');
      // Update all existing users to have 'active' status
      await sequelize.query("UPDATE users SET status = 'active' WHERE status IS NULL");
      
      console.log('✅ Status column added and existing users updated successfully');
      
      // Verify the column was added
      const updatedDescription = await queryInterface.describeTable('users');
      console.log('🎯 Status column now exists:', !!updatedDescription.status);
      
    } else {
      console.log('ℹ️  Status column already exists');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

addStatusColumn();
