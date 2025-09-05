import express from 'express';
import sexoController from '../../controllers/catalog/sexoController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Sexo:
 *       type: object
 *       properties:
 *         id_sexo:
 *           type: integer
 *           format: int64
 *           description: ID único del sexo
 *           example: 1
 *         nombre:
 *           type: string
 *           maxLength: 50
 *           description: Nombre del sexo
 *           example: "Masculino"
 *         codigo:
 *           type: string
 *           maxLength: 1
 *           description: Código del sexo (M, F, O)
 *           example: "M"
 *           enum: ["M", "F", "O"]
 *         descripcion:
 *           type: string
 *           description: Descripción adicional del sexo
 *           example: "Sexo masculino"
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     SexoInput:
 *       type: object
 *       required:
 *         - nombre
 *         - codigo
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 50
 *           minLength: 1
 *           description: Nombre del sexo
 *           example: "Masculino"
 *         codigo:
 *           type: string
 *           maxLength: 1
 *           minLength: 1
 *           description: Código del sexo (M para Masculino, F para Femenino, O para Otro)
 *           example: "M"
 *           enum: ["M", "F", "O"]
 *         descripcion:
 *           type: string
 *           description: Descripción adicional del sexo
 *           example: "Sexo masculino"
 *           nullable: true
 *     SexoUpdate:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 50
 *           minLength: 1
 *           description: Nombre del sexo
 *           example: "Masculino"
 *         codigo:
 *           type: string
 *           maxLength: 1
 *           minLength: 1
 *           description: Código del sexo (M para Masculino, F para Femenino, O para Otro)
 *           example: "M"
 *           enum: ["M", "F", "O"]
 *         descripcion:
 *           type: string
 *           description: Descripción adicional del sexo
 *           example: "Sexo masculino"
 *           nullable: true
 */

