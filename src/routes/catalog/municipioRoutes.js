import express from 'express';
import municipioController from '../../controllers/catalog/municipioController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
// router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/municipios:
 *   post:
 *     summary: Create a new municipio
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MunicipioInput'
 *           examples:
 *             valid_request:
 *               summary: Valid municipio creation request
 *               value:
 *                 nombre_municipio: "Medellín"
 *                 codigo_dane: "05001"
 *                 id_departamento: 1
 *             invalid_departamento:
 *               summary: Invalid departamento ID (will fail)
 *               value:
 *                 nombre_municipio: "Test Municipio"
 *                 codigo_dane: "05999"
 *                 id_departamento: 999
 *     responses:
 *       201:
 *         description: Municipio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Municipio creado exitosamente"
 *               data: null
 *               timestamp: "2025-08-08T02:08:28.701Z"
 *       400:
 *         description: Validation error - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "nombre_municipio, codigo_dane, and id_departamento are required"
 *                 code: "VALIDATION_ERROR"
 *                 timestamp: "2025-08-08T02:08:28.701Z"
 *       409:
 *         description: Conflict - Municipio already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Municipio ya existe con ese nombre o código DANE"
 *                 code: "DUPLICATE_ERROR"
 *                 timestamp: "2025-08-08T02:08:28.701Z"
 *       500:
 *         description: Server error - Including invalid departamento ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_departamento:
 *                 summary: Invalid departamento ID error
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Error creating municipio"
 *                     code: "CREATE_ERROR"
 *                     timestamp: "2025-08-08T02:08:28.701Z"
 *                     details: "Error finding or creating municipio: Departamento with ID 999 does not exist"
 *               general_error:
 *                 summary: General server error
 *                 value:
 *                   success: false
 *                   error:
 *                     message: "Error creating municipio"
 *                     code: "CREATE_ERROR"
 *                     timestamp: "2025-08-08T02:08:28.701Z"
 *                     details: "Internal server error"
 */
router.post('/', municipioController.createMunicipio);

/**
 * @swagger
 * /api/catalog/municipios/bulk:
 *   post:
 *     summary: Bulk create municipios
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - municipios
 *             properties:
 *               municipios:
 *                 type: array
 *                 items:
 *                   oneOf:
 *                     - type: string
 *                     - $ref: '#/components/schemas/MunicipioInput'
 *     responses:
 *       201:
 *         description: Municipios created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk', municipioController.bulkCreateMunicipios);

/**
 * @swagger
 * /api/catalog/municipios:
 *   get:
 *     summary: Get all municipios with pagination
 *     tags: [Municipios]
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
 *         description: Search term for municipio name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id_municipio
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
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         municipios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Municipio'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Server error
 */
router.get('/', municipioController.getAllMunicipios);

/**
 * @swagger
 * /api/catalog/municipios/departamentos:
 *   get:
 *     summary: Get all available departamentos
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departamentos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Departamento'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/departamentos', municipioController.getAllDepartamentos);

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
 *     responses:
 *       200:
 *         description: Municipio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Municipio'
 *       404:
 *         description: Municipio not found
 *       500:
 *         description: Server error
 */
router.get('/:id', municipioController.getMunicipioById);

/**
 * @swagger
 * /api/catalog/municipios/{id}:
 *   put:
 *     summary: Update municipio
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MunicipioInput'
 *     responses:
 *       200:
 *         description: Municipio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Municipio'
 *       404:
 *         description: Municipio not found
 *       500:
 *         description: Server error
 */
router.put('/:id', municipioController.updateMunicipio);

/**
 * @swagger
 * /api/catalog/municipios/{id}:
 *   delete:
 *     summary: Delete municipio
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
 *     responses:
 *       200:
 *         description: Municipio deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Municipio not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', municipioController.deleteMunicipio);

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
 *     responses:
 *       200:
 *         description: Municipio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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
 *     responses:
 *       200:
 *         description: Municipios by departamento retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */
router.get('/departamento/:id_departamento', municipioController.getMunicipiosByDepartamento);

/**
 * @swagger
 * /api/catalog/municipios/search/codigo-dane/{pattern}:
 *   get:
 *     summary: Search municipios by codigo DANE pattern
 *     tags: [Municipios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Search pattern for codigo DANE
 *     responses:
 *       200:
 *         description: Municipios search completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Server error
 */
router.get('/search/codigo-dane/:pattern', municipioController.searchMunicipiosByCodigoDane);

export default router;
