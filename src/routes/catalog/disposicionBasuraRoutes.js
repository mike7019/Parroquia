import express from 'express';
import disposicionBasuraController from '../../controllers/catalog/disposicionBasuraController.js';
import authMiddleware from '../../middlewares/auth.js';
import validationMiddleware from '../../middlewares/validation.js';
import disposicionBasuraValidators from '../../validators/disposicionBasuraValidators.js';

const router = express.Router();

// ========================
// RUTAS PARA TIPOS DE DISPOSICIÓN DE BASURA
// ========================

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoDisposicionBasura:
 *       type: object
 *       properties:
 *         id_tipo_disposicion_basura:
 *           type: integer
 *           description: ID único del tipo de disposición de basura
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de disposición
 *           example: "Recolección Pública"
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de disposición
 *           example: "Servicio de recolección municipal"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           example: "2025-08-09T03:07:36.579Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2025-08-09T03:07:36.579Z"
 *     
 *     TipoDisposicionBasuraInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del tipo de disposición
 *           example: "Compostaje"
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           description: Descripción opcional del tipo de disposición
 *           example: "Proceso de compostaje de residuos orgánicos"
 *     
 *     TipoDisposicionBasuraUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del tipo de disposición
 *           example: "Reciclaje Avanzado"
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           description: Descripción del tipo de disposición
 *           example: "Separación y reciclaje especializado de materiales"
 *     
 *     FamiliaDisposicionBasura:
 *       type: object
 *       properties:
 *         id_familia_disposicion_basura:
 *           type: integer
 *           description: ID único de la asignación
 *           example: 1
 *         id_familia:
 *           type: integer
 *           description: ID de la familia
 *           example: 1
 *         id_tipo_disposicion_basura:
 *           type: integer
 *           description: ID del tipo de disposición de basura
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     AsignacionInput:
 *       type: object
 *       required:
 *         - id_familia
 *         - id_tipo_disposicion_basura
 *       properties:
 *         id_familia:
 *           type: integer
 *           minimum: 1
 *           description: ID de la familia
 *           example: 1
 *         id_tipo_disposicion_basura:
 *           type: integer
 *           minimum: 1
 *           description: ID del tipo de disposición de basura
 *           example: 1
 *     
 *     EstadisticaDisposicion:
 *       type: object
 *       properties:
 *         id_tipo_disposicion_basura:
 *           type: integer
 *           description: ID del tipo de disposición
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de disposición
 *           example: "Recolección Pública"
 *         descripcion:
 *           type: string
 *           description: Descripción del tipo de disposición
 *           example: "Servicio de recolección municipal"
 *         familias_usando:
 *           type: integer
 *           description: Número de familias que usan este tipo de disposición
 *           example: 15
 */

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos:
 *   get:
 *     tags: [Disposición de Basura]
 *     summary: Obtener todos los tipos de disposición de basura
 *     description: Lista paginada de todos los tipos de disposición de basura con filtros opcionales
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Elementos por página
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
 *           enum: [id_tipo_disposicion_basura, nombre, descripcion, created_at, updated_at]
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
 *         description: Lista de tipos de disposición obtenida exitosamente
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
 *                   example: "Tipos de disposición de basura obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoDisposicionBasura'
 *                     total:
 *                       type: integer
 *                       description: Total number of items
 *                       example: 15
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tipos',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateQuery,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.getAllTipos
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos/{id}:
 *   get:
 *     tags: [Disposición de Basura]
 *     summary: Obtener un tipo de disposición por ID
 *     description: Obtiene los detalles de un tipo específico de disposición de basura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de disposición de basura
 *     responses:
 *       200:
 *         description: Tipo de disposición encontrado
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
 *                   example: "Tipo de disposición de basura obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoDisposicionBasura'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de disposición no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Tipo de disposición de basura no encontrado"
 *               code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/tipos/:id',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateId,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.getTipoById
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos:
 *   post:
 *     tags: [Disposición de Basura]
 *     summary: Crear un nuevo tipo de disposición de basura
 *     description: Crea un nuevo tipo de disposición de basura en el catálogo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoDisposicionBasuraInput'
 *           example:
 *             nombre: "Separación por Colores"
 *             descripcion: "Sistema de separación de residuos por contenedores de colores"
 *     responses:
 *       201:
 *         description: Tipo de disposición creado exitosamente
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
 *                   example: "Tipo de disposición de basura creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoDisposicionBasura'
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
 *               message: "Ya existe un tipo de disposición de basura con ese nombre"
 *               code: "DUPLICATE_NAME"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/tipos',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateCreateTipo,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.createTipo
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos/{id}:
 *   put:
 *     tags: [Disposición de Basura]
 *     summary: Actualizar un tipo de disposición de basura
 *     description: Actualiza los datos de un tipo existente de disposición de basura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de disposición de basura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoDisposicionBasuraUpdate'
 *           example:
 *             nombre: "Reciclaje Mejorado"
 *             descripcion: "Proceso de reciclaje con tecnología avanzada"
 *     responses:
 *       200:
 *         description: Tipo de disposición actualizado exitosamente
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
 *                   example: "Tipo de disposición de basura actualizado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipo:
 *                       $ref: '#/components/schemas/TipoDisposicionBasura'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de disposición no encontrado
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
router.put('/tipos/:id',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateUpdateTipo,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.updateTipo
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos/{id}:
 *   delete:
 *     tags: [Disposición de Basura]
 *     summary: Eliminar un tipo de disposición de basura
 *     description: Elimina un tipo de disposición de basura del catálogo (solo si no está en uso)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de disposición de basura
 *     responses:
 *       200:
 *         description: Tipo de disposición eliminado exitosamente
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
 *                   example: "Tipo de disposición de basura eliminado exitosamente"
 *                 data:
 *                   type: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de disposición no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Tipo de disposición en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "No se puede eliminar el tipo de disposición porque 5 familia(s) lo están usando"
 *               code: "TIPO_IN_USE"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/tipos/:id',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateId,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.deleteTipo
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/estadisticas:
 *   get:
 *     tags: [Disposición de Basura]
 *     summary: Obtener estadísticas de uso de tipos de disposición
 *     description: Obtiene estadísticas de cuántas familias usan cada tipo de disposición de basura
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
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EstadisticaDisposicion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/estadisticas',
  authMiddleware.authenticateToken,
  disposicionBasuraController.getEstadisticas
);

