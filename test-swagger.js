import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

// Import Swagger configuration - this might be the problem
console.log('🔧 Importing Swagger configuration...');
import { setupSwagger } from './src/config/swagger.js';

const testSwaggerSetup = async () => {
  try {
    console.log('🚀 Testing Swagger setup...');

    // Test database connection
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Load models
    console.log('📦 Loading models...');
    await loadAllModels();
    console.log('✅ Models loaded');

    // Sync database
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');

    // Create Express app
    console.log('⚙️  Creating Express app...');
    const app = express();
    
    // Basic middlewares
    app.use(helmet({ contentSecurityPolicy: false }));
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Setup Swagger - this is the potential hang point
    console.log('📚 Setting up Swagger documentation...');
    setupSwagger(app);
    console.log('✅ Swagger setup completed');

    // Test route
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', swagger: 'configured' });
    });

    // Start server
    console.log('🌐 Starting server...');
    const PORT = process.env.PORT || 3000;
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server with Swagger running on port ${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
    });

    // Shutdown after test
    setTimeout(() => {
      console.log('🛑 Shutting down test server...');
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Test completed!');
        process.exit(0);
      });
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error during Swagger setup:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

testSwaggerSetup();
