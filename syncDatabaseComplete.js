import sequelize from './config/sequelize.js';
import './src/models/index.js';

/**
 * Load all models and synchronize database
 */
export async function loadAllModels() {
  try {
    console.log('📦 Loading all Sequelize models...');
    
    // Get all registered models
    const models = Object.keys(sequelize.models);
    console.log(`📊 Found ${models.length} models: ${models.join(', ')}`);
    
    // Verify critical models exist
    const criticalModels = ['Usuario', 'Departamentos', 'Municipios', 'Familias', 'Persona'];
    const missingCritical = criticalModels.filter(name => !sequelize.models[name]);
    
    if (missingCritical.length > 0) {
      console.warn('⚠️  Missing critical models:', missingCritical);
    } else {
      console.log('✅ All critical models loaded successfully');
    }
    
    // NOTE: Sync disabled to prevent schema modification issues
    // Database schema should be managed through migrations
    if (process.env.FORCE_DB_SYNC === 'true') {
      console.log('🔄 Force synchronizing database schema...');
      await sequelize.sync({ alter: true });
      console.log('✅ Database schema synchronized');
    } else {
      console.log('ℹ️  Database sync skipped (use FORCE_DB_SYNC=true to enable)');
    }
    
    return {
      sequelize,
      models: sequelize.models,
      modelCount: models.length
    };
    
  } catch (error) {
    console.error('❌ Error loading models:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database and models info
 */
export function getDatabaseInfo() {
  return {
    dialect: sequelize.getDialect(),
    database: sequelize.config.database,
    models: Object.keys(sequelize.models),
    modelCount: Object.keys(sequelize.models).length
  };
}

export default {
  loadAllModels,
  testConnection,
  getDatabaseInfo
};

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Executing database synchronization...');
  
  (async () => {
    try {
      // Test connection first
      const connected = await testConnection();
      if (!connected) {
        console.error('❌ Cannot proceed without database connection');
        process.exit(1);
      }
      
      // Load all models  
      const result = await loadAllModels();
      console.log(`📊 Loaded ${result.modelCount} models successfully`);
      
      // Check for force sync argument
      const forceSync = process.argv.includes('force') || process.argv.includes('alter');
      
      if (forceSync) {
        console.log('🔄 Force synchronizing database with models...');
        const syncOptions = process.argv.includes('force') ? { force: true } : { alter: true };
        await sequelize.sync(syncOptions);
        console.log('✅ Database forcefully synchronized with current models');
      } else {
        console.log('ℹ️  Database sync skipped. Use "force" or "alter" argument to enable.');
      }
      
      console.log('🎉 Database synchronization completed successfully');
      
    } catch (error) {
      console.error('💥 Error during database synchronization:', error);
      process.exit(1);
    } finally {
      await sequelize.close();
    }
  })();
}
