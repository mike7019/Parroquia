import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from '../config/sequelize.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userManagementRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';

// Import Swagger configuration
import { setupSwagger } from './config/swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['', ''],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middlewares
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Setup Swagger documentation
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', systemRoutes);

// Root route
app.use('/', systemRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database (be careful in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }

    // Display all registered routes
    displayRoutes();

    // Start server
    const server = app.listen(PORT, () => {
      console.log('🚀 Server Information:');
      console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   • Port: ${PORT}`);
      console.log(`   • API URL: http://localhost:${PORT}/api`);
      console.log(`   • Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
      console.log('✅ Server is running successfully!');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n� Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔄 HTTP server closed');
        
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

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Array to store registered routes
const registeredRoutes = [];

// Middleware to log routes as they are registered
const routeLogger = (req, res, next) => {
  const route = {
    method: req.method,
    path: req.route ? req.route.path : req.path,
    originalUrl: req.originalUrl
  };
  
  // Only log unique routes
  const routeKey = `${route.method}:${route.originalUrl}`;
  if (!registeredRoutes.some(r => `${r.method}:${r.originalUrl}` === routeKey)) {
    registeredRoutes.push(route);
  }
  
  next();
};

// Function to display all registered routes
const displayRoutes = () => {
  console.log('\n📋 Configured API Routes:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Manual route definition based on our router files
  const routes = [
    // Authentication routes
    { method: 'POST', path: '/api/auth/register', group: 'Authentication', protected: false },
    { method: 'POST', path: '/api/auth/login', group: 'Authentication', protected: false },
    { method: 'POST', path: '/api/auth/refresh', group: 'Authentication', protected: false },
    { method: 'POST', path: '/api/auth/logout', group: 'Authentication', protected: true },
    
    // User management routes
    { method: 'GET', path: '/api/users', group: 'User Management', protected: true },
    { method: 'GET', path: '/api/users/deleted', group: 'User Management', protected: true },
    { method: 'GET', path: '/api/users/:id', group: 'User Management', protected: true },
    { method: 'PUT', path: '/api/users/:id', group: 'User Management', protected: true },
    { method: 'DELETE', path: '/api/users/:id', group: 'User Management', protected: true },
    
    // System routes
    { method: 'GET', path: '/api/health', group: 'System', protected: false },
    { method: 'GET', path: '/api-docs', group: 'Documentation', protected: false },
  ];

  // Group routes by category
  const groupedRoutes = routes.reduce((groups, route) => {
    if (!groups[route.group]) {
      groups[route.group] = [];
    }
    groups[route.group].push(route);
    return groups;
  }, {});

  // Display routes by group
  Object.entries(groupedRoutes).forEach(([group, groupRoutes]) => {
    console.log(`\n🔹 ${group}:`);
    groupRoutes.forEach((route) => {
      const methodPadded = route.method.padEnd(8);
      const pathPadded = route.path.padEnd(35);
      const protectionStatus = route.protected ? '🛡️  Protected' : '🌐 Public';
      console.log(`   ${methodPadded} ${pathPadded} ${protectionStatus}`);
    });
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Total Routes: ${routes.length}`);
  
  // Show route summary by type
  const authRoutes = routes.filter(r => r.group === 'Authentication').length;
  const userRoutes = routes.filter(r => r.group === 'User Management').length;
  const systemRoutes = routes.filter(r => r.group === 'System').length;
  
  console.log(`   • Authentication: ${authRoutes} routes`);
  console.log(`   • User Management: ${userRoutes} routes`);
  console.log(`   • System: ${systemRoutes} routes`);
  console.log('');
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
