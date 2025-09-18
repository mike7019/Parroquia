import winston from 'winston';

// Configurar logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'encuestas-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// En desarrollo, también log a consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Middleware de logging para encuestas
 */
class EncuestaLoggingMiddleware {
  
  /**
   * Log de operaciones de encuesta
   */
  static logOperacion(operacion) {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log de inicio
      logger.info(`[${operacion}] Iniciando operación`, {
        operacion,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      // Interceptar respuesta para log de finalización
      const originalSend = res.send;
      res.send = function(data) {
        const duration = Date.now() - startTime;
        
        logger.info(`[${operacion}] Operación completada`, {
          operacion,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          success: res.statusCode < 400,
          timestamp: new Date().toISOString()
        });

        return originalSend.call(this, data);
      };

      next();
    };
  }

  /**
   * Log de errores específicos de encuestas
   */
  static logError(error, req, res, next) {
    logger.error('Error en operación de encuesta', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    next(error);
  }

  /**
   * Log de validaciones fallidas
   */
  static logValidationError(errors, context) {
    logger.warn('Errores de validación en encuesta', {
      errors,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log de operaciones de base de datos
   */
  static logDatabaseOperation(operation, details) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[DB] ${operation}`, {
        operation,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export { logger, EncuestaLoggingMiddleware };
export default EncuestaLoggingMiddleware;