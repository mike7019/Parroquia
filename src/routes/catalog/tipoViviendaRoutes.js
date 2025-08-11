import express from 'express';
import tipoViviendaController from '../../controllers/catalog/tipoViviendaController.js';
import authMiddleware from '../../middlewares/auth.js';
import validationMiddleware from '../../middlewares/validation.js';
import tipoViviendaValidators from '../../validators/tipoViviendaValidators.js';

const router = express.Router();

// ========================
// RUTAS PARA TIPOS DE VIVIENDA
// ========================

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoVivienda:
 *       type: object
 *       properties:
 *         id_tipo_vivienda:
 *           type: integer
 *           description: ID único del tipo de vivienda
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de vivienda
 *           example: "Casa"
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de vivienda
 *           example: "Vivienda unifamiliar independiente"
 *         activo:
 *           type: boolean
 *           description: Estado activo/inactivo del tipo de vivienda
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           example: "2025-08-10T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2025-08-10T10:30:00.000Z"
 *     
 *     TipoViviendaInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del tipo de vivienda
 *           example: "Apartamento"
 *         descripcion:
 *           type: string
 *           maxLength: 255
 *           description: Descripción opcional del tipo de vivienda
 *           example: "Vivienda en edificio multifamiliar"
 *         activo:
 *           type: boolean
 *           description: Estado activo/inactivo del tipo de vivienda
 *           example: true
 *           default: true
 *     
 *     TipoViviendaUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del tipo de vivienda
 *           example: "Casa Campestre"
 *         descripcion:
 *           type: string
 *           maxLength: 255
 *           description: Descripción del tipo de vivienda
 *           example: "Vivienda rural con amplios espacios verdes"
 *         activo:
 *           type: boolean
 *           description: Estado activo/inactivo del tipo de vivienda
 *           example: true
 *     
 *     EstadisticasTipoVivienda:
 *       type: object
 *       properties:
 *         totalTipos:
 *           type: integer
 *           description: Total de tipos de vivienda registrados
 *           example: 10
 *         tiposActivos:
 *           type: integer
 *           description: Número de tipos de vivienda activos
 *           example: 8
 *         tiposInactivos:
 *           type: integer
 *           description: Número de tipos de vivienda inactivos
 *           example: 2
 */

/**
 * @swagger
 * /api/catalog/tipos-vivienda:
 *   get:
 *     tags: [Tipos de Vivienda]
 *     summary: Obtener todos los tipos de vivienda
 *     description: Lista de todos los tipos de vivienda con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 255
 *         description: Término de búsqueda (nombre o descripción)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id_tipo_vivienda, nombre, descripcion, activo, created_at, updated_at]
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
 *         description: Lista de tipos de vivienda obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipos de vivienda obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoVivienda'
 *                     total:
 *                       type: integer
 *                       description: Total de tipos de vivienda
 *                       example: 15
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateQuery,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.getAllTipos
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/activos:
 *   get:
 *     tags: [Tipos de Vivienda]
 *     summary: Obtener tipos de vivienda activos
 *     description: Lista de todos los tipos de vivienda marcados como activos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de vivienda activos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipos de vivienda activos obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoVivienda'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/activos',
  authMiddleware.authenticateToken,
  tipoViviendaController.getTiposActivos
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/estadisticas:
 *   get:
 *     tags: [Tipos de Vivienda]
 *     summary: Obtener estadísticas de tipos de vivienda
 *     description: Obtiene estadísticas generales sobre los tipos de vivienda registrados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     estadisticas:
 *                       $ref: '#/components/schemas/EstadisticasTipoVivienda'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/estadisticas',
  authMiddleware.authenticateToken,
  tipoViviendaController.getEstadisticas
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/{id}:
 *   get:
 *     tags: [Tipos de Vivienda]
 *     summary: Obtener un tipo de vivienda por ID
 *     description: Obtiene los detalles de un tipo específico de vivienda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de vivienda
 *     responses:
 *       200:
 *         description: Tipo de vivienda encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipo de vivienda obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoVivienda'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de vivienda no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Tipo de vivienda no encontrado"
 *               code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateId,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.getTipoById
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda:
 *   post:
 *     tags: [Tipos de Vivienda]
 *     summary: Crear un nuevo tipo de vivienda
 *     description: Crea un nuevo tipo de vivienda en el catálogo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoViviendaInput'
 *           example:
 *             nombre: "Apartamento"
 *             descripcion: "Vivienda en edificio multifamiliar"
 *             activo: true
 *     responses:
 *       201:
 *         description: Tipo de vivienda creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipo de vivienda creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoVivienda'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Ya existe un tipo con el mismo nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Ya existe un tipo de vivienda con ese nombre"
 *               code: "DUPLICATE_NAME"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateCreateTipo,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.createTipo
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/{id}:
 *   put:
 *     tags: [Tipos de Vivienda]
 *     summary: Actualizar un tipo de vivienda
 *     description: Actualiza los datos de un tipo existente de vivienda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de vivienda
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoViviendaUpdate'
 *           example:
 *             nombre: "Casa Campestre"
 *             descripcion: "Vivienda rural con amplios espacios verdes"
 *             activo: true
 *     responses:
 *       200:
 *         description: Tipo de vivienda actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipo de vivienda actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoVivienda'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de vivienda no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un tipo con el mismo nombre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateUpdateTipo,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.updateTipo
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/{id}:
 *   delete:
 *     tags: [Tipos de Vivienda]
 *     summary: Eliminar un tipo de vivienda
 *     description: Elimina un tipo de vivienda del catálogo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de vivienda
 *     responses:
 *       200:
 *         description: Tipo de vivienda eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipo de vivienda eliminado exitosamente"
 *                 data:
 *                   type: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de vivienda no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateId,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.deleteTipo
);

/**
 * @swagger
 * /api/catalog/tipos-vivienda/{id}/toggle-estado:
 *   patch:
 *     tags: [Tipos de Vivienda]
 *     summary: Cambiar estado activo/inactivo de un tipo de vivienda
 *     description: Alterna entre estado activo e inactivo para un tipo de vivienda
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de vivienda
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Tipo de vivienda activado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoVivienda'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de vivienda no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/toggle-estado',
  authMiddleware.authenticateToken,
  tipoViviendaValidators.validateId,
  validationMiddleware.handleValidationErrors,
  tipoViviendaController.toggleEstado
);

export default router;
