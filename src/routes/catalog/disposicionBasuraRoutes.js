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
 */

/**
 * @swagger
 * /api/catalog/disposicion-basura/tipos:
 *   get:
 *     tags: [Disposición de Basura]
 *     summary: Obtener todos los tipos de disposición de basura
 *     description: Lista de todos los tipos de disposición de basura
 *     security:
 *       - bearerAuth: []
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
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoDisposicionBasura'
 *                 total:
 *                   type: integer
 *                   example: 12
 *                 message:
 *                   type: string
 *                   example: Se encontraron 12 tipos de disposición de basura
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
  
  authMiddleware.requireRole(['Administrador']),
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
  
  authMiddleware.requireRole(['Administrador']),
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
  authMiddleware.requireRole(['Administrador']),
  disposicionBasuraValidators.validateId,
  validationMiddleware.handleValidationErrors,
  disposicionBasuraController.deleteTipo
);

export default router;
