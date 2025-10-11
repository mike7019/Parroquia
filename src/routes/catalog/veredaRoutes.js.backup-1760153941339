import express from 'express';
import veredaController from '../../controllers/catalog/veredaController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/veredas:
 *   post:
 *     summary: Create a new vereda
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VeredaInput'
 *     responses:
 *       201:
 *         description: Vereda created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', veredaController.createVereda);

/**
 * @swagger
 * /api/catalog/veredas:
 *   get:
 *     summary: Get all veredas
 *     description: Obtiene una lista completa de veredas
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Veredas retrieved successfully
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
 *                     $ref: '#/components/schemas/Vereda'
 *                 total:
 *                   type: integer
 *                   example: 125
 *                 message:
 *                   type: string
 *                   example: Se encontraron 125 veredas
 *       500:
 *         description: Server error
 */
router.get('/', veredaController.getAllVeredas);

/**
 * @swagger
 * /api/catalog/veredas/search:
 *   get:
 *     summary: Search veredas
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *       - in: query
 *         name: municipioId
 *         schema:
 *           type: integer
 *         description: Filter by municipio
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term too short
 *       500:
 *         description: Server error
 */
router.get('/search', veredaController.searchVeredas);

/**
 * @swagger
 * /api/catalog/veredas/statistics:
 *   get:
 *     summary: Get vereda statistics
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: veredaId
 *         schema:
 *           type: integer
 *         description: Get statistics for specific vereda
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', veredaController.getVeredaStatistics);

/**
 * @swagger
 * /api/catalog/veredas/municipio/{municipioId}:
 *   get:
 *     summary: Get veredas by municipio
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: municipioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Municipio ID
 *     responses:
 *       200:
 *         description: Veredas by municipio retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/municipio/:municipioId', veredaController.getVeredasByMunicipio);

/**
 * @swagger
 * /api/catalog/veredas/{id}:
 *   get:
 *     summary: Get vereda by ID
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vereda ID
 *     responses:
 *       200:
 *         description: Vereda retrieved successfully
 *       404:
 *         description: Vereda not found
 *       500:
 *         description: Server error
 */
router.get('/:id', veredaController.getVeredaById);

/**
 * @swagger
 * /api/catalog/veredas/{id}/details:
 *   get:
 *     summary: Get vereda with full details including counts
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vereda ID
 *     responses:
 *       200:
 *         description: Vereda details retrieved successfully
 *       404:
 *         description: Vereda not found
 *       500:
 *         description: Server error
 */
router.get('/:id/details', veredaController.getVeredaDetails);

/**
 * @swagger
 * /api/catalog/veredas/{id}:
 *   put:
 *     summary: Update vereda
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vereda ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VeredaInput'
 *     responses:
 *       200:
 *         description: Vereda updated successfully
 *       404:
 *         description: Vereda not found
 *       500:
 *         description: Server error
 */
router.put('/:id', veredaController.updateVereda);

/**
 * @swagger
 * /api/catalog/veredas/{id}:
 *   delete:
 *     summary: Delete vereda
 *     tags: [Veredas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vereda ID
 *     responses:
 *       200:
 *         description: Vereda deleted successfully
 *       404:
 *         description: Vereda not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', veredaController.deleteVereda);

export default router;
