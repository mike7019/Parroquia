import express from 'express';
import sexoController from '../../controllers/catalog/sexoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/sexos:
 *   post:
 *     summary: Create a new sexo
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SexoInput'
 *     responses:
 *       201:
 *         description: Sexo created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', sexoController.createSexo);

/**
 * @swagger
 * /api/catalog/sexos:
 *   get:
 *     summary: Get all sexos with pagination
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id_sexo
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
 *         description: Sexos retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', sexoController.getAllSexos);

export default router;
