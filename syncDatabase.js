import sequelize from './config/sequelize.js';
import './src/models/index.js';

/**
 * Synchronize database with basic mode
 */
async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization (basic mode)...');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Synchronize models
    console.log('🔄 Synchronizing models with database...');
    await sequelize.sync({ 
      alter: false,
      force: false,
      logging: console.log 
    });
    
    console.log('✅ Database synchronized successfully');
    
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔄 Database connection closed');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDatabase()
    .then(() => {
      console.log('🎯 Database sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database sync failed:', error);
      process.exit(1);
    });
}

export default syncDatabase;
