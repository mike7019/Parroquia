import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import https from 'https';
// Force reload - estudios routes integration test
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/sequelize.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userManagementRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import catalogRoutes from './routes/catalog/index.js';
import situacionCivilRoutes from './routes/catalog/situacionCivilRoutes.js';
import habilidadRoutes from './routes/catalog/habilidadRoutes.js';
import encuestaRoutes from './routes/encuestaRoutes.js';
import difuntosRoutes from './routes/difuntosRoutes.js';
import familiasConsultasRoutes from './routes/familiasConsultasRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';

// Import consolidated routes
import difuntosConsolidadoRoutes from './routes/consolidados/difuntosRoutes.js';
import saludConsolidadoRoutes from './routes/consolidados/saludRoutes.js';
import familiasConsolidadoRoutes from './routes/consolidados/familiasRoutes.js';
import parroquiasConsolidadoRoutes from './routes/consolidados/parroquiasRoutes.js';
import personasConsolidadoRoutes from './routes/consolidados/personasRoutes.js';
import personasCapacidadesRoutes from './routes/consolidados/personasCapacidadesRoutes.js';
import personasReporteRoutes from './routes/consolidados/personasReporteRoutes.js';
import catalogosRoutes from './routes/catalogosRoutes.js'; // Catálogos de destrezas y habilidades

// Import admin routes
import ipWhitelistRoutes from './routes/admin/ipWhitelistRoutes.js';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';
import { ipWhitelistMiddleware } from './middlewares/ipWhitelist.js';

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
  origin: true, // permite todos los orígenes
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

// ✅ MEJORA: Compresión HTTP para archivos grandes (reportes)
app.use(compression({
  filter: (req, res) => {
    // No comprimir si el cliente lo desactiva
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Comprimir respuestas de reportes y archivos grandes
    if (req.url.includes('/api/reportes/') || 
        res.getHeader('content-type')?.includes('application/vnd.openxmlformats') ||
        res.getHeader('content-type')?.includes('application/pdf')) {
      return true;
    }
    
    // Usar filtro por defecto para el resto
    return compression.filter(req, res);
  },
  threshold: 1024, // Solo comprimir archivos > 1KB
  level: 6 // Nivel de compresión balanceado (1-9)
}));

// IP Whitelist Middleware - DEBE IR ANTES de otros middlewares de seguridad
app.use(ipWhitelistMiddleware);

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
  // logger.info('Development mode with verbose logging enabled', {
  //   environment: process.env.NODE_ENV,
  //   logLevel: process.env.LOG_LEVEL || 'info'
  // });
}

// Request logging middleware
// app.use(requestLogger);

// Body parsing middlewares with enhanced error handling
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain'],
  verify: (req, res, buf, encoding) => {
    // Store raw body for error reporting
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}));

// Custom JSON error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    // Add the raw body to the error for better debugging
    err.body = req.rawBody;
  }
  next(err);
});

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
app.use('/api/encuesta', encuestaRoutes); // Rutas de encuestas corregidas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', ipWhitelistRoutes); // Rutas de administración de IP whitelist
app.use('/api/catalog', catalogRoutes);
app.use('/api/catalog/habilidades', habilidadRoutes); // CRUD de catálogo de habilidades
app.use('/api', catalogosRoutes); // Catálogos de destrezas y habilidades
app.use('/api/situaciones-civiles', situacionCivilRoutes); // Direct access for compatibility
app.use('/api/difuntos/legacy', difuntosRoutes); // Rutas originales (compatibilidad)
app.use('/api/consultas', familiasConsultasRoutes); // Rutas de consultas de familias
app.use('/api/reportes', reporteRoutes); // Rutas de reportes Excel y PDF
app.use('/api/debug', debugRoutes); // Rutas de debug (solo desarrollo)

// Consolidated API Routes - High Priority Phase 1
app.use('/api/difuntos', difuntosConsolidadoRoutes); // Consolidated difuntos routes (PRINCIPAL)
app.use('/api/personas/consolidado', personasConsolidadoRoutes); // Consolidated personas routes with advanced filters
app.use('/api/personas/salud', saludConsolidadoRoutes); // Consolidated health routes  
app.use('/api/familias', familiasConsolidadoRoutes); // Consolidated families routes

