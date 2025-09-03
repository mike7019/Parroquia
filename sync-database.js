#!/usr/bin/env node

/**
 * Database Synchronization Script for Remote Server Updates
 * 
 * This script forces a complete database sync with the current models.
 * Designed for use after repository updates to keep remote server in sync.
 * 
 * ⚠️  WARNING: This will DROP and RECREATE all tables!
 * 
 * Usage:
 *   node sync-database.js
 *   npm run db:sync:deploy
 */

import sequelize from './config/sequelize.js';
import './src/models/index.js';

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization for deployment...');
    console.log('⚠️  WARNING: This will DROP and RECREATE all tables!');
    console.log('📍 Server deployment sync in progress...');
    
    // Force sync - this will drop and recreate all tables
    await sequelize.sync({ 
      force: true,
      logging: (msg) => console.log('📋 SQL:', msg)
    });
    
    console.log('✅ Database sync completed successfully!');
    console.log('🚀 Remote server database is now updated with latest schemas');
    console.log('💡 Next step: Run seeders if needed with npm run db:seed:config');
    
    // Close the connection
    await sequelize.close();
    console.log('🔌 Database connection closed');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    if (error.sql) {
      console.error('📋 SQL Error:', error.sql);
    }
    console.error('🔍 Full error:', error);
    
    try {
      await sequelize.close();
    } catch (closeError) {
      console.error('⚠️  Error closing connection:', closeError.message);
    }
    
    process.exit(1);
  }
}

// Auto-execute if this file is run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('sync-database.js')) {
  syncDatabase();
}

export default syncDatabase;
