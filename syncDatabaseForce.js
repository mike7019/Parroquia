import sequelize from './config/sequelize.js';
import './src/models/index.js';

/**
 * Synchronize database with force mode (destructive - recreates tables)
 */
async function syncDatabaseForce() {
  try {
    console.log('🔄 Starting database synchronization (FORCE mode)...');
    console.log('⚠️  WARNING: This will DROP and RECREATE all tables!');
    console.log('⚠️  ALL DATA WILL BE LOST!');
    
    // Confirmation for safety
    if (process.env.NODE_ENV === 'production') {
      throw new Error('❌ FORCE sync is not allowed in production environment');
    }
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Synchronize models with force
    console.log('🔄 Synchronizing models with FORCE mode...');
    console.log('💥 Dropping and recreating all tables...');
    
    await sequelize.sync({ 
      alter: false,
      force: true,
      logging: console.log 
    });
    
    console.log('✅ Database synchronized with FORCE mode successfully');
    console.log('🆕 All tables recreated from scratch');
    console.log('⚠️  Remember to run seeders to populate data');
    
  } catch (error) {
    console.error('❌ Database synchronization (force) failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔄 Database connection closed');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('⚠️  FORCE MODE - This will destroy all data!');
  console.log('⚠️  Only proceed if you are sure!');
  
  syncDatabaseForce()
    .then(() => {
      console.log('🎯 Database sync (force) completed successfully');
      console.log('📋 Next step: Run seeders to populate data');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database sync (force) failed:', error);
      process.exit(1);
    });
}

export default syncDatabaseForce;