// ========================
// RUTAS PARA ASIGNACIONES FAMILIA-DISPOSICIÓN
// ========================

/**
 * @swagger
 * /api/catalog/disposicion-basura/asignar:
 *   post:
 *     tags: [Disposición de Basura]
 *     summary: Asignar tipo de disposición a una familia
 *     description: Crea una nueva asignación entre una familia y un tipo de disposición de basura
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsignacionInput'
 *           example:
 *             id_familia: 1
 *             id_tipo_disposicion_basura: 2
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
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
 *                   example: "Tipo de disposición asignado a familia exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     asignacion:
 *                       $ref: '#/components/schemas/FamiliaDisposicionBasura'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Tipo de disposición no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Asignación ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "La familia ya tiene asignado este tipo de disposición de basura"
 *               code: "ASSIGNMENT_EXISTS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/asignar',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateAsignacion,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.asignarTipoAFamilia
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/familia/{idFamilia}/tipo/{idTipo}:
 *   delete:
 *     tags: [Disposición de Basura]
 *     summary: Remover asignación de tipo de disposición de una familia
 *     description: Elimina la asignación entre una familia y un tipo de disposición de basura
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idFamilia
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la familia
 *       - in: path
 *         name: idTipo
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del tipo de disposición de basura
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
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
 *                   example: "Asignación eliminada exitosamente"
 *                 data:
 *                   type: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Asignación no encontrada"
 *               code: "ASSIGNMENT_NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/familia/:idFamilia/tipo/:idTipo',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateRemoveAsignacion,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.removerTipoDeFamilia
);

/**
 * @swagger
 * /api/catalog/disposicion-basura/familia/{idFamilia}:
 *   get:
 *     tags: [Disposición de Basura]
 *     summary: Obtener tipos de disposición de una familia
 *     description: Obtiene todos los tipos de disposición de basura asignados a una familia específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idFamilia
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la familia
 *     responses:
 *       200:
 *         description: Tipos de disposición de familia obtenidos exitosamente
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
 *                   example: "Tipos de disposición de familia obtenidos exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_familia_disposicion_basura:
 *                             type: integer
 *                           id_familia:
 *                             type: integer
 *                           id_tipo_disposicion_basura:
 *                             type: integer
 *                           TipoDisposicionBasura:
 *                             $ref: '#/components/schemas/TipoDisposicionBasura'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/familia/:idFamilia',
  authMiddleware.authenticateToken,
  disposicionBasuraValidators.validateFamiliaId,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.getTiposPorFamilia
);

export default router;
