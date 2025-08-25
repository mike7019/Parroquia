import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from '../config/sequelize.js';

// Import essential models
import './models/index.js';

// Import routes - solo las esenciales primero
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userManagementRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import difuntosRoutes from './routes/difuntosRoutes.js';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';

// Import Swagger configuration
import { setupSwagger } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting and security
app.set('trust proxy', true);

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: false,
  originAgentCluster: false,
  dnsPrefetchControl: false,
  frameguard: false,
  hidePoweredBy: true,
  ieNoOpen: false,
  noSniff: false,
  permittedCrossDomainPolicies: false,
  referrerPolicy: false,
  xssFilter: false
}));

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Parroquia API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/difuntos', difuntosRoutes);

// Setup Swagger documentation
setupSwagger(app);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    console.log('✅ Database connection established successfully');

    console.log('📦 Models loaded from index.js');

    // Sync database (be careful in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }

    // Start HTTP Server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server Information:');
      console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   • Port: ${PORT}`);
      console.log(`   • Binding: 0.0.0.0:${PORT} (all interfaces)`);
      console.log(`   • Local URL: http://localhost:${PORT}/api`);
      console.log(`   • Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   • Difuntos API: http://localhost:${PORT}/api/difuntos`);
      console.log('✅ Server is running successfully!');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔄 Server closed');
        
        try {
          await sequelize.close();
          console.log('🔄 Database connection closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Server start failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Add handlers for unhandled errors
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    console.error('At promise:', promise);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  startServer();
}

export default app;
