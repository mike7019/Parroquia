/**
 * Logger estructurado específico para el servicio de reportes
 * Proporciona logging detallado con contexto y métricas
 */

import winston from 'winston';
import path from 'path';

// Configurar formato personalizado para reportes
const reporteFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, operation, userId, ...meta }) => {
    const baseLog = {
      timestamp,
      level,
      service: service || 'reportes',
      operation,
      userId,
      message,
      ...meta
    };
    
    return JSON.stringify(baseLog);
  })
);

// Crear logger específico para reportes
const reporteLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: reporteFormat,
  defaultMeta: { 
    service: 'reportes',
    version: '1.0.0'
  },
  transports: [
    // Console en desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, operation, userId, ...meta }) => {
          const userInfo = userId ? `[User:${userId}]` : '';
          const opInfo = operation ? `[${operation}]` : '';
          const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} ${level}: ${userInfo}${opInfo} ${message}${metaStr}`;
        })
      )
    }),
    
    // Archivo para todos los logs de reportes
    new winston.transports.File({
      filename: path.join('logs', 'reportes.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Archivo separado para errores
    new winston.transports.File({
      filename: path.join('logs', 'reportes-errors.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
      tailable: true
    })
  ]
});

/**
 * Wrapper para logging de operaciones de reportes
 */
class ReporteLogger {
  constructor() {
    this.logger = reporteLogger;
    this.startTimes = new Map();
  }

  /**
   * Log de inicio de operación
   */
  operacionIniciada(operation, userId, metadata = {}) {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTimes.set(operationId, Date.now());
    
    this.logger.info('Operación iniciada', {
      operation,
      operationId,
      userId,
      ...metadata
    });
    
    return operationId;
  }

  /**
   * Log de finalización exitosa
   */
  operacionCompletada(operationId, operation, userId, resultado = {}) {
    const startTime = this.startTimes.get(operationId);
    const duracion = startTime ? Date.now() - startTime : 0;
    this.startTimes.delete(operationId);
    
    this.logger.info('Operación completada', {
      operation,
      operationId,
      userId,
      duracion,
      ...resultado
    });
  }

  /**
   * Log de error en operación
   */
  operacionFallida(operationId, operation, userId, error, contexto = {}) {
    const startTime = this.startTimes.get(operationId);
    const duracion = startTime ? Date.now() - startTime : 0;
    this.startTimes.delete(operationId);
    
    this.logger.error('Operación fallida', {
      operation,
      operationId,
      userId,
      duracion,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...contexto
    });
  }

  /**
   * Log de cache hit/miss
   */
  cacheEvent(operation, hit, key, metadata = {}) {
    this.logger.debug('Cache event', {
      operation: 'cache',
      cacheOperation: operation,
      hit,
      key,
      ...metadata
    });
  }

  /**
   * Log de métricas de rendimiento
   */
  metricas(operation, metricas) {
    this.logger.info('Métricas de rendimiento', {
      operation: 'metrics',
      reporteOperation: operation,
      ...metricas
    });
  }

  /**
   * Log de validación de seguridad
   */
  seguridadEvent(event, userId, detalles = {}) {
    this.logger.warn('Evento de seguridad', {
      operation: 'security',
      securityEvent: event,
      userId,
      ...detalles
    });
  }

  /**
   * Log básico de información
   */
  info(message, metadata = {}) {
    this.logger.info(message, metadata);
  }

  /**
   * Log de advertencia
   */
  warn(message, metadata = {}) {
    this.logger.warn(message, metadata);
  }

  /**
   * Log de error
   */
  error(message, error = null, metadata = {}) {
    const errorData = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : {};
    
    this.logger.error(message, {
      ...errorData,
      ...metadata
    });
  }

  /**
   * Log de debug
   */
  debug(message, metadata = {}) {
    this.logger.debug(message, metadata);
  }
}

// Crear directorio de logs si no existe
import fs from 'fs';
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

export default new ReporteLogger();
