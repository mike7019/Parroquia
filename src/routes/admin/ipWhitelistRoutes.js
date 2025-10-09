import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import { 
  getWhitelistedIPs, 
  addIPToWhitelist, 
  removeIPFromWhitelist,
  getRealIP 
} from '../../middlewares/ipWhitelist.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/ip-whitelist:
 *   get:
 *     tags: [Admin - IP Whitelist]
 *     summary: Obtener lista de IPs permitidas
 *     description: Obtiene la lista completa de IPs en la whitelist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de IPs obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     whitelistedIPs:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["187.113.156.8", "127.0.0.1"]
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo administradores)
 */
router.get('/ip-whitelist',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  (req, res) => {
    try {
      const whitelistedIPs = getWhitelistedIPs();
      const currentIP = getRealIP(req);
      
      res.json({
        status: 'success',
        mensaje: 'Lista de IPs whitelisted obtenida exitosamente',
        datos: {
          whitelistedIPs,
          currentClientIP: currentIP,
          isCurrentIPWhitelisted: req.isWhitelisted || false,
          total: whitelistedIPs.length
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al obtener lista de IPs whitelisted',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/ip-whitelist:
 *   post:
 *     tags: [Admin - IP Whitelist]
 *     summary: Agregar IP a la whitelist
 *     description: Agrega una IP específica a la whitelist para bypasear rate limiting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ip
 *             properties:
 *               ip:
 *                 type: string
 *                 description: Dirección IP a agregar
 *                 example: "187.113.156.8"
 *               description:
 *                 type: string
 *                 description: Descripción opcional de por qué se agrega la IP
 *                 example: "Usuario en Brasil"
 *     responses:
 *       200:
 *         description: IP agregada exitosamente
 *       400:
 *         description: IP inválida o ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo administradores)
 */
router.post('/ip-whitelist',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  (req, res) => {
    try {
      const { ip, description } = req.body;
      
      if (!ip) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'La dirección IP es requerida'
        });
      }
      
      // Validar formato básico de IP
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(ip)) {
        return res.status(400).json({
          status: 'error',
          mensaje: 'Formato de IP inválido. Debe ser IPv4 (ej: 187.113.156.8)'
        });
      }
      
      const added = addIPToWhitelist(ip);
      
      if (added) {
        res.json({
          status: 'success',
          mensaje: `IP ${ip} agregada a la whitelist exitosamente`,
          datos: {
            ip,
            description: description || 'Sin descripción',
            addedBy: req.user.correo_electronico,
            addedAt: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          mensaje: `La IP ${ip} ya está en la whitelist`
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al agregar IP a whitelist',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/ip-whitelist/{ip}:
 *   delete:
 *     tags: [Admin - IP Whitelist]
 *     summary: Remover IP de la whitelist
 *     description: Remueve una IP específica de la whitelist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ip
 *         required: true
 *         schema:
 *           type: string
 *         description: Dirección IP a remover
 *         example: "187.113.156.8"
 *     responses:
 *       200:
 *         description: IP removida exitosamente
 *       400:
 *         description: IP no encontrada en whitelist
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (solo administradores)
 */
router.delete('/ip-whitelist/:ip',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  (req, res) => {
    try {
      const { ip } = req.params;
      
      // No permitir eliminar localhost
      if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return res.status(400).json({
          status: 'error',
          mensaje: 'No se puede remover la IP de localhost de la whitelist'
        });
      }
      
      const removed = removeIPFromWhitelist(ip);
      
      if (removed) {
        res.json({
          status: 'success',
          mensaje: `IP ${ip} removida de la whitelist exitosamente`,
          datos: {
            ip,
            removedBy: req.user.correo_electronico,
            removedAt: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          status: 'error',
          mensaje: `La IP ${ip} no está en la whitelist`
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al remover IP de whitelist',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/admin/ip-whitelist/check:
 *   get:
 *     tags: [Admin - IP Whitelist]
 *     summary: Verificar IP actual
 *     description: Obtiene la IP actual del cliente y verifica si está en whitelist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de IP obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentIP:
 *                       type: string
 *                     isWhitelisted:
 *                       type: boolean
 *                     headers:
 *                       type: object
 */
router.get('/ip-whitelist/check',
  authMiddleware.authenticateToken,
  (req, res) => {
    try {
      const currentIP = getRealIP(req);
      
      res.json({
        status: 'success',
        datos: {
          currentIP,
          isWhitelisted: req.isWhitelisted || false,
          headers: {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'user-agent': req.headers['user-agent']
          },
          connectionInfo: {
            remoteAddress: req.connection.remoteAddress,
            socketAddress: req.socket.remoteAddress
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        mensaje: 'Error al verificar IP',
        error: error.message
      });
    }
  }
);

export default router;
