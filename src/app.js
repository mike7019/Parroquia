import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/sequelize.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userManagementRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import catalogRoutes from './routes/catalog/index.js';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';

// Import Swagger configuration
import { setupSwagger } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Trust proxy for rate limiting and security
app.set('trust proxy', true); // Changed to true for better IP detection

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP to avoid conflicts with Swagger UI
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  // Disable HSTS in development to allow HTTP
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  // Disable other restrictive policies for better compatibility
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
  origin: [
    'http://206.62.139.100:3000',
    'http://186.114.40.173:3000',
    'http://186.121.33.175:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type', 
    'Accept',
    'Authorization'
  ]
};

// CORS configuration - Simplified and clean
app.use(cors(corsOptions));

// Custom middleware to log request IPs
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.ip;
  
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Log request details
  console.log(`🌐 [${timestamp}] ${method} ${url} - IP: ${clientIP} - User-Agent: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`);
  
  next();
});

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else if (process.env.VERBOSE_LOGGING === 'true') {
  app.use(morgan('dev'));
}

// Body parsing middlewares
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Comment out HTTPS redirect to avoid mixed content issues
// Force HTTPS in production (for external access)
/*
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Check if the request came through a proxy (like nginx) with HTTPS
    if (req.headers['x-forwarded-proto'] === 'https' || req.secure) {
      return next();
    }
    // If accessing from external IP and not HTTPS, redirect
    if (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
    next();
  });
}
*/

// Setup Swagger documentation
setupSwagger(app);

