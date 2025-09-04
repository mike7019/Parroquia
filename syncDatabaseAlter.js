import sequelize from './config/sequelize.js';
import './src/models/index.js';

/**
 * Synchronize database with alter mode (safe updates)
 */
async function syncDatabaseAlter() {
  try {
    console.log('🔄 Starting database synchronization (alter mode)...');
    console.log('⚠️  This will modify existing tables to match model definitions');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Synchronize models with alter
    console.log('🔄 Synchronizing models with ALTER mode...');
    console.log('📝 This will add missing columns and indexes');
    
    await sequelize.sync({ 
      alter: true,
      force: false,
      logging: console.log 
    });
    
    console.log('✅ Database synchronized with ALTER mode successfully');
    console.log('📊 Existing data preserved, schema updated');
    
  } catch (error) {
    console.error('❌ Database synchronization (alter) failed:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔄 Database connection closed');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncDatabaseAlter()
    .then(() => {
      console.log('🎯 Database sync (alter) completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database sync (alter) failed:', error);
      process.exit(1);
    });
}

export default syncDatabaseAlter;
