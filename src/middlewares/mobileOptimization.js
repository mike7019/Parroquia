/**
 * Mobile Optimization Middleware
 * Detecta dispositivos móviles y optimiza respuestas para iPhone/iOS
 */

export const mobileOptimizationMiddleware = (req, res, next) => {
  // Detectar User-Agent de dispositivos móviles
  const userAgent = req.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

  // Guardar info de dispositivo en request
  req.device = {
    isMobile,
    isIOS,
    isSafari,
    userAgent: userAgent.substring(0, 100)
  };

  // Headers optimizados para iOS/Safari
  res.setHeader('X-UA-Compatible', 'IE=edge,chrome=1');
  
  // Habilitar caching en dispositivos móviles para mejorar performance
  if (isMobile) {
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate'); // 5 minutos para APIs
    res.setHeader('Pragma', 'cache');
    res.setHeader('Expires', new Date(Date.now() + 300000).toUTCString());
  }

  // Headers para evitar problemas con Safari en iOS
  if (isSafari || isIOS) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Para descarga de archivos en Safari iOS
    if (req.url.includes('/download') || req.url.includes('/export')) {
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
    }
  }

  // Agregar headers de compresión para móviles
  res.setHeader('Vary', 'Accept-Encoding, User-Agent');
  
  // Header para mejorar performance en conexiones móviles
  if (isMobile) {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5, max=100');
  }

  next();
};

/**
 * Middleware para respuestas optimizadas para móvil
 * Reduce tamaño de respuestas para conexiones lentas
 */
export const mobileResponseOptimizer = (req, res, next) => {
  if (req.device?.isMobile) {
    // Interceptar json() para optimizar respuestas
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Limitar datos en respuestas de lista para móvil
      if (Array.isArray(data) && data.length > 0) {
        // Limitar a 50 items por defecto en móvil
        if (data.length > 50 && !req.query.limit) {
          data = data.slice(0, 50);
          // Avisar al cliente que hay más datos
          res.setHeader('X-Has-More', 'true');
        }
      }

      // Si es un objeto con datos, aplicar optimización
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Remover campos innecesarios para visualización móvil
        if (data.datos && Array.isArray(data.datos)) {
          data.datos = data.datos.map(item => optimizeObject(item));
        }
      }

      return originalJson(data);
    };
  }

  next();
};

/**
 * Optimiza un objeto removiendo campos innecesarios para móvil
 */
function optimizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const fieldsToRemove = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    '_meta',
    'metadata',
    'internalNotes',
    'systemFlags'
  ];

  const optimized = { ...obj };
  fieldsToRemove.forEach(field => {
    delete optimized[field];
  });

  return optimized;
}

/**
 * Middleware para manejo de conexión en móvil
 * Detecta desconexiones y reconexiones
 */
export const mobileConnectionHandler = (req, res, next) => {
  if (req.device?.isMobile) {
    // Timeout más largo para móviles (internet puede ser más lento)
    const timeoutDuration = 45000; // 45 segundos en lugar de 30

    req.setTimeout(timeoutDuration, () => {
      res.status(408).json({
        exito: false,
        mensaje: 'Solicitud expirada. Por favor, intenta de nuevo.',
        codigo: 'REQUEST_TIMEOUT'
      });
    });
  }

  next();
};

/**
 * Middleware para logging de dispositivos móviles
 */
export const mobileLogger = (req, res, next) => {
  if (req.device?.isMobile) {
    const { isMobile, isIOS, isSafari, userAgent } = req.device;
    const platform = isIOS ? 'iOS' : 'Android';
    const browser = isSafari ? 'Safari' : 'Navegador';
    
    console.log(`📱 [MOBILE] ${platform} - ${browser} - ${userAgent}`);
  }

  next();
};

export default {
  mobileOptimizationMiddleware,
  mobileResponseOptimizer,
  mobileConnectionHandler,
  mobileLogger
};
