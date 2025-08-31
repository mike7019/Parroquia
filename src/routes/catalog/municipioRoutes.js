import express from 'express';
import municipioController from '../../controllers/catalog/municipioController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/municipios:
 *   get:
 *     summary: Get all municipios
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by municipio name
 *       - in: query
 *         name: id_departamento
 *         schema:
 *           type: integer
 *         description: Filter by departamento ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: nombre_municipio
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Municipios retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Se encontraron 1123 municipios
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Municipio'
 *                 total:
 *                   type: integer
 *                   example: 1123
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', municipioController.getAllMunicipios);

/**
 * @swagger
 * /api/catalog/municipios/search:
 *   get:
 *     summary: Search municipios by name
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for municipio name
 *         example: mede
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Búsqueda de municipios completada exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Municipio'
 *                 total:
 *                   type: integer
 *                   example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', municipioController.searchMunicipios);

/**
 * @swagger
 * /api/catalog/municipios/statistics:
 *   get:
 *     summary: Get municipios statistics
 *     tags: [Municipios]
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Estadísticas obtenidas exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMunicipios:
 *                       type: integer
 *                       example: 1123
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/statistics', municipioController.getStatistics);

/**
 * @swagger
 * /api/catalog/municipios/{id}:
 *   get:
 *     summary: Get municipio by ID
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Municipio ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Municipio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Municipio obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Municipio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Municipio not found
 *       500:
 *         description: Server error
 */
router.get('/:id', municipioController.getMunicipioById);

/**
 * @swagger
 * /api/catalog/municipios/codigo-dane/{codigo_dane}:
 *   get:
 *     summary: Get municipio by codigo DANE
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo_dane
 *         required: true
 *         schema:
 *           type: string
 *         description: Codigo DANE (5 digits)
 *         example: "05001"
 *     responses:
 *       200:
 *         description: Municipio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Municipio obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Municipio'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Municipio not found
 *       500:
 *         description: Server error
 */
router.get('/codigo-dane/:codigo_dane', municipioController.getMunicipioByCodigoDane);

/**
 * @swagger
 * /api/catalog/municipios/departamento/{id_departamento}:
 *   get:
 *     summary: Get municipios by departamento
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_departamento
 *         required: true
 *         schema:
 *           type: integer
 *         description: Departamento ID
 *         example: 5
 *     responses:
 *       200:
 *         description: Municipios by departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Municipios por departamento obtenidos exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Municipio'
 *                 total:
 *                   type: integer
 *                   example: 125
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/departamento/:id_departamento', municipioController.getMunicipiosByDepartamento);

export default router;
