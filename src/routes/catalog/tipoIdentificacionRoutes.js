import express from 'express';
import tipoIdentificacionController from '../../controllers/catalog/tipoIdentificacionController.js';

const router = express.Router();

/**
 * @swagger
 * /api/catalog/tipos-identificacion:
 *   get:
 *     summary: Obtener todos los tipos de identificación
 *     description: Obtiene una lista de todos los tipos de identificación disponibles
 *     tags: [Tipos de Identificación]
 *     responses:
 *       200:
 *         description: Lista de tipos de identificación obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       codigo:
 *                         type: string
 *                         example: "CC"
 *                       descripcion:
 *                         type: string
 *                         example: "Cédula de Ciudadanía"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get('/', tipoIdentificacionController.getAllTiposIdentificacion);

export default router;
