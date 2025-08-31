import express from 'express';
import departamentoController from '../../controllers/catalog/departamentoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// Authentication can be enabled/disabled as needed
// router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/departamentos:
 *   get:
 *     summary: Get all departamentos
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departamentos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Departamento'
 *                 total:
 *                   type: integer
 *                   example: 33
 *                 message:
 *                   type: string
 *                   example: Se encontraron 33 departamentos
 *       500:
 *         description: Server error
 */
router.get('/', departamentoController.getAllDepartamentos);

/**
 * @swagger
 * /api/catalog/departamentos/search:
 *   get:
 *     summary: Search departamentos by name
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for departamento name
 *         example: "anti"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Departamento'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', departamentoController.searchDepartamentos);

/**
 * @swagger
 * /api/catalog/departamentos/statistics:
 *   get:
 *     summary: Get departamentos statistics
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Estadísticas obtenidas exitosamente
 *                 datos:
 *                   type: object
 *                   properties:
 *                     totalDepartamentos:
 *                       type: integer
 *                       example: 33
 *       500:
 *         description: Server error
 */
router.get('/statistics', departamentoController.getStatistics);

/**
 * @swagger
 * /api/catalog/departamentos/{id}:
 *   get:
 *     summary: Get departamento by ID
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departamento ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       500:
 *         description: Server error
 */
router.get('/:id', departamentoController.getDepartamentoById);

/**
 * @swagger
 * /api/catalog/departamentos/codigo-dane/{codigo_dane}:
 *   get:
 *     summary: Get departamento by codigo DANE
 *     tags: [Departamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo_dane
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo DANE (2 digits)
 *         example: "05"
 *     responses:
 *       200:
 *         description: Departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Departamento not found
 *       500:
 *         description: Server error
 */
router.get('/codigo-dane/:codigo_dane', departamentoController.getDepartamentoByCodigoDane);

export default router;
