import express from 'express';
import tipoIdentificacionController from '../../controllers/catalog/tipoIdentificacionController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/catalog/tipos-identificacion:
 *   get:
 *     summary: Obtener todos los tipos de identificación
 *     description: Obtiene una lista de todos los tipos de identificación disponibles
 *     tags: [Tipos de Identificación]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, descripción o código
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: nombre
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de tipos de identificación obtenida correctamente
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
 *                         $ref: '#/components/schemas/TipoIdentificacion'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', tipoIdentificacionController.getAllTiposIdentificacion);

/**
 * @swagger
 * /api/catalog/tipos-identificacion:
 *   post:
 *     summary: Crear nuevo tipo de identificación
 *     description: Crea un nuevo tipo de identificación en el sistema
 *     tags: [Tipos de Identificación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTipoIdentificacionRequest'
 *     responses:
 *       201:
 *         description: Tipo de identificación creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoIdentificacion'
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: Ya existe un tipo con ese código
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware.authenticateToken, authMiddleware.requireRole(['admin']), tipoIdentificacionController.createTipoIdentificacion);

/**
 * @swagger
 * /api/catalog/tipos-identificacion/{id}:
 *   get:
 *     summary: Obtener tipo de identificación por ID
 *     tags: [Tipos de Identificación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de identificación
 *     responses:
 *       200:
 *         description: Tipo de identificación encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoIdentificacion'
 *       404:
 *         description: Tipo de identificación no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', tipoIdentificacionController.getTipoIdentificacionById);

/**
 * @swagger
 * /api/catalog/tipos-identificacion/{id}:
 *   put:
 *     summary: Actualizar tipo de identificación
 *     description: Actualiza un tipo de identificación existente
 *     tags: [Tipos de Identificación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de identificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTipoIdentificacionRequest'
 *     responses:
 *       200:
 *         description: Tipo de identificación actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoIdentificacion'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Tipo de identificación no encontrado
 *       409:
 *         description: Ya existe un tipo con ese código
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole(['admin']), tipoIdentificacionController.updateTipoIdentificacion);

/**
 * @swagger
 * /api/catalog/tipos-identificacion/{id}:
 *   delete:
 *     summary: Eliminar tipo de identificación
 *     description: Elimina un tipo de identificación del sistema
 *     tags: [Tipos de Identificación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de identificación
 *     responses:
 *       200:
 *         description: Tipo de identificación eliminado exitosamente
 *       404:
 *         description: Tipo de identificación no encontrado
 *       409:
 *         description: No se puede eliminar - tiene registros asociados
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole(['admin']), tipoIdentificacionController.deleteTipoIdentificacion);

/**
 * @swagger
 * /api/catalog/tipos-identificacion/codigo/{codigo}:
 *   get:
 *     summary: Obtener tipo de identificación por código
 *     tags: [Tipos de Identificación]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del tipo de identificación
 *     responses:
 *       200:
 *         description: Tipo de identificación encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TipoIdentificacion'
 *       404:
 *         description: Tipo de identificación no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/codigo/:codigo', tipoIdentificacionController.getTipoIdentificacionByCode);

export default router;
