import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sistema de logging estructurado con múltiples niveles y transportes
 */
class Logger {
  constructor() {
    // Asegurar que el directorio de logs existe
    const logsDir = path.join(__dirname, '../../logs');
    try {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Warning: Could not create logs directory:', error.message);
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
          });
        })
      ),
      defaultMeta: {
        service: 'parroquia-api',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Archivo de errores
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs/error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        
        // Archivo combinado
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs/combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),

        // Archivo de acceso/requests
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs/access.log'),
          level: 'http',
          maxsize: 5242880, // 5MB
          maxFiles: 3
        })
      ],
      
      // Manejar excepciones no capturadas
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs/exceptions.log')
        })
      ],
      
      // Manejar rechazos de promesas no capturadas
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(__dirname, '../../logs/rejections.log')
        })
      ]
    });

    // Agregar consola solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
          })
        )
      }));
    }
  }

  /**
   * Métodos de logging con contexto estructurado
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error.code,
          statusCode: error.statusCode
        }
      })
    };
    this.logger.error(message, errorMeta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  http(message, meta = {}) {
    this.logger.http(message, meta);
  }

  /**
   * Logging específico para operaciones de base de datos
   */
  database(operation, meta = {}) {
    this.logger.info(`Database ${operation}`, {
      category: 'database',
      operation,
      ...meta
    });
  }

  /**
   * Logging específico para autenticación
   */
  auth(action, meta = {}) {
    this.logger.info(`Auth ${action}`, {
      category: 'authentication',
      action,
      ...meta
    });
  }

  /**
   * Logging específico para APIs
   */
  api(endpoint, method, statusCode, meta = {}) {
    this.logger.http(`${method} ${endpoint} - ${statusCode}`, {
      category: 'api',
      endpoint,
      method,
      statusCode,
      ...meta
    });
  }

  /**
   * Logging para eventos de seguridad
   */
  security(event, meta = {}) {
    this.logger.warn(`Security Event: ${event}`, {
      category: 'security',
      event,
      ...meta
    });
  }

  /**
   * Logging para performance
   */
  performance(operation, duration, meta = {}) {
    this.logger.info(`Performance: ${operation}`, {
      category: 'performance',
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  }

  /**
   * Crear logger con contexto específico
   */
  child(defaultMeta = {}) {
    return {
      info: (message, meta = {}) => this.info(message, { ...defaultMeta, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...defaultMeta, ...meta }),
      error: (message, error = null, meta = {}) => this.error(message, error, { ...defaultMeta, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...defaultMeta, ...meta }),
      http: (message, meta = {}) => this.http(message, { ...defaultMeta, ...meta }),
      database: (operation, meta = {}) => this.database(operation, { ...defaultMeta, ...meta }),
      auth: (action, meta = {}) => this.auth(action, { ...defaultMeta, ...meta }),
      api: (endpoint, method, statusCode, meta = {}) => this.api(endpoint, method, statusCode, { ...defaultMeta, ...meta }),
      security: (event, meta = {}) => this.security(event, { ...defaultMeta, ...meta }),
      performance: (operation, duration, meta = {}) => this.performance(operation, duration, { ...defaultMeta, ...meta })
    };
  }
}

/**
 * Middleware para logging de requests HTTP
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const userAgent = req.get('user-agent') || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Log del request
  logger.http('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip,
    userAgent,
    userId: req.user?.id || null,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Override del método end para capturar la respuesta
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.api(req.originalUrl, req.method, res.statusCode, {
      duration: `${duration}ms`,
      ip,
      userId: req.user?.id || null,
      responseSize: res.get('content-length') || chunk?.length || 0
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Middleware para capturar errores no manejados
 */
export const errorLogger = (err, req, res, next) => {
  const context = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null,
    body: req.body,
    params: req.params,
    query: req.query
  };

  logger.error('Request error', err, context);
  next(err);
};

// Crear instancia singleton
const logger = new Logger();

export default logger;
