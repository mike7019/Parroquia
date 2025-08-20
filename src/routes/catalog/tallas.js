import { Router } from 'express';
import { body, query, param } from 'express-validator';
import tallaController from '../../controllers/catalog/tallaController.js';
import validationMiddleware from '../../middlewares/validation.js';
import authMiddleware from '../../middlewares/auth.js';

const router = Router();

// Middlewares de validación
const validateTallaCreation = [
  body('tipo_prenda')
    .isIn(['zapato', 'camisa', 'pantalon'])
    .withMessage('tipo_prenda debe ser: zapato, camisa o pantalon'),
  body('talla')
    .notEmpty()
    .trim()
    .withMessage('talla es requerida'),
  body('genero')
    .optional()
    .isIn(['masculino', 'femenino', 'unisex'])
    .withMessage('genero debe ser: masculino, femenino o unisex'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('descripcion no puede exceder 500 caracteres'),
  body('equivalencia_numerica')
    .optional()
    .isNumeric()
    .withMessage('equivalencia_numerica debe ser un número'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser verdadero o falso')
];

const validateTallaUpdate = [
  body('tipo_prenda')
    .optional()
    .isIn(['zapato', 'camisa', 'pantalon'])
    .withMessage('tipo_prenda debe ser: zapato, camisa o pantalon'),
  body('talla')
    .optional()
    .notEmpty()
    .trim()
    .withMessage('talla no puede estar vacía'),
  body('genero')
    .optional()
    .isIn(['masculino', 'femenino', 'unisex'])
    .withMessage('genero debe ser: masculino, femenino o unisex'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('descripcion no puede exceder 500 caracteres'),
  body('equivalencia_numerica')
    .optional()
    .isNumeric()
    .withMessage('equivalencia_numerica debe ser un número'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser verdadero o falso')
];

const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID debe ser un número entero positivo')
];

const validateTipoPrendaParam = [
  param('tipo_prenda')
    .isIn(['zapato', 'camisa', 'pantalon'])
    .withMessage('tipo_prenda debe ser: zapato, camisa o pantalon')
];

const validateQueryParams = [
  query('tipo_prenda')
    .optional()
    .isIn(['zapato', 'camisa', 'pantalon'])
    .withMessage('tipo_prenda debe ser: zapato, camisa o pantalon'),
  query('genero')
    .optional()
    .isIn(['masculino', 'femenino', 'unisex'])
    .withMessage('genero debe ser: masculino, femenino o unisex'),
  query('activo')
    .optional()
    .isBoolean()
    .withMessage('activo debe ser verdadero o falso')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Talla:
 *       type: object
 *       required:
 *         - tipo_prenda
 *         - talla
 *       properties:
 *         id_talla:
 *           type: integer
 *           description: ID único de la talla
 *           example: 1
 *         tipo_prenda:
 *           type: string
 *           enum: [zapato, camisa, pantalon]
 *           description: Tipo de prenda
 *           example: "zapato"
 *         talla:
 *           type: string
 *           description: Nombre de la talla
 *           example: "42"
 *         genero:
 *           type: string
 *           enum: [masculino, femenino, unisex]
 *           description: Género para el que está diseñada la talla
 *           example: "masculino"
 *         descripcion:
 *           type: string
 *           description: Descripción adicional de la talla
 *           example: "Talla 42 europea para zapatos masculinos"
 *         equivalencia_numerica:
 *           type: number
 *           description: Equivalencia numérica para ordenamiento
 *           example: 42
 *         activo:
 *           type: boolean
 *           description: Si la talla está activa
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 * 
 *     TallaInput:
 *       type: object
 *       required:
 *         - tipo_prenda
 *         - talla
 *       properties:
 *         tipo_prenda:
 *           type: string
 *           enum: [zapato, camisa, pantalon]
 *           example: "zapato"
 *         talla:
 *           type: string
 *           example: "42"
 *         genero:
 *           type: string
 *           enum: [masculino, femenino, unisex]
 *           example: "masculino"
 *         descripcion:
 *           type: string
 *           example: "Talla 42 europea para zapatos masculinos"
 *         equivalencia_numerica:
 *           type: number
 *           example: 42
 *         activo:
 *           type: boolean
 *           example: true
 * 
 *     TallaEstadisticas:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 50
 *         activas:
 *           type: integer
 *           example: 45
 *         inactivas:
 *           type: integer
 *           example: 5
 *         por_tipo:
 *           type: object
 *           properties:
 *             zapato:
 *               type: integer
 *               example: 20
 *             camisa:
 *               type: integer
 *               example: 15
 *             pantalon:
 *               type: integer
 *               example: 15
 *         por_genero:
 *           type: object
 *           properties:
 *             masculino:
 *               type: integer
 *               example: 20
 *             femenino:
 *               type: integer
 *               example: 18
 *             unisex:
 *               type: integer
 *               example: 12
 */

/**
 * @swagger
 * /api/catalog/tallas:
 *   get:
 *     summary: Obtener todas las tallas
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tallas obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Talla'
 *                 total:
 *                   type: integer
 *                   example: 45
 *                 message:
 *                   type: string
 *                   example: Se encontraron 45 tallas
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', 
  authMiddleware.authenticateToken,
  validateQueryParams,
  validationMiddleware.handleValidationErrors,
  tallaController.getAllTallas
);

/**
 * @swagger
 * /api/catalog/tallas/{id}:
 *   get:
 *     summary: Obtener una talla por ID
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la talla
 *     responses:
 *       200:
 *         description: Talla obtenida exitosamente
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
 *                   example: "Talla obtenida exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     talla:
 *                       $ref: '#/components/schemas/Talla'
 *       400:
 *         description: ID de talla inválido
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Talla no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id',
  authMiddleware.authenticateToken,
  validateIdParam,
  validationMiddleware.handleValidationErrors,
  tallaController.getTallaById
);

/**
 * @swagger
 * /api/catalog/tallas:
 *   post:
 *     summary: Crear una nueva talla
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TallaInput'
 *     responses:
 *       201:
 *         description: Talla creada exitosamente
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
 *                   example: "Talla creada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     talla:
 *                       $ref: '#/components/schemas/Talla'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       409:
 *         description: La talla ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/',
  authMiddleware.authenticateToken,
  validateTallaCreation,
  validationMiddleware.handleValidationErrors,
  tallaController.createTalla
);

/**
 * @swagger
 * /api/catalog/tallas/{id}:
 *   put:
 *     summary: Actualizar una talla
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la talla
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_prenda:
 *                 type: string
 *                 enum: [zapato, camisa, pantalon]
 *               talla:
 *                 type: string
 *               genero:
 *                 type: string
 *                 enum: [masculino, femenino, unisex]
 *               descripcion:
 *                 type: string
 *               equivalencia_numerica:
 *                 type: number
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Talla actualizada exitosamente
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
 *                   example: "Talla actualizada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     talla:
 *                       $ref: '#/components/schemas/Talla'
 *       400:
 *         description: ID inválido o datos de entrada inválidos
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Talla no encontrada
 *       409:
 *         description: Ya existe una talla con esos datos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id',
  authMiddleware.authenticateToken,
  validateIdParam,
  validateTallaUpdate,
  validationMiddleware.handleValidationErrors,
  tallaController.updateTalla
);

/**
 * @swagger
 * /api/catalog/tallas/{id}:
 *   delete:
 *     summary: Eliminar una talla
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la talla
 *     responses:
 *       200:
 *         description: Talla eliminada exitosamente
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
 *                   example: "Talla eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Talla eliminada correctamente"
 *       400:
 *         description: ID de talla inválido
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Talla no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id',
  authMiddleware.authenticateToken,
  validateIdParam,
  validationMiddleware.handleValidationErrors,
  tallaController.deleteTalla
);

/**
 * @swagger
 * /api/catalog/tallas/tipo/{tipo_prenda}:
 *   get:
 *     summary: Obtener tallas por tipo de prenda
 *     tags: [Tallas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo_prenda
 *         required: true
 *         schema:
 *           type: string
 *           enum: [zapato, camisa, pantalon]
 *         description: Tipo de prenda
 *       - in: query
 *         name: genero
 *         schema:
 *           type: string
 *           enum: [masculino, femenino, unisex]
 *         description: Filtrar por género
 *     responses:
 *       200:
 *         description: Tallas obtenidas exitosamente
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
 *                   example: "Tallas de zapato obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tallas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Talla'
 *                     total:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Tipo de prenda inválido
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/tipo/:tipo_prenda',
  authMiddleware.authenticateToken,
  validateTipoPrendaParam,
  validationMiddleware.handleValidationErrors,
  tallaController.getTallasByTipo
);

/**
 * @swagger
 * /api/catalog/tallas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de tallas
 *     tags: [Tallas]
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     estadisticas:
 *                       $ref: '#/components/schemas/TallaEstadisticas'
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas/resumen',
  authMiddleware.authenticateToken,
  tallaController.getEstadisticas
);

export default router;
