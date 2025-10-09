import { logger } from './loggingMiddleware.js';

/**
 * Middleware para permitir IPs específicas sin restricciones de rate limiting
 * Útil para permitir acceso desde ubicaciones específicas (ej: Brasil, otros países)
 */

// Lista de IPs permitidas (whitelist)
const WHITELISTED_IPS = [
  '187.113.156.8',  // IP de Brasil - Usuario específico
  '::1',            // localhost IPv6
  '127.0.0.1',      // localhost IPv4
  '::ffff:127.0.0.1' // localhost IPv4 mapeado a IPv6
];

// Rangos de red permitidos (CIDR notation)
const WHITELISTED_RANGES = [
  // Agregar rangos aquí si es necesario
  // Ejemplo: '192.168.0.0/16' para toda la red local
];

/**
 * Extrae la IP real del request, considerando proxies y load balancers
 */
const getRealIP = (req) => {
  // Intentar obtener IP de diferentes headers (en orden de prioridad)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for puede contener múltiples IPs, tomamos la primera
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // Fallback a la IP directa
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
};

/**
 * Verifica si una IP está en la whitelist
 */
const isIPWhitelisted = (ip) => {
  if (!ip) return false;
  
  // Normalizar IP (remover prefijo IPv6 si existe)
  const normalizedIP = ip.replace('::ffff:', '');
  
  // Verificar en lista de IPs exactas
  if (WHITELISTED_IPS.includes(normalizedIP) || WHITELISTED_IPS.includes(ip)) {
    return true;
  }
  
  // Verificar en rangos CIDR (si se implementan en el futuro)
  // TODO: Implementar verificación de rangos CIDR si es necesario
  
  return false;
};

/**
 * Middleware que marca las requests de IPs whitelisted
 * y las excluye del rate limiting
 */
export const ipWhitelistMiddleware = (req, res, next) => {
  const clientIP = getRealIP(req);
  
  if (isIPWhitelisted(clientIP)) {
    // Marcar el request como whitelisted
    req.isWhitelisted = true;
    
    logger.info('Request from whitelisted IP', {
      ip: clientIP,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};

/**
 * Middleware de rate limiting que excluye IPs whitelisted
 * Usar en lugar de los rate limiters normales
 */
export const rateLimitWithWhitelist = (limiter) => {
  return (req, res, next) => {
    // Si la IP está en whitelist, saltar el rate limiting
    if (req.isWhitelisted) {
      logger.debug('Skipping rate limit for whitelisted IP', {
        ip: getRealIP(req)
      });
      return next();
    }
    
    // Aplicar rate limiting normal
    return limiter(req, res, next);
  };
};

/**
 * Agregar IP a la whitelist dinámicamente (útil para administración)
 */
export const addIPToWhitelist = (ip) => {
  const normalizedIP = ip.replace('::ffff:', '');
  
  if (!WHITELISTED_IPS.includes(normalizedIP)) {
    WHITELISTED_IPS.push(normalizedIP);
    logger.info('IP agregada a whitelist', { ip: normalizedIP });
    return true;
  }
  
  return false;
};

/**
 * Remover IP de la whitelist dinámicamente
 */
export const removeIPFromWhitelist = (ip) => {
  const normalizedIP = ip.replace('::ffff:', '');
  const index = WHITELISTED_IPS.indexOf(normalizedIP);
  
  if (index > -1) {
    WHITELISTED_IPS.splice(index, 1);
    logger.info('IP removida de whitelist', { ip: normalizedIP });
    return true;
  }
  
  return false;
};

/**
 * Obtener lista actual de IPs whitelisted
 */
export const getWhitelistedIPs = () => {
  return [...WHITELISTED_IPS]; // Retornar copia para evitar modificaciones directas
};

/**
 * Exportar funciones auxiliares
 */
export { getRealIP, isIPWhitelisted };

export default {
  ipWhitelistMiddleware,
  rateLimitWithWhitelist,
  addIPToWhitelist,
  removeIPFromWhitelist,
  getWhitelistedIPs,
  isIPWhitelisted,
  getRealIP
};
