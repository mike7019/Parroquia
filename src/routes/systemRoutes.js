import express from 'express';
import sequelize from '../../config/sequelize.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: Endpoints del sistema y verificación de salud
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [System]
 *     summary: Verificación de salud del API
 *     description: Endpoint para verificar que el API está funcionando correctamente
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Parroquia API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-16T15:30:00.000Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 uptime:
 *                   type: number
 *                   example: 3600.5
 *             example:
 *               status: "OK"
 *               message: "Parroquia API is running"
 *               timestamp: "2025-07-16T15:30:00.000Z"
 *               version: "1.0.0"
 *               environment: "development"
 *               uptime: 3600.5
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Parroquia API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags: [System]
 *     summary: Estado detallado del sistema
 *     description: Endpoint para verificar el estado de los servicios del sistema incluyendo base de datos
 *     responses:
 *       200:
 *         description: Todos los servicios funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     api:
 *                       type: string
 *                       example: "running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               status: "OK"
 *               services:
 *                 database: "connected"
 *                 api: "running"
 *               timestamp: "2025-07-16T15:30:00.000Z"
 *       503:
 *         description: Uno o más servicios no están disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ERROR"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "disconnected"
 *                     api:
 *                       type: string
 *                       example: "running"
 *                 error:
 *                   type: string
 *                   example: "Connection to database failed"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               status: "ERROR"
 *               services:
 *                 database: "disconnected"
 *                 api: "running"
 *               error: "Connection to database failed"
 *               timestamp: "2025-07-16T15:30:00.000Z"
 */
router.get('/status', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'OK',
      services: {
        database: 'connected',
        api: 'running'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      services: {
        database: 'disconnected',
        api: 'running'
      },
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: Información del API
 *     description: Endpoint raíz que proporciona información básica del API y enlaces útiles
 *     responses:
 *       200:
 *         description: Información del API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to Parroquia API"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 *                 health:
 *                   type: string
 *                   example: "/api/health"
 *                 status:
 *                   type: string
 *                   example: "/api/status"
 *             example:
 *               message: "Welcome to Parroquia API"
 *               documentation: "/api-docs"
 *               health: "/api/health"
 *               status: "/api/status"
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Parroquia API',
    documentation: '/api-docs',
    health: '/api/health',
    status: '/api/status'
  });
});

export default router;