// Test CORS endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin || 'no-origin',
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Test IP endpoint
app.get('/api/ip-test', (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.ip;

  res.json({
    message: 'IP detection test',
    clientIP: clientIP,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'user-agent': req.headers['user-agent'],
      'origin': req.headers.origin
    },
    connection: {
      remoteAddress: req.connection?.remoteAddress,
      socketRemoteAddress: req.socket?.remoteAddress
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/catalog', catalogRoutes);
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
    // Test database connection with timeout
    console.log('🔍 Testing database connection...');
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    console.log('✅ Database connection established successfully');

    // Sync database (be careful in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database synchronized');
    }

    // Display all registered routes
    displayRoutes();

    const useHttps = process.argv.includes('--https') || process.env.USE_HTTPS === 'true';
    
    if (useHttps) {
      // HTTPS Server
      const certPath = path.join(__dirname, '..', 'certs', 'server.crt');
      const keyPath = path.join(__dirname, '..', 'certs', 'server.key');
      
      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };
        
        const httpsServer = https.createServer(options, app);
        
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
          console.log('🚀 Server Information (HTTPS):');
          console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`   • HTTPS Port: ${HTTPS_PORT}`);
          console.log(`   • Binding: 0.0.0.0:${HTTPS_PORT} (all interfaces)`);
          console.log(`   • Local URL: https://localhost:${HTTPS_PORT}/api`);
          console.log(`   • External URL: https://206.62.139.100:${HTTPS_PORT}/api`);
          console.log(`   • Documentation: https://localhost:${HTTPS_PORT}/api-docs`);
          console.log(`   • Health Check: https://localhost:${HTTPS_PORT}/api/health`);
          console.log('✅ HTTPS Server is running successfully!');
        });
        
        // Also start HTTP server for redirects
        const httpServer = app.listen(PORT, '0.0.0.0', () => {
          console.log(`🌐 HTTP Server (redirects): http://0.0.0.0:${PORT} - External: http://206.62.139.100:${PORT}`);
        });
        
        // Graceful shutdown for both servers
        const gracefulShutdown = (signal) => {
          console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
          
          httpsServer.close(() => {
            httpServer.close(async () => {
              console.log('🔄 Servers closed');
              
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
          });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
      } else {
        console.log('❌ SSL certificates not found!');
        console.log('Run: npm run ssl:create');
        process.exit(1);
      }
    } else {
      // HTTP Server (default)
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('🚀 Server Information:');
        console.log(`   • Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   • Port: ${PORT}`);
        console.log(`   • Binding: 0.0.0.0:${PORT} (all interfaces)`);
        console.log(`   • Local URL: http://localhost:${PORT}/api`);
        console.log(`   • External URL: http://206.62.139.100:${PORT}/api`);
        console.log(`   • Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
        console.log('✅ Server is running successfully!');
      });

      // Graceful shutdown
      const gracefulShutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
        
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
    }

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
  if (process.env.VERBOSE_LOGGING === 'true') {
    console.log('\n📋 Configured API Routes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Manual route definition based on our router files
    const routes = [
      // Authentication routes
      { method: 'POST', path: '/api/auth/register', group: 'Authentication', protected: false },
      { method: 'POST', path: '/api/auth/login', group: 'Authentication', protected: false },
      { method: 'POST', path: '/api/auth/refresh', group: 'Authentication', protected: false },
      { method: 'POST', path: '/api/auth/logout', group: 'Authentication', protected: true },
      { method: 'GET', path: '/api/auth/verify-email', group: 'Authentication', protected: false },
      { method: 'POST', path: '/api/auth/forgot-password', group: 'Authentication', protected: false },
      { method: 'POST', path: '/api/auth/reset-password', group: 'Authentication', protected: false },
      
      // User management routes
      { method: 'GET', path: '/api/users', group: 'User Management', protected: true },
      { method: 'GET', path: '/api/users/deleted', group: 'User Management', protected: true },
      { method: 'GET', path: '/api/users/:id', group: 'User Management', protected: true },
      { method: 'PUT', path: '/api/users/:id', group: 'User Management', protected: true },
      { method: 'DELETE', path: '/api/users/:id', group: 'User Management', protected: true },
      
      // Survey routes
      { method: 'POST', path: '/api/surveys', group: 'Surveys', protected: true },
      { method: 'GET', path: '/api/surveys/my', group: 'Surveys', protected: true },
      { method: 'GET', path: '/api/surveys/statistics', group: 'Surveys', protected: true },
      { method: 'GET', path: '/api/surveys/sector/:sectorName', group: 'Surveys', protected: true },
      { method: 'GET', path: '/api/surveys/:id', group: 'Surveys', protected: true },
      { method: 'PUT', path: '/api/surveys/:id/stages/:stageNumber', group: 'Surveys', protected: true },
      { method: 'POST', path: '/api/surveys/:id/members', group: 'Surveys', protected: true },
      { method: 'PUT', path: '/api/surveys/:id/members/:memberId', group: 'Surveys', protected: true },
      { method: 'DELETE', path: '/api/surveys/:id/members/:memberId', group: 'Surveys', protected: true },
      { method: 'POST', path: '/api/surveys/:id/complete', group: 'Surveys', protected: true },
      { method: 'POST', path: '/api/surveys/:id/cancel', group: 'Surveys', protected: true },
      { method: 'POST', path: '/api/surveys/:id/auto-save', group: 'Surveys', protected: true },
      { method: 'GET', path: '/api/surveys/:id/auto-save', group: 'Surveys', protected: true },
      
      // Catalog routes
      { method: 'GET', path: '/api/catalog/health', group: 'Catalog', protected: false },
      { method: 'POST', path: '/api/catalog/parroquias', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/parroquias', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/parroquias/search', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/parroquias/statistics', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true },
      { method: 'PUT', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true },
      { method: 'DELETE', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true },
      { method: 'POST', path: '/api/catalog/sectors', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sectors', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sectors/search', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sectors/statistics', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sectors/:id', group: 'Catalog', protected: true },
      { method: 'PUT', path: '/api/catalog/sectors/:id', group: 'Catalog', protected: true },
      { method: 'DELETE', path: '/api/catalog/sectors/:id', group: 'Catalog', protected: true },
      { method: 'POST', path: '/api/catalog/veredas', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/veredas', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/veredas/search', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/veredas/statistics', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true },
      { method: 'PUT', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true },
      { method: 'DELETE', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true },
      { method: 'POST', path: '/api/catalog/sexos', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sexos', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sexos/search', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sexos/statistics', group: 'Catalog', protected: true },
      { method: 'GET', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true },
      { method: 'PUT', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true },
      { method: 'DELETE', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true },
      
      // System routes
      { method: 'GET', path: '/api/health', group: 'System', protected: false },
      { method: 'GET', path: '/api/status', group: 'System', protected: false },
      { method: 'GET', path: '/api-docs', group: 'Documentation', protected: false },
      { method: 'GET', path: '/verify-email', group: 'Compatibility', protected: false },
      { method: 'GET', path: '/reset-password', group: 'Compatibility', protected: false },
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
    const surveyRoutes = routes.filter(r => r.group === 'Surveys').length;
    const catalogRoutes = routes.filter(r => r.group === 'Catalog').length;
    const systemRoutes = routes.filter(r => r.group === 'System').length;
    const compatRoutes = routes.filter(r => r.group === 'Compatibility').length;
    
    console.log(`   • Authentication: ${authRoutes} routes`);
    console.log(`   • User Management: ${userRoutes} routes`);
    console.log(`   • Surveys: ${surveyRoutes} routes`);
    console.log(`   • Catalog: ${catalogRoutes} routes`);
    console.log(`   • System: ${systemRoutes} routes`);
    console.log(`   • Compatibility: ${compatRoutes} routes`);
    console.log('');
  } else {
    // Simplified route summary
    console.log('📋 API Routes: Auth (7), Users (5), System (3), Compatibility (2) - Use VERBOSE_LOGGING=true for details');
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