/**
 * @swagger
 * /api/catalog/sexos:
 *   post:
 *     summary: Create a new sexo
 *     description: Crea un nuevo registro de sexo. Tanto el nombre como el código son requeridos y deben ser únicos.
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SexoInput'
 *           examples:
 *             masculino:
 *               summary: Crear sexo masculino
 *               value:
 *                 nombre: "Masculino"
 *                 codigo: "M"
 *                 descripcion: "Sexo masculino"
 *             femenino:
 *               summary: Crear sexo femenino
 *               value:
 *                 nombre: "Femenino"
 *                 codigo: "F"
 *                 descripcion: "Sexo femenino"
 *             otro:
 *               summary: Crear otro sexo
 *               value:
 *                 nombre: "Otro"
 *                 codigo: "O"
 *                 descripcion: "Otro tipo de identidad de género"
 *             minimal:
 *               summary: Datos mínimos requeridos
 *               value:
 *                 nombre: "No binario"
 *                 codigo: "O"
 *     responses:
 *       201:
 *         description: Sexo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Sexo'
 *             example:
 *               status: "success"
 *               message: "Sexo created successfully"
 *               data:
 *                 id_sexo: 1
 *                 nombre: "Masculino"
 *                 codigo: "M"
 *                 descripcion: "Sexo masculino"
 *                 created_at: "2025-09-04T19:46:38.120Z"
 *                 updated_at: "2025-09-04T19:46:38.120Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               missingRequired:
 *                 summary: Campos requeridos faltantes
 *                 value:
 *                   status: "error"
 *                   message: "El nombre y código del sexo son requeridos"
 *                   code: "VALIDATION_ERROR"
 *               invalidCode:
 *                 summary: Código inválido
 *                 value:
 *                   status: "error"
 *                   message: "El código debe ser M (Masculino), F (Femenino) u O (Otro)"
 *                   code: "VALIDATION_ERROR"
 *               nameTooLong:
 *                 summary: Nombre muy largo
 *                 value:
 *                   status: "error"
 *                   message: "El nombre debe tener entre 1 y 50 caracteres"
 *                   code: "VALIDATION_ERROR"
 *       409:
 *         description: Sexo already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               duplicateName:
 *                 summary: Nombre duplicado
 *                 value:
 *                   status: "error"
 *                   message: "Ya existe un sexo con este nombre"
 *                   code: "DUPLICATE_ERROR"
 *               duplicateCode:
 *                 summary: Código duplicado
 *                 value:
 *                   status: "error"
 *                   message: "Ya existe un sexo con este código"
 *                   code: "DUPLICATE_ERROR"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/', sexoController.createSexo);

/**
 * @swagger
 * /api/catalog/sexos/search:
 *   get:
 *     summary: Search sexos
 *     description: Busca sexos por nombre con paginación limitada
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *         example: "Masc"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número máximo de resultados
 *         example: 10
 *     responses:
 *       200:
 *         description: Search completed successfully
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
 *                         $ref: '#/components/schemas/Sexo'
 *             examples:
 *               foundResults:
 *                 summary: Resultados encontrados
 *                 value:
 *                   status: "success"
 *                   message: "Search completed successfully"
 *                   data:
 *                     - id_sexo: 1
 *                       nombre: "Masculino"
 *                       codigo: "M"
 *                       descripcion: "Sexo masculino"
 *                       created_at: "2025-09-04T19:46:38.120Z"
 *                       updated_at: "2025-09-04T19:46:38.120Z"
 *               noResults:
 *                 summary: Sin resultados
 *                 value:
 *                   status: "success"
 *                   message: "Search completed successfully"
 *                   data: []
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               shortQuery:
 *                 summary: Consulta muy corta
 *                 value:
 *                   status: "error"
 *                   message: "Search query must be at least 2 characters long"
 *                   code: "VALIDATION_ERROR"
 *               missingQuery:
 *                 summary: Consulta faltante
 *                 value:
 *                   status: "error"
 *                   message: "Search query is required"
 *                   code: "VALIDATION_ERROR"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/search', sexoController.searchSexos);

/**
 * @swagger
 * /api/catalog/sexos/stats:
 *   get:
 *     summary: Get statistics for sexos
 *     description: Obtiene estadísticas generales sobre los registros de sexo
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         totalSexos:
 *                           type: integer
 *                           description: Total number of sexos
 *                           example: 3
 *                         porCodigo:
 *                           type: object
 *                           description: Distribución por código
 *                           properties:
 *                             M:
 *                               type: integer
 *                               example: 1
 *                             F:
 *                               type: integer
 *                               example: 1
 *                             O:
 *                               type: integer
 *                               example: 1
 *                         ultimaActualizacion:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de la última actualización
 *                           example: "2025-09-04T19:46:38.120Z"
 *             examples:
 *               normalStats:
 *                 summary: Estadísticas normales
 *                 value:
 *                   status: "success"
 *                   message: "Statistics retrieved successfully"
 *                   data:
 *                     totalSexos: 3
 *                     porCodigo:
 *                       M: 1
 *                       F: 1
 *                       O: 1
 *                     ultimaActualizacion: "2025-09-04T19:46:38.120Z"
 *               emptyStats:
 *                 summary: Sin datos
 *                 value:
 *                   status: "success"
 *                   message: "Statistics retrieved successfully"
 *                   data:
 *                     totalSexos: 0
 *                     porCodigo: {}
 *                     ultimaActualizacion: null
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', sexoController.getStatistics);

/**
 * @swagger
 * /api/catalog/sexos:
 *   get:
 *     summary: Get all sexos
 *     description: Obtiene todos los registros de sexo con opciones de filtrado y ordenamiento
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda para filtrar por nombre
 *         example: "Masc"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: "id_sexo"
 *           enum: ["id_sexo", "nombre", "codigo", "created_at", "updated_at"]
 *         description: Campo por el cual ordenar los resultados
 *         example: "nombre"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: "ASC"
 *           enum: ["ASC", "DESC"]
 *         description: Orden de los resultados
 *         example: "ASC"
 *     responses:
 *       200:
 *         description: Sexos retrieved successfully
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
 *                     $ref: '#/components/schemas/Sexo'
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: Se encontraron 3 sexos
 *             examples:
 *               successResponse:
 *                 summary: Respuesta exitosa con datos
 *                 value:
 *                   status: "success"
 *                   message: "Se encontraron 3 sexos"
 *                   data:
 *                     - id_sexo: 1
 *                       nombre: "Masculino"
 *                       codigo: "M"
 *                       descripcion: "Sexo masculino"
 *                       created_at: "2025-09-04T19:46:38.120Z"
 *                       updated_at: "2025-09-04T19:46:38.120Z"
 *                     - id_sexo: 2
 *                       nombre: "Femenino"
 *                       codigo: "F"
 *                       descripcion: "Sexo femenino"
 *                       created_at: "2025-09-04T19:46:38.120Z"
 *                       updated_at: "2025-09-04T19:46:38.120Z"
 *                     - id_sexo: 3
 *                       nombre: "Otro"
 *                       codigo: "O"
 *                       descripcion: "Otro tipo de identidad de género"
 *                       created_at: "2025-09-04T19:46:38.120Z"
 *                       updated_at: "2025-09-04T19:46:38.120Z"
 *                   total: 3
 *               emptyResponse:
 *                 summary: Sin resultados
 *                 value:
 *                   status: "success"
 *                   message: "No se encontraron sexos"
 *                   data: []
 *                   total: 0
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', sexoController.getAllSexos);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   get:
 *     summary: Get sexo by ID
 *     description: Obtiene un registro de sexo específico por su ID
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         description: ID del sexo a consultar
 *         example: 1
 *     responses:
 *       200:
 *         description: Sexo retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Sexo'
 *             example:
 *               status: "success"
 *               message: "Sexo retrieved successfully"
 *               data:
 *                 id_sexo: 1
 *                 nombre: "Masculino"
 *                 codigo: "M"
 *                 descripcion: "Sexo masculino"
 *                 created_at: "2025-09-04T19:46:38.120Z"
 *                 updated_at: "2025-09-04T19:46:38.120Z"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Invalid ID provided"
 *               code: "VALIDATION_ERROR"
 *       404:
 *         description: Sexo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Sexo not found"
 *               code: "NOT_FOUND"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/:id', sexoController.getSexoById);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   put:
 *     summary: Update sexo
 *     description: Actualiza un registro de sexo existente. Al menos uno de los campos debe ser proporcionado.
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *         description: ID del sexo a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SexoUpdate'
 *           examples:
 *             updateComplete:
 *               summary: Actualización completa
 *               value:
 *                 nombre: "Masculino"
 *                 codigo: "M"
 *                 descripcion: "Sexo masculino"
 *             updatePartial:
 *               summary: Actualización parcial
 *               value:
 *                 nombre: "Femenino"
 *             updateWithDescription:
 *               summary: Con descripción
 *               value:
 *                 nombre: "Otro"
 *                 codigo: "O"
 *                 descripcion: "Otro tipo de identidad de género"
 *     responses:
 *       200:
 *         description: Sexo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Sexo'
 *             example:
 *               status: "success"
 *               message: "Sexo updated successfully"
 *               data:
 *                 id_sexo: 1
 *                 nombre: "Masculino"
 *                 codigo: "M"
 *                 descripcion: "Sexo masculino"
 *                 created_at: "2025-09-04T19:46:38.120Z"
 *                 updated_at: "2025-09-04T20:15:22.456Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               invalidCode:
 *                 summary: Código inválido
 *                 value:
 *                   status: "error"
 *                   message: "El código debe ser M (Masculino), F (Femenino) u O (Otro)"
 *                   code: "VALIDATION_ERROR"
 *               emptyName:
 *                 summary: Nombre vacío
 *                 value:
 *                   status: "error"
 *                   message: "El nombre del sexo no puede estar vacío"
 *                   code: "VALIDATION_ERROR"
 *       404:
 *         description: Sexo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Sexo not found"
 *               code: "NOT_FOUND"
 *       409:
 *         description: Sexo with this name or code already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Sexo with this name already exists"
 *               code: "DUPLICATE_ERROR"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.put('/:id', sexoController.updateSexo);

/**
 * @swagger
 * /api/catalog/sexos/{id}:
 *   delete:
 *     summary: Delete sexo
 *     description: Elimina un registro de sexo. No se puede eliminar si tiene personas asociadas.
 *     tags: [Sexos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           minimum: 1
 *         description: ID del sexo a eliminar
 *         example: 3
 *     responses:
 *       200:
 *         description: Sexo deleted successfully
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
 *                         message:
 *                           type: string
 *                           example: "Sexo deleted successfully"
 *             example:
 *               status: "success"
 *               message: "Sexo deleted successfully"
 *               data:
 *                 message: "Sexo deleted successfully"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Invalid ID provided"
 *               code: "VALIDATION_ERROR"
 *       404:
 *         description: Sexo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               status: "error"
 *               message: "Sexo not found"
 *               code: "NOT_FOUND"
 *       409:
 *         description: Cannot delete sexo with associated people
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               hasAssociatedPeople:
 *                 summary: Tiene personas asociadas
 *                 value:
 *                   status: "error"
 *                   message: "Cannot delete sexo with associated families"
 *                   code: "CONSTRAINT_ERROR"
 *               integrityConctraint:
 *                 summary: Restricción de integridad
 *                 value:
 *                   status: "error"
 *                   message: "No se puede eliminar el sexo porque está siendo utilizado por personas registradas"
 *                   code: "CONSTRAINT_ERROR"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', sexoController.deleteSexo);

export default router;
