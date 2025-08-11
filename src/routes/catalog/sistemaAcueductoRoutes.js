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
import {
  validateCreateSistema,
  validateUpdateSistema,
  validateSistemaId,
  validateSearchQuery,
  validateGetAllQuery,
  validateNombreParam,
  validateBulkCreate
} from '../../validators/sistemaAcueductoValidators.js';
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
 *                   example: "Sistema de acueducto creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SistemaAcueducto'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Sistema already exists
 *       500:
 *         description: Server error
 */
router.post('/', validateCreateSistema, createSistemaAcueducto);

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
 *                 maxItems: 100
 *                 example:
 *                   - nombre: "Acueducto Rural"
 *                     descripcion: "Sistema rural de agua potable"
 *                   - nombre: "Pozo Comunitario"
 *                     descripcion: "Agua de pozo para la comunidad"
 *     responses:
 *       201:
 *         description: Sistemas created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate sistemas
 *       500:
 *         description: Server error
 */
router.post('/bulk', validateBulkCreate, bulkCreateSistemasAcueducto);

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
 *           minLength: 1
 *           maxLength: 100
 *         description: Search term
 *         example: "acueducto"
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
 *                   example: "Búsqueda completada exitosamente"
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
 *                       example: "acueducto"
 *       400:
 *         description: Missing query parameter
 *       500:
 *         description: Server error
 */
router.get('/search', validateSearchQuery, searchSistemasAcueducto);

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
 *                   example: "Nombres únicos obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Acueducto Público", "Pozo Profundo", "Aljibe"]
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
 *           minLength: 1
 *           maxLength: 255
 *         description: Sistema name
 *         example: "Acueducto Público"
 *     responses:
 *       200:
 *         description: Sistemas retrieved successfully
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
 *                   example: "Sistemas obtenidos por nombre exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SistemaAcueducto'
 *       400:
 *         description: Missing nombre parameter
 *       500:
 *         description: Server error
 */
router.get('/nombre/:nombre', validateNombreParam, getSistemasByName);

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
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     totalWithDescription:
 *                       type: integer
 *                       example: 8
 *                     uniqueNombres:
 *                       type: integer
 *                       example: 10
 *                     withoutDescription:
 *                       type: integer
 *                       example: 2
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
 *           maxLength: 100
 *         description: Search term for filtering
 *         example: "acueducto"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id_sistema_acueducto, nombre, descripcion, created_at, updated_at]
 *           default: id_sistema_acueducto
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
 *                   example: "Sistemas de acueducto obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sistemas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SistemaAcueducto'
 *                     total:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Server error
 */
router.get('/', validateGetAllQuery, getAllSistemasAcueducto);

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
 *           minimum: 1
 *         description: Sistema ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Sistema retrieved successfully
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
 *                   example: "Sistema de acueducto obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SistemaAcueducto'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Sistema not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateSistemaId, getSistemaAcueductoById);

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
 *           minimum: 1
 *         description: Sistema ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Nombre del sistema de acueducto
 *                 example: "Acueducto Municipal Actualizado"
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción del sistema de acueducto
 *                 example: "Sistema de agua potable municipal actualizado"
 *     responses:
 *       200:
 *         description: Sistema updated successfully
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
 *                   example: "Sistema de acueducto actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/SistemaAcueducto'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sistema not found
 *       409:
 *         description: Duplicate name
 *       500:
 *         description: Server error
 */
router.put('/:id', validateUpdateSistema, updateSistemaAcueducto);

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
 *           minimum: 1
 *         description: Sistema ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Sistema deleted successfully
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
 *                   example: "Sistema de acueducto eliminado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Sistema de acueducto deleted successfully"
 *                     id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Sistema not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', validateSistemaId, deleteSistemaAcueducto);

export default router;
