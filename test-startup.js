import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

// Test just the critical startup parts
const testStartup = async () => {
  try {
    console.log('🚀 Testing minimal startup sequence...');

    // Test database connection with timeout
    console.log('🔍 Testing database connection...');
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    console.log('✅ Database connection established successfully');

    // Load all models
    console.log('📦 Loading all models...');
    await loadAllModels();
    console.log('✅ Models loaded successfully');

    // Sync database
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Syncing database...');
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }

    // Create minimal Express app
    console.log('⚙️  Creating Express app...');
    const app = express();
    
    // Basic middlewares
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Test route
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Start server
    console.log('🌐 Starting server...');
    const PORT = process.env.PORT || 3000;
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown after 5 seconds for testing
    setTimeout(() => {
      console.log('🛑 Shutting down test server...');
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Test completed successfully!');
        process.exit(0);
      });
    }, 5000);
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

testStartup();