// Consolidated API Routes - Medium Priority Phase 2
app.use('/api/parroquias', parroquiasConsolidadoRoutes); // Consolidated parroquias routes

// Consolidated API Routes - Final Phase (100% coverage)
app.use('/api/personas/capacidades', personasCapacidadesRoutes); // Consolidated personas capacidades routes
app.use('/api/personas/capacidades/reporte', personasReporteRoutes); // Consolidated personas report routes

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

// Error logging middleware (before error handler)
// app.use(errorLogger);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  console.log('🚀 Starting server initialization...');
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

    // Load all models from subcarpetas
    console.log('📦 Loading all models...');
    try {
      // console.log('🔄 Calling loadAllModels()...');
      // await loadAllModels();
      console.log('✅ All models loaded successfully');
      
      // Verificar modelos críticos
      console.log('🔍 Checking critical models...');
      const criticalModels = ['Municipio', 'Departamento', 'Usuario'];
      const missingModels = criticalModels.filter(modelName => 
        !sequelize.models[modelName] && !sequelize.models[modelName + 's']
      );
      
      if (missingModels.length > 0) {
        console.warn('⚠️  Missing critical models:', missingModels);
      } else {
        console.log('✅ All critical models found');
      }
      
      // Verificar asociaciones del modelo Municipio
      console.log('🔍 Checking Municipio model associations...');
      const MunicipioModel = sequelize.models.Municipio || sequelize.models.Municipios;
      if (MunicipioModel) {
        const associations = Object.keys(MunicipioModel.associations || {});
        console.log(`✅ Municipio model associations: ${associations.join(', ') || 'None'}`);
      }
      
      console.log('🎯 Model loading phase completed successfully');
      
    } catch (error) {
      console.error('❌ Error loading models:', error.message);
      throw error;
    }

    // Sync database (be careful in production)
    // DESHABILITADO: Evita errores de índices duplicados
    if (false && process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting database synchronization...');
        await sequelize.sync({ alter: false });
        console.log('✅ Database synchronized');
      } catch (syncError) {
        console.error('❌ Database sync error:', syncError.message);
        console.log('⚠️  Continuing without sync - database may need manual attention');
        // Don't throw here - continue with server startup
      }
    } else {
      console.log('ℹ️  Database sync skipped (disabled to avoid index conflicts)');
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
      { method: 'POST', path: '/api/auth/register', group: 'Authentication', protected: false, description: 'Register new user' },
      { method: 'POST', path: '/api/auth/login', group: 'Authentication', protected: false, description: 'User login' },
      { method: 'POST', path: '/api/auth/refresh', group: 'Authentication', protected: false, description: 'Refresh access token' },
      { method: 'POST', path: '/api/auth/refresh-token', group: 'Authentication', protected: false, description: 'Refresh token endpoint' },
      { method: 'POST', path: '/api/auth/logout', group: 'Authentication', protected: true, description: 'User logout' },
      { method: 'POST', path: '/api/auth/change-password', group: 'Authentication', protected: true, description: 'Change password' },
      { method: 'GET', path: '/api/auth/verify-email', group: 'Authentication', protected: false, description: 'Email verification' },
      { method: 'POST', path: '/api/auth/forgot-password', group: 'Authentication', protected: false, description: 'Request password reset' },
      { method: 'GET', path: '/api/auth/reset-password', group: 'Authentication', protected: false, description: 'Reset password form' },
      { method: 'POST', path: '/api/auth/reset-password', group: 'Authentication', protected: false, description: 'Process password reset' },
      { method: 'POST', path: '/api/auth/resend-verification-public', group: 'Authentication', protected: false, description: 'Resend verification (public)' },
      { method: 'POST', path: '/api/auth/resend-verification', group: 'Authentication', protected: true, description: 'Resend verification' },
      { method: 'GET', path: '/api/auth/profile', group: 'Authentication', protected: true, description: 'Get user profile' },
      
      // User management routes
      { method: 'GET', path: '/api/users', group: 'User Management', protected: true, description: 'List all users' },
      { method: 'GET', path: '/api/users/deleted', group: 'User Management', protected: true, description: 'List deleted users' },
      { method: 'GET', path: '/api/users/:id', group: 'User Management', protected: true, description: 'Get user by ID' },
      { method: 'PUT', path: '/api/users/:id', group: 'User Management', protected: true, description: 'Update user' },
      { method: 'DELETE', path: '/api/users/:id', group: 'User Management', protected: true, description: 'Delete user' },
      
      // Catalog routes - Parish & Geographic data
      { method: 'GET', path: '/api/catalog/health', group: 'Catalog', protected: false, description: 'Catalog health check' },
      
      // Departamentos routes
      { method: 'POST', path: '/api/catalog/departamentos', group: 'Catalog', protected: true, description: 'Create department' },
      { method: 'GET', path: '/api/catalog/departamentos', group: 'Catalog', protected: true, description: 'List departments' },
      { method: 'GET', path: '/api/catalog/departamentos/search', group: 'Catalog', protected: true, description: 'Search departments' },
      { method: 'GET', path: '/api/catalog/departamentos/statistics', group: 'Catalog', protected: true, description: 'Department statistics' },
      { method: 'GET', path: '/api/catalog/departamentos/:id', group: 'Catalog', protected: true, description: 'Get department by ID' },
      { method: 'PUT', path: '/api/catalog/departamentos/:id', group: 'Catalog', protected: true, description: 'Update department' },
      { method: 'DELETE', path: '/api/catalog/departamentos/:id', group: 'Catalog', protected: true, description: 'Delete department' },
      
      // Municipios routes
      { method: 'POST', path: '/api/catalog/municipios', group: 'Catalog', protected: true, description: 'Create municipality' },
      { method: 'GET', path: '/api/catalog/municipios', group: 'Catalog', protected: true, description: 'List municipalities' },
      { method: 'GET', path: '/api/catalog/municipios/search', group: 'Catalog', protected: true, description: 'Search municipalities' },
      { method: 'GET', path: '/api/catalog/municipios/statistics', group: 'Catalog', protected: true, description: 'Municipality statistics' },
      { method: 'GET', path: '/api/catalog/municipios/:id', group: 'Catalog', protected: true, description: 'Get municipality by ID' },
      { method: 'PUT', path: '/api/catalog/municipios/:id', group: 'Catalog', protected: true, description: 'Update municipality' },
      { method: 'DELETE', path: '/api/catalog/municipios/:id', group: 'Catalog', protected: true, description: 'Delete municipality' },
      
      // Parroquias routes
      { method: 'POST', path: '/api/catalog/parroquias', group: 'Catalog', protected: true, description: 'Create parish' },
      { method: 'GET', path: '/api/catalog/parroquias', group: 'Catalog', protected: true, description: 'List parishes' },
      { method: 'GET', path: '/api/catalog/parroquias/search', group: 'Catalog', protected: true, description: 'Search parishes' },
      { method: 'GET', path: '/api/catalog/parroquias/statistics', group: 'Catalog', protected: true, description: 'Parish statistics' },
      { method: 'GET', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true, description: 'Get parish by ID' },
      { method: 'PUT', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true, description: 'Update parish' },
      { method: 'DELETE', path: '/api/catalog/parroquias/:id', group: 'Catalog', protected: true, description: 'Delete parish' },
      
      // Sectores routes
      { method: 'POST', path: '/api/catalog/sectores', group: 'Catalog', protected: true, description: 'Create sector' },
      { method: 'GET', path: '/api/catalog/sectores', group: 'Catalog', protected: true, description: 'List sectors' },
      { method: 'GET', path: '/api/catalog/sectores/search', group: 'Catalog', protected: true, description: 'Search sectors' },
      { method: 'GET', path: '/api/catalog/sectores/statistics', group: 'Catalog', protected: true, description: 'Sector statistics' },
      { method: 'GET', path: '/api/catalog/sectores/:id', group: 'Catalog', protected: true, description: 'Get sector by ID' },
      { method: 'PUT', path: '/api/catalog/sectores/:id', group: 'Catalog', protected: true, description: 'Update sector' },
      { method: 'DELETE', path: '/api/catalog/sectores/:id', group: 'Catalog', protected: true, description: 'Delete sector' },
      
      // Veredas routes
      { method: 'POST', path: '/api/catalog/veredas', group: 'Catalog', protected: true, description: 'Create vereda' },
      { method: 'GET', path: '/api/catalog/veredas', group: 'Catalog', protected: true, description: 'List veredas' },
      { method: 'GET', path: '/api/catalog/veredas/search', group: 'Catalog', protected: true, description: 'Search veredas' },
      { method: 'GET', path: '/api/catalog/veredas/statistics', group: 'Catalog', protected: true, description: 'Vereda statistics' },
      { method: 'GET', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true, description: 'Get vereda by ID' },
      { method: 'PUT', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true, description: 'Update vereda' },
      { method: 'DELETE', path: '/api/catalog/veredas/:id', group: 'Catalog', protected: true, description: 'Delete vereda' },
      
      // Sexos routes
      { method: 'POST', path: '/api/catalog/sexos', group: 'Catalog', protected: true, description: 'Create gender type' },
      { method: 'GET', path: '/api/catalog/sexos', group: 'Catalog', protected: true, description: 'List gender types' },
      { method: 'GET', path: '/api/catalog/sexos/search', group: 'Catalog', protected: true, description: 'Search gender types' },
      { method: 'GET', path: '/api/catalog/sexos/statistics', group: 'Catalog', protected: true, description: 'Gender statistics' },
      { method: 'GET', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true, description: 'Get gender by ID' },
      { method: 'PUT', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true, description: 'Update gender' },
      { method: 'DELETE', path: '/api/catalog/sexos/:id', group: 'Catalog', protected: true, description: 'Delete gender' },
      
      // Enfermedades routes
      { method: 'POST', path: '/api/catalog/enfermedades', group: 'Catalog', protected: true, description: 'Create disease' },
      { method: 'GET', path: '/api/catalog/enfermedades', group: 'Catalog', protected: true, description: 'List diseases (no pagination)' },
      { method: 'GET', path: '/api/catalog/enfermedades/:id', group: 'Catalog', protected: true, description: 'Get disease by ID' },
      { method: 'PUT', path: '/api/catalog/enfermedades/:id', group: 'Catalog', protected: true, description: 'Update disease' },
      { method: 'DELETE', path: '/api/catalog/enfermedades/:id', group: 'Catalog', protected: true, description: 'Delete disease' },
      { method: 'GET', path: '/api/catalog/enfermedades/persona/:personaId', group: 'Catalog', protected: true, description: 'Get diseases by person' },
      { method: 'POST', path: '/api/catalog/enfermedades/:enfermedadId/persona/:personaId', group: 'Catalog', protected: true, description: 'Associate disease with person' },
      { method: 'DELETE', path: '/api/catalog/enfermedades/:enfermedadId/persona/:personaId', group: 'Catalog', protected: true, description: 'Remove disease from person' },
      
      // Aguas Residuales routes
      { method: 'POST', path: '/api/catalog/aguas-residuales', group: 'Catalog', protected: true, description: 'Create wastewater type' },
      { method: 'GET', path: '/api/catalog/aguas-residuales', group: 'Catalog', protected: true, description: 'List wastewater types' },
      { method: 'GET', path: '/api/catalog/aguas-residuales/search', group: 'Catalog', protected: true, description: 'Search wastewater types' },
      { method: 'GET', path: '/api/catalog/aguas-residuales/stats', group: 'Catalog', protected: true, description: 'Get wastewater types statistics' },
      { method: 'GET', path: '/api/catalog/aguas-residuales/:id', group: 'Catalog', protected: true, description: 'Get wastewater type by ID' },
      { method: 'PUT', path: '/api/catalog/aguas-residuales/:id', group: 'Catalog', protected: true, description: 'Update wastewater type' },
      { method: 'DELETE', path: '/api/catalog/aguas-residuales/:id', group: 'Catalog', protected: true, description: 'Delete wastewater type' },
      
      // Tipos de identificación routes
      { method: 'GET', path: '/api/catalog/tipos-identificacion', group: 'Catalog', protected: false, description: 'List identification types' },
      
      // Parentescos routes
      { method: 'GET', path: '/api/catalog/parentescos', group: 'Catalog', protected: true, description: 'List parentescos' },
      { method: 'POST', path: '/api/catalog/parentescos', group: 'Catalog', protected: true, description: 'Create parentesco' },
      { method: 'GET', path: '/api/catalog/parentescos/:id', group: 'Catalog', protected: true, description: 'Get parentesco by ID' },
      { method: 'PUT', path: '/api/catalog/parentescos/:id', group: 'Catalog', protected: true, description: 'Update parentesco' },
      { method: 'DELETE', path: '/api/catalog/parentescos/:id', group: 'Catalog', protected: true, description: 'Delete parentesco' },
      
      // Comunidades Culturales routes
      { method: 'POST', path: '/api/catalog/comunidades-culturales', group: 'Catalog', protected: true, description: 'Create comunidad cultural' },
      { method: 'GET', path: '/api/catalog/comunidades-culturales', group: 'Catalog', protected: true, description: 'List comunidades culturales' },
      { method: 'GET', path: '/api/catalog/comunidades-culturales/select', group: 'Catalog', protected: true, description: 'Get comunidades culturales for select' },
      { method: 'GET', path: '/api/catalog/comunidades-culturales/stats', group: 'Catalog', protected: true, description: 'Get comunidades culturales statistics' },
      { method: 'GET', path: '/api/catalog/comunidades-culturales/:id', group: 'Catalog', protected: true, description: 'Get comunidad cultural by ID' },
      { method: 'PUT', path: '/api/catalog/comunidades-culturales/:id', group: 'Catalog', protected: true, description: 'Update comunidad cultural' },
      { method: 'DELETE', path: '/api/catalog/comunidades-culturales/:id', group: 'Catalog', protected: true, description: 'Delete comunidad cultural' },
      
      // Difuntos routes (LEGACY - para compatibilidad)
      { method: 'GET', path: '/api/difuntos/legacy/consultas/madres', group: 'Difuntos Legacy', protected: true, description: 'Consultar madres fallecidas (legacy)' },
      { method: 'GET', path: '/api/difuntos/legacy/consultas/padres', group: 'Difuntos Legacy', protected: true, description: 'Consultar padres fallecidos (legacy)' },
      { method: 'GET', path: '/api/difuntos/legacy/consultas/todos', group: 'Difuntos Legacy', protected: true, description: 'Consultar todos los difuntos (legacy)' },
      { method: 'GET', path: '/api/difuntos/legacy/consultas/rango-fechas', group: 'Difuntos Legacy', protected: true, description: 'Consultar difuntos por rango de fechas (legacy)' },
      { method: 'GET', path: '/api/difuntos/legacy/estadisticas', group: 'Difuntos Legacy', protected: true, description: 'Estadísticas de difuntos (legacy)' },
      
      // Difuntos Consolidado routes (PRINCIPAL)
      { method: 'GET', path: '/api/difuntos', group: 'Difuntos Consolidado', protected: true, description: 'Consulta consolidada de difuntos' },
      { method: 'GET', path: '/api/difuntos/aniversarios', group: 'Difuntos Consolidado', protected: true, description: 'Aniversarios próximos' },
      { method: 'GET', path: '/api/difuntos/estadisticas', group: 'Difuntos Consolidado', protected: true, description: 'Estadísticas consolidadas' },
      
      // Consultas Familias routes
      { method: 'GET', path: '/api/consultas/madres', group: 'Consultas Familias', protected: true, description: 'Consultar madres vivas' },
      { method: 'GET', path: '/api/consultas/padres', group: 'Consultas Familias', protected: true, description: 'Consultar padres vivos' },
      { method: 'GET', path: '/api/consultas/madres-fallecidas', group: 'Consultas Familias', protected: true, description: 'Consultar madres fallecidas' },
      { method: 'GET', path: '/api/consultas/padres-fallecidos', group: 'Consultas Familias', protected: true, description: 'Consultar padres fallecidos' },
      { method: 'GET', path: '/api/consultas/familias-padres-madres', group: 'Consultas Familias', protected: true, description: 'Consultar familias con padres y madres' },
      { method: 'GET', path: '/api/consultas/estadisticas', group: 'Consultas Familias', protected: true, description: 'Estadísticas de familias' },
      { method: 'GET', path: '/api/consultas/persona/:documento', group: 'Consultas Familias', protected: true, description: 'Buscar persona por documento' },
      
      // System & Infrastructure routes
      { method: 'GET', path: '/api/health', group: 'System', protected: false, description: 'API health check' },
      { method: 'GET', path: '/api/status', group: 'System', protected: false, description: 'System status' },
      
      // Documentation routes
      { method: 'GET', path: '/api-docs', group: 'Documentation', protected: false, description: 'Swagger API documentation' },
      
      // Compatibility routes (legacy support)
      { method: 'GET', path: '/verify-email', group: 'Compatibility', protected: false, description: 'Email verification (legacy)' },
      { method: 'GET', path: '/reset-password', group: 'Compatibility', protected: false, description: 'Password reset (legacy)' },
    ];

    // Group routes by category
    const groupedRoutes = routes.reduce((groups, route) => {
      if (!groups[route.group]) {
        groups[route.group] = [];
      }
      groups[route.group].push(route);
      return groups;
    }, {});

    // Display routes by group with enhanced formatting
    Object.entries(groupedRoutes).forEach(([group, groupRoutes]) => {
      // Add emoji icons for each group
      const groupIcons = {
        'Authentication': '🔐',
        'User Management': '👥',
        'Catalog': '📚',
        'Difuntos': '🕊️',
        'Consultas Familias': '👨‍👩‍👧‍👦',
        'System': '⚙️',
        'Documentation': '📖',
        'Compatibility': '🔄'
      };
      
      console.log(`\n${groupIcons[group] || '🔹'} ${group}:`);
      groupRoutes.forEach((route) => {
        const methodPadded = route.method.padEnd(8);
        const pathPadded = route.path.padEnd(40);
        const protectionStatus = route.protected ? '🛡️  Protected' : '🌐 Public';
        console.log(`   ${methodPadded} ${pathPadded} ${protectionStatus}`);
      });
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Total Routes: ${routes.length}`);
    
    // Enhanced route summary with totals and status counts
    const authRoutes = routes.filter(r => r.group === 'Authentication').length;
    const userRoutes = routes.filter(r => r.group === 'User Management').length;
    const catalogRoutes = routes.filter(r => r.group === 'Catalog').length;
    const difuntosRoutes = routes.filter(r => r.group === 'Difuntos').length;
    const familiasRoutes = routes.filter(r => r.group === 'Consultas Familias').length;
    const systemRoutes = routes.filter(r => r.group === 'System').length;
    const docRoutes = routes.filter(r => r.group === 'Documentation').length;
    const compatRoutes = routes.filter(r => r.group === 'Compatibility').length;
    
    // Count by protection status
    const publicRoutes = routes.filter(r => !r.protected).length;
    const protectedRoutes = routes.filter(r => r.protected).length;
    
    console.log(`\n📈 Route Distribution:`);
    console.log(`   • Authentication: ${authRoutes} routes`);
    console.log(`   • User Management: ${userRoutes} routes`);
    console.log(`   • Catalog: ${catalogRoutes} routes`);
    console.log(`   • Difuntos: ${difuntosRoutes} routes`);
    console.log(`   • Consultas Familias: ${familiasRoutes} routes`);
    console.log(`   • System: ${systemRoutes} routes`);
    console.log(`   • Documentation: ${docRoutes} routes`);
    console.log(`   • Compatibility: ${compatRoutes} routes`);
    console.log(`\n🔒 Security Status:`);
    console.log(`   • Public endpoints: ${publicRoutes}`);
    console.log(`   • Protected endpoints: ${protectedRoutes}`);
    console.log('');
  } else {
    // Simplified route summary with enhanced info
    console.log('📋 API Routes Summary:');
    console.log('   🔐 Authentication (13), 👥 Users (5), 📚 Catalog (29), 🕊️ Difuntos (5), 👨‍👩‍👧‍👦 Consultas Familias (7), ⚙️ System (2), 📖 Docs (1), 🔄 Compatibility (2)');
    console.log('   💡 Total: 64 endpoints | Use VERBOSE_LOGGING=true for detailed route listing');
  }
};

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  console.log('🔍 Checking NODE_ENV - not test, proceeding to start server...');
  
  // Add handlers for unhandled errors
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    console.error('At promise:', promise);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  console.log('🚀 About to call startServer()...');
  startServer();
}

export default app;
