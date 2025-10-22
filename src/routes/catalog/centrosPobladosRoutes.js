import express from 'express';
import centrosPobladosController from '../../controllers/catalog/centrosPobladosController.js';
import authMiddleware from '../../middlewares/auth.js';
import validationMiddleware from '../../middlewares/validation.js';
import centrosPobladosValidators from '../../validators/centrosPobladosValidators.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CentroPoblado:
 *       type: object
 *       properties:
 *         id_centro_poblado:
 *           type: integer
 *           description: ID único del centro poblado
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del centro poblado
 *           example: "Centro Poblado Principal"
 *         codigo_centro_poblado:
 *           type: string
 *           description: Código único del centro poblado (generado automáticamente)
 *           example: "CP-0001"
 *           readOnly: true
 *         id_municipio_municipios:
 *           type: integer
 *           description: ID del municipio al que pertenece
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         municipio:
 *           type: object
 *           properties:
 *             id_municipio:
 *               type: integer
 *             nombre_municipio:
 *               type: string
 *             codigo_municipio:
 *               type: string
 *     
 *     CentroPobladoInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del centro poblado
 *           example: "Centro Poblado Norte"
 *         id_municipio_municipios:
 *           type: integer
 *           minimum: 1
 *           description: ID del municipio (opcional)
 *           example: 1
 *     
 *     CentroPobladoUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nombre del centro poblado
 *           example: "Centro Poblado Actualizado"
 *         id_municipio_municipios:
 *           type: integer
 *           minimum: 1
 *           description: ID del municipio
 *           example: 2
 */

/**
 * @swagger
 * /api/catalog/centros-poblados:
 *   get:
 *     tags: [Centros Poblados]
 *     summary: Obtener todos los centros poblados
 *     description: Lista paginada de centros poblados con opciones de búsqueda y filtrado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o código
 *         example: "Principal"
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: Filtrar por municipio
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Registros por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nombre, codigo_centro_poblado, created_at, updated_at]
 *           default: nombre
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de centros poblados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Se encontraron 15 centro(s) poblado(s)
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CentroPoblado'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     total:
 *                       type: integer
 *                       example: 15
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/',
  authMiddleware.authenticateToken,
  centrosPobladosValidators.validateQuery,
  validationMiddleware.handleValidationErrors,
  centrosPobladosController.getAllCentrosPoblados
);

/**
 * @swagger
 * /api/catalog/centros-poblados/municipio/{id_municipio}:
 *   get:
 *     tags: [Centros Poblados]
 *     summary: Obtener centros poblados por municipio
 *     description: Obtiene todos los centros poblados de un municipio específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_municipio
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del municipio
 *         example: 1
 *     responses:
 *       200:
 *         description: Centros poblados obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/CentroPoblado'
 *                 total:
 *                   type: integer
 *                   example: 2
 *                 municipio:
 *                   type: object
 *                   properties:
 *                     id_municipio:
 *                       type: integer
 *                     nombre_municipio:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Se encontraron 2 centro(s) poblado(s) en Medellín
 *       404:
 *         description: Municipio no encontrado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/municipio/:id_municipio',
  authMiddleware.authenticateToken,
  centrosPobladosController.getCentrosPobladosByMunicipio
);

/**
 * @swagger
 * /api/catalog/centros-poblados/statistics:
 *   get:
 *     tags: [Centros Poblados]
 *     summary: Obtener estadísticas de centros poblados
 *     description: Obtiene estadísticas de uso de centros poblados (familias por centro poblado)
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
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Estadísticas obtenidas exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_centro_poblado:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       codigo:
 *                         type: string
 *                       municipio:
 *                         type: string
 *                       familias_usando:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics',
  authMiddleware.authenticateToken,
  centrosPobladosController.getEstadisticas
);

/**
 * @swagger
 * /api/catalog/centros-poblados/{id}:
 *   get:
 *     tags: [Centros Poblados]
 *     summary: Obtener un centro poblado por ID
 *     description: Obtiene los detalles de un centro poblado específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del centro poblado
 *     responses:
 *       200:
 *         description: Centro poblado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Centro poblado obtenido exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/CentroPoblado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Centro poblado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  centrosPobladosValidators.validateId,
  validationMiddleware.handleValidationErrors,
  centrosPobladosController.getCentroPobladoById
);

/**
 * @swagger
 * /api/catalog/centros-poblados:
 *   post:
 *     tags: [Centros Poblados]
 *     summary: Crear un nuevo centro poblado
 *     description: Crea un nuevo centro poblado en el catálogo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CentroPobladoInput'
 *           example:
 *             nombre: "Centro Poblado San Pedro"
 *             id_municipio_municipios: 1
 *     responses:
 *       201:
 *         description: Centro poblado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Centro poblado creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/CentroPoblado'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: Ya existe un centro poblado con ese nombre o código
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  centrosPobladosValidators.validateCreate,
  validationMiddleware.handleValidationErrors,
  centrosPobladosController.createCentroPoblado
);

/**
 * @swagger
 * /api/catalog/centros-poblados/{id}:
 *   put:
 *     tags: [Centros Poblados]
 *     summary: Actualizar un centro poblado
 *     description: Actualiza los datos de un centro poblado existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del centro poblado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CentroPobladoUpdate'
 *           example:
 *             nombre: "Centro Poblado San Pedro Actualizado"
 *             id_municipio_municipios: 2
 *     responses:
 *       200:
 *         description: Centro poblado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Centro poblado actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/CentroPoblado'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Centro poblado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Ya existe un centro poblado con ese nombre o código
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  centrosPobladosValidators.validateUpdate,
  validationMiddleware.handleValidationErrors,
  centrosPobladosController.updateCentroPoblado
);

/**
 * @swagger
 * /api/catalog/centros-poblados/{id}:
 *   delete:
 *     tags: [Centros Poblados]
 *     summary: Eliminar un centro poblado
 *     description: Elimina un centro poblado del catálogo (solo si no está en uso)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del centro poblado
 *     responses:
 *       200:
 *         description: Centro poblado eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Centro poblado eliminado exitosamente
 *                 data:
 *                   type: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Centro poblado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Centro poblado en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: error
 *               message: No se puede eliminar el centro poblado porque 5 familia(s) lo están usando
 *               code: CENTRO_POBLADO_IN_USE
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id',
  authMiddleware.authenticateToken,
  authMiddleware.requireRole(['Administrador']),
  centrosPobladosValidators.validateId,
  validationMiddleware.handleValidationErrors,
  centrosPobladosController.deleteCentroPoblado
);

export default router;
