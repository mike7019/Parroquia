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
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'", "https:", "http:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  // Disable HSTS in development to allow HTTP
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false
}));

// CORS configuration - Allow all origins for development/deployment
app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS Check - Origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ CORS: Development mode - allowing all origins');
      return callback(null, true);
    }
    
    // If ALLOW_ALL_ORIGINS is explicitly set to true, allow everything
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      console.log('✅ CORS: ALLOW_ALL_ORIGINS=true - allowing all origins');
      return callback(null, true);
    }
    
    // Build allowed origins list
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : 
      ['http://localhost:3000', 'https://localhost:3000'];
    
    // Add your external IP origins automatically
    const externalIpOrigins = [
      'http://206.62.139.100:3000',
      'https://206.62.139.100:3000',
      'http://206.62.139.100:3001',
      'https://206.62.139.100:3001'
    ];
    
    const allAllowedOrigins = [...allowedOrigins, ...externalIpOrigins];
    
    console.log('🔍 CORS: Checking origin against allowed origins:', allAllowedOrigins);
    
    // Check if origin is in allowed list
    if (allAllowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin allowed');
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin not allowed:', origin);
      // In production, be more lenient and allow most origins
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  CORS: Production mode - allowing anyway for external access');
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Origin', 
    'Accept',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'X-Forwarded-For',
    'X-Real-IP'
  ],
  exposedHeaders: ['X-Total-Count', 'Content-Range'],
  // Pre-flight cache duration
  maxAge: 86400, // 24 hours
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Additional CORS headers middleware for problematic requests
app.use((req, res, next) => {
  // Log request details for debugging
  console.log(`🌐 Request: ${req.method} ${req.url} from Origin: ${req.headers.origin || 'no-origin'}`);
  
  // Set additional CORS headers manually for external IP access
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

// Body parsing middlewares
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Force HTTPS in production (for external access)
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
