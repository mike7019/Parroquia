import express from 'express';
import {
  getAllSistemasAcueducto,
  getSistemaAcueductoById,
  createSistemaAcueducto,
  updateSistemaAcueducto,
  deleteSistemaAcueducto,
  searchSistemasAcueducto,
  getSistemasByName,
  getUniqueNombres,
  getStatistics,
  bulkCreateSistemasAcueducto
} from '../../controllers/catalog/sistemaAcueductoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     SistemaAcueducto:
 *       type: object
 *       properties:
 *         id_sistema_acueducto:
 *           type: integer
 *           description: ID único del sistema de acueducto
 *           example: 1
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre del sistema de acueducto
 *           example: "Acueducto Público"
 *         descripcion:
 *           type: string
 *           description: Descripción del sistema de acueducto
 *           example: "Sistema de agua potable municipal con cobertura completa"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     SistemaAcueductoInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre del sistema de acueducto
 *           example: "Acueducto Público"
 *         descripcion:
 *           type: string
 *           description: Descripción del sistema de acueducto
 *           example: "Sistema de agua potable municipal con cobertura completa"
 */

/**
 * @swagger
 * /api/catalog/sistemas-acueducto:
 *   post:
 *     summary: Create a new sistema de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SistemaAcueductoInput'
 *     responses:
 *       201:
 *         description: Sistema de acueducto created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Sistema already exists
 *       500:
 *         description: Server error
 */
router.post('/', createSistemaAcueducto);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/bulk:
 *   post:
 *     summary: Bulk create sistemas de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sistemas:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SistemaAcueductoInput'
 *     responses:
 *       201:
 *         description: Sistemas created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk', bulkCreateSistemasAcueducto);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/search:
 *   get:
 *     summary: Search sistemas de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Search results
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
 *                   example: "Search completed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sistemas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SistemaAcueducto'
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     searchTerm:
 *                       type: string
 *                       example: "agua"
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/search', searchSistemasAcueducto);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/nombres:
 *   get:
 *     summary: Get unique nombres
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique nombres
 *       500:
 *         description: Server error
 */
router.get('/nombres', getUniqueNombres);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/nombre/{nombre}:
 *   get:
 *     summary: Get sistemas by nombre
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Sistema name
 *     responses:
 *       200:
 *         description: Sistemas retrieved successfully
 *       400:
 *         description: Missing nombre parameter
 *       500:
 *         description: Server error
 */
router.get('/nombre/:nombre', getSistemasByName);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/statistics:
 *   get:
 *     summary: Get sistema de acueducto statistics
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', getStatistics);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto:
 *   get:
 *     summary: Get all sistemas de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id_sistema_acueducto, nombre, created_at, updated_at]
 *           default: nombre
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
 *         description: List of sistemas retrieved successfully
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
 *                   example: "Sistemas de acueducto retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SistemaAcueducto'
 *       500:
 *         description: Server error
 */
router.get('/', getAllSistemasAcueducto);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/{id}:
 *   get:
 *     summary: Get sistema de acueducto by ID
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sistema ID
 *     responses:
 *       200:
 *         description: Sistema retrieved successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Sistema not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSistemaAcueductoById);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/{id}:
 *   put:
 *     summary: Update sistema de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sistema ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 maxLength: 255
 *                 description: Nombre del sistema de acueducto
 *               descripcion:
 *                 type: string
 *                 description: Descripción del sistema de acueducto
 *     responses:
 *       200:
 *         description: Sistema updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sistema not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateSistemaAcueducto);

/**
 * @swagger
 * /api/catalog/sistemas-acueducto/{id}:
 *   delete:
 *     summary: Delete sistema de acueducto
 *     tags: [Sistemas de Acueducto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sistema ID
 *     responses:
 *       200:
 *         description: Sistema deleted successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Sistema not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteSistemaAcueducto);

export default router;
