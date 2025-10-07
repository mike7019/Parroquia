/**
 * RUTAS DE CATÁLOGO: Destrezas y Habilidades
 * 
 * Endpoints para obtener los catálogos de destrezas y habilidades
 */

import express from 'express';
import sequelize from '../../config/sequelize.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/destrezas:
 *   get:
 *     summary: Obtener catálogo de destrezas
 *     description: Retorna la lista completa de destrezas disponibles
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de destrezas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_destreza:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       activo:
 *                         type: boolean
 */
router.get('/destrezas', authMiddleware.authenticateToken, async (req, res) => {
  try {
    const [destrezas] = await sequelize.query(`
      SELECT 
        id_destreza,
        nombre,
        descripcion,
        activo
      FROM destrezas
      WHERE activo = true
      ORDER BY nombre ASC
    `);
    
    res.json({
      exito: true,
      mensaje: 'Catálogo de destrezas obtenido exitosamente',
      datos: destrezas,
      total: destrezas.length
    });
    
  } catch (error) {
    console.error('Error obteniendo destrezas:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el catálogo de destrezas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/habilidades:
 *   get:
 *     summary: Obtener catálogo de habilidades
 *     description: Retorna la lista completa de habilidades disponibles organizadas por categoría
 *     tags: [Catálogos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de habilidades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_habilidad:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       categoria:
 *                         type: string
 *                       activo:
 *                         type: boolean
 */
router.get('/habilidades', authMiddleware.authenticateToken, async (req, res) => {
  try {
    const [habilidades] = await sequelize.query(`
      SELECT 
        id_habilidad,
        nombre,
        descripcion,
        categoria,
        activo
      FROM habilidades
      WHERE activo = true
      ORDER BY categoria ASC, nombre ASC
    `);
    
    res.json({
      exito: true,
      mensaje: 'Catálogo de habilidades obtenido exitosamente',
      datos: habilidades,
      total: habilidades.length
    });
    
  } catch (error) {
    console.error('Error obteniendo habilidades:', error);
    res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener el catálogo de habilidades',
      error: error.message
    });
  }
});

export default router;
