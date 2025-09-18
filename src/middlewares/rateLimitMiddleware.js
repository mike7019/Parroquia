import rateLimit from 'express-rate-limit';
import { logger } from './loggingMiddleware.js';

/**
 * Rate limiting específico para encuestas
 */

// Rate limit general para consultas
export const encuestasQueryLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana por IP
  message: {
    status: 'error',
    message: 'Demasiadas consultas de encuestas. Intente nuevamente en 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido para consultas de encuestas', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Demasiadas consultas de encuestas. Intente nuevamente en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(15 * 60) // segundos
    });
  }
});

// Rate limit más estricto para creación de encuestas
export const encuestasCreateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 encuestas por hora por IP
  message: {
    status: 'error',
    message: 'Límite de creación de encuestas alcanzado. Intente nuevamente en 1 hora.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit excedido para creación de encuestas', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      apellido_familiar: req.body?.informacionGeneral?.apellido_familiar
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Límite de creación de encuestas alcanzado. Intente nuevamente en 1 hora.',
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(60 * 60) // segundos
    });
  }
});

// Rate limit para eliminaciones (muy restrictivo)
export const encuestasDeleteLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 5, // máximo 5 eliminaciones por día por IP
  message: {
    status: 'error',
    message: 'Límite de eliminaciones alcanzado. Intente nuevamente mañana.',
    code: 'DELETE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.error('Rate limit excedido para eliminación de encuestas', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      encuestaId: req.params?.id
    });
    
    res.status(429).json({
      status: 'error',
      message: 'Límite de eliminaciones alcanzado. Intente nuevamente mañana.',
      code: 'DELETE_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(24 * 60 * 60) // segundos
    });
  }
});

// Rate limit adaptativo basado en usuario autenticado
export const adaptiveRateLimit = (req, res, next) => {
  // Usuarios autenticados tienen límites más altos
  if (req.user) {
    // Límite más alto para usuarios autenticados
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200, // Doble del límite normal
      keyGenerator: (req) => req.user.id, // Por usuario, no por IP
      message: {
        status: 'error',
        message: 'Límite de requests alcanzado para su usuario.',
        code: 'USER_RATE_LIMIT_EXCEEDED'
      }
    })(req, res, next);
  } else {
    // Límite estándar para usuarios no autenticados
    return encuestasQueryLimit(req, res, next);
  }
};

export default {
  encuestasQueryLimit,
  encuestasCreateLimit,
  encuestasDeleteLimit,
  adaptiveRateLimit
};