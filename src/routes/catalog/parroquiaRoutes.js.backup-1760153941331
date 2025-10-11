import express from 'express';
import parroquiaController from '../../controllers/catalog/parroquiaController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/parroquias:
 *   post:
 *     summary: Create a new parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParroquiaInput'
 *           examples:
 *             basic_parroquia:
 *               summary: Parroquia básica (solo requeridos)
 *               value:
 *                 nombre: "Parroquia San José"
 *                 id_municipio: 1
 *             complete_parroquia:
 *               summary: Parroquia completa
 *               value:
 *                 nombre: "Parroquia San José"
 *                 id_municipio: 1
 *                 descripcion: "Parroquia ubicada en el centro del municipio"
 *                 direccion: "Carrera 50 # 45-32"
 *                 telefono: "+57 4 123-4567"
 *                 email: "contacto@parroquiasanjose.com"
 *                 activo: true
 *     responses:
 *       201:
 *         description: Parroquia created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParroquiaResponse'
 *       400:
 *         description: Validation error - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Municipio not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', parroquiaController.createParroquia);

/**
 * @swagger
 * /api/catalog/parroquias:
 *   get:
 *     summary: Get all parroquias
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parroquias retrieved successfully (includes municipio data)
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
 *                     $ref: '#/components/schemas/Parroquia'
 *                 total:
 *                   type: integer
 *                   example: 48
 *                 message:
 *                   type: string
 *                   example: Se encontraron 48 parroquias
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', parroquiaController.getAllParroquias);

/**
 * @swagger
 * /api/catalog/parroquias/search:
 *   get:
 *     summary: Search parroquias
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term too short
 *       500:
 *         description: Server error
 */
router.get('/search', parroquiaController.searchParroquias);

/**
 * @swagger
 * /api/catalog/parroquias/statistics:
 *   get:
 *     summary: Get parroquia statistics
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', parroquiaController.getParroquiaStatistics);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   get:
 *     summary: Get parroquia by ID
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
 *     responses:
 *       200:
 *         description: Parroquia retrieved successfully
 *       404:
 *         description: Parroquia not found
 *       500:
 *         description: Server error
 */
router.get('/:id', parroquiaController.getParroquiaById);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   put:
 *     summary: Update parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
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
 *                 description: 'Nombre de la parroquia'
 *               id_municipio:
 *                 type: integer
 *                 description: 'ID del municipio al que pertenece la parroquia'
 *               descripcion:
 *                 type: string
 *                 description: 'Descripción opcional de la parroquia'
 *               direccion:
 *                 type: string
 *                 maxLength: 500
 *                 description: 'Dirección física de la parroquia'
 *               telefono:
 *                 type: string
 *                 maxLength: 20
 *                 description: 'Número de teléfono de contacto'
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 description: 'Correo electrónico de contacto'
 *               activo:
 *                 type: boolean
 *                 description: 'Estado activo/inactivo de la parroquia'
 *           examples:
 *             partial_update:
 *               summary: Actualización parcial
 *               value:
 *                 nombre: "Parroquia San José Actualizada"
 *                 descripcion: "Descripción actualizada"
 *             change_municipio:
 *               summary: Cambio de municipio
 *               value:
 *                 id_municipio: 2
 *                 direccion: "Nueva dirección en el municipio 2"
 *     responses:
 *       200:
 *         description: Parroquia updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParroquiaResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Parroquia or Municipio not found
 *       500:
 *         description: Server error
 */
router.put('/:id', parroquiaController.updateParroquia);

/**
 * @swagger
 * /api/catalog/parroquias/{id}:
 *   delete:
 *     summary: Delete parroquia
 *     tags: [Parroquias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parroquia ID
 *     responses:
 *       200:
 *         description: Parroquia deleted successfully
 *       404:
 *         description: Parroquia not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', parroquiaController.deleteParroquia);

/**
 * @swagger
 * /api/catalog/parroquias/municipio/{municipioId}:
 *   get:
 *     summary: Get parroquias by municipio
 *     tags: [Parroquias]
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
 *         description: Parroquias by municipio retrieved successfully
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
 *                         $ref: '#/components/schemas/Parroquia'
 *       400:
 *         description: Municipio ID is required
 *       500:
 *         description: Server error
 */
router.get('/municipio/:municipioId', parroquiaController.getParroquiasByMunicipio);

export default router;
