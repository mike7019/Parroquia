import express from 'express';
import destrezaController from '../../controllers/catalog/destrezaController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Destreza:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id_destreza:
 *           type: integer
 *           description: ID único de la destreza
 *           example: 1
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre de la destreza/habilidad
 *           example: "Programación en JavaScript"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del registro
 *         personas:
 *           type: array
 *           description: Personas que tienen esta destreza (solo en consultas con includePersonas=true)
 *           items:
 *             $ref: '#/components/schemas/PersonaBasica'
 *     
 *     PersonaBasica:
 *       type: object
 *       properties:
 *         id_persona:
 *           type: integer
 *           description: ID de la persona
 *         nombres:
 *           type: string
 *           description: Nombres de la persona
 *         apellidos:
 *           type: string
 *           description: Apellidos de la persona
 *         numero_identificacion:
 *           type: string
 *           description: Número de identificación
 *         email:
 *           type: string
 *           description: Email de la persona
 *     
 *     DestrezaInput:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 255
 *           description: Nombre de la destreza/habilidad
 *           example: "Diseño Gráfico"
 *     
 *     AsociacionDestreza:
 *       type: object
 *       required:
 *         - idDestreza
 *       properties:
 *         idDestreza:
 *           type: integer
 *           description: ID de la destreza a asociar/desasociar
 *           example: 1
 *     
 *     DestrezasResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Destrezas obtenidas exitosamente"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Destreza'
 *         paginacion:
 *           $ref: '#/components/schemas/Paginacion'
 *         filtros:
 *           type: object
 *           properties:
 *             busqueda:
 *               type: string
 *             ordenarPor:
 *               type: string
 *             direccionOrden:
 *               type: string
 *             incluirPersonas:
 *               type: boolean
 *     
 *     EstadisticasDestrezas:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *           example: true
 *         mensaje:
 *           type: string
 *           example: "Estadísticas obtenidas exitosamente"
 *         datos:
 *           type: object
 *           properties:
 *             resumen:
 *               type: object
 *               properties:
 *                 totalDestrezas:
 *                   type: integer
 *                   description: Total de destrezas en el catálogo
 *                 destrezasConPersonas:
 *                   type: integer
 *                   description: Destrezas que tienen al menos una persona asociada
 *                 destrezasSinPersonas:
 *                   type: integer
 *                   description: Destrezas sin personas asociadas
 *                 porcentajeUtilizacion:
 *                   type: integer
 *                   description: Porcentaje de destrezas utilizadas
 *             destrezasPopulares:
 *               type: array
 *               description: Las 5 destrezas con más personas asociadas
 *               items:
 *                 type: object
 *                 properties:
 *                   id_destreza:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   total_personas:
 *                     type: integer
 *   
 *   parameters:
 *     DestrezaId:
 *       name: id
 *       in: path
 *       required: true
 *       description: ID de la destreza
 *       schema:
 *         type: integer
 *         minimum: 1
 *     
 *     PersonaId:
 *       name: idPersona
 *       in: path
 *       required: true
 *       description: ID de la persona
 *       schema:
 *         type: integer
 *         minimum: 1
 *     
 *     TerminoBusqueda:
 *       name: termino
 *       in: path
 *       required: true
 *       description: Término de búsqueda para filtrar destrezas
 *       schema:
 *         type: string
 *         minLength: 1
 */

/**
 * @swagger
 * /api/catalog/destrezas:
 *   get:
 *     summary: Obtener todas las destrezas
 *     description: Obtiene la lista de destrezas con opciones de paginación, búsqueda y filtros
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Número de página (por defecto 1)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Registros por página (por defecto 10)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: search
 *         in: query
 *         description: Término de búsqueda para filtrar por nombre
 *         schema:
 *           type: string
 *       - name: includePersonas
 *         in: query
 *         description: Incluir personas asociadas a cada destreza
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: orderBy
 *         in: query
 *         description: Campo por el cual ordenar
 *         schema:
 *           type: string
 *           enum: [nombre, id_destreza, created_at, updated_at]
 *           default: nombre
 *       - name: orderDirection
 *         in: query
 *         description: Dirección del ordenamiento
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Lista de destrezas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DestrezasResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware.authenticateToken, destrezaController.getAllDestrezas);

/**
 * @swagger
 * /api/catalog/destrezas/stats:
 *   get:
 *     summary: Obtener estadísticas de destrezas
 *     description: Obtiene estadísticas y métricas sobre el catálogo de destrezas
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadisticasDestrezas'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', authMiddleware.authenticateToken, destrezaController.getDestrezasStats);

/**
 * @swagger
 * /api/catalog/destrezas/search/{termino}:
 *   get:
 *     summary: Buscar destrezas por término
 *     description: Busca destrezas que coincidan con el término especificado en el nombre
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/TerminoBusqueda'
 *       - name: limite
 *         in: query
 *         description: Límite de resultados (por defecto 20)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Búsqueda completada exitosamente
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
 *                   example: "Búsqueda completada. 3 resultado(s) encontrado(s)"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_destreza:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 termino:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/search/:termino', authMiddleware.authenticateToken, destrezaController.searchDestrezas);

/**
 * @swagger
 * /api/catalog/destrezas/persona/{idPersona}:
 *   get:
 *     summary: Obtener destrezas de una persona
 *     description: Obtiene todas las destrezas asociadas a una persona específica
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PersonaId'
 *     responses:
 *       200:
 *         description: Destrezas de la persona obtenidas exitosamente
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
 *                   example: "Destrezas de la persona obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     persona:
 *                       $ref: '#/components/schemas/PersonaBasica'
 *                     destrezas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Destreza'
 *                     total_destrezas:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/persona/:idPersona', authMiddleware.authenticateToken, destrezaController.getDestrezasByPersona);

/**
 * @swagger
 * /api/catalog/destrezas/{id}:
 *   get:
 *     summary: Obtener una destreza por ID
 *     description: Obtiene los detalles de una destreza específica por su ID
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DestrezaId'
 *       - name: includePersonas
 *         in: query
 *         description: Incluir personas asociadas a la destreza
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Destreza obtenida exitosamente
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
 *                   example: "Destreza obtenida exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Destreza'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authMiddleware.authenticateToken, destrezaController.getDestrezaById);

/**
 * @swagger
 * /api/catalog/destrezas:
 *   post:
 *     summary: Crear una nueva destreza
 *     description: Crea una nueva destreza en el catálogo
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DestrezaInput'
 *           examples:
 *             ejemplo1:
 *               summary: Destreza de programación
 *               value:
 *                 nombre: "Programación en Python"
 *             ejemplo2:
 *               summary: Destreza artística
 *               value:
 *                 nombre: "Pintura al óleo"
 *     responses:
 *       201:
 *         description: Destreza creada exitosamente
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
 *                   example: "Destreza creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Destreza'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  destrezaController.createDestreza);

/**
 * @swagger
 * /api/catalog/destrezas/persona/{idPersona}/asociar:
 *   post:
 *     summary: Asociar una destreza a una persona
 *     description: Crea una asociación entre una destreza y una persona específica
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PersonaId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsociacionDestreza'
 *           examples:
 *             ejemplo:
 *               summary: Asociar destreza
 *               value:
 *                 idDestreza: 1
 *     responses:
 *       200:
 *         description: Destreza asociada exitosamente
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
 *                   example: "Destreza asociada exitosamente a la persona"
 *                 data:
 *                   type: object
 *                   properties:
 *                     persona:
 *                       $ref: '#/components/schemas/PersonaBasica'
 *                     destreza:
 *                       type: object
 *                       properties:
 *                         id_destreza:
 *                           type: integer
 *                         nombre:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/persona/:idPersona/asociar', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  destrezaController.asociarDestrezaPersona);

/**
 * @swagger
 * /api/catalog/destrezas/{id}:
 *   put:
 *     summary: Actualizar una destreza
 *     description: Actualiza los datos de una destreza existente
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DestrezaId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DestrezaInput'
 *           examples:
 *             ejemplo:
 *               summary: Actualizar nombre
 *               value:
 *                 nombre: "Programación en JavaScript Avanzado"
 *     responses:
 *       200:
 *         description: Destreza actualizada exitosamente
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
 *                   example: "Destreza actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Destreza'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  destrezaController.updateDestreza);

/**
 * @swagger
 * /api/catalog/destrezas/{id}:
 *   delete:
 *     summary: Eliminar una destreza
 *     description: Elimina una destreza del catálogo (solo si no tiene personas asociadas)
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DestrezaId'
 *     responses:
 *       200:
 *         description: Destreza eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Destreza eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_destreza:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *       400:
 *         description: No se puede eliminar (tiene personas asociadas)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "No se puede eliminar la destreza porque tiene 3 persona(s) asociada(s)"
 *                 data:
 *                   type: object
 *                   properties:
 *                     personasAsociadas:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  destrezaController.deleteDestreza);

/**
 * @swagger
 * /api/catalog/destrezas/persona/{idPersona}/desasociar:
 *   delete:
 *     summary: Desasociar una destreza de una persona
 *     description: Elimina la asociación entre una destreza y una persona específica
 *     tags: [Destrezas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PersonaId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsociacionDestreza'
 *           examples:
 *             ejemplo:
 *               summary: Desasociar destreza
 *               value:
 *                 idDestreza: 1
 *     responses:
 *       200:
 *         description: Destreza desasociada exitosamente
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
 *                   example: "Destreza desasociada exitosamente de la persona"
 *                 data:
 *                   type: object
 *                   properties:
 *                     persona:
 *                       $ref: '#/components/schemas/PersonaBasica'
 *                     destreza:
 *                       type: object
 *                       properties:
 *                         id_destreza:
 *                           type: integer
 *                         nombre:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/persona/:idPersona/desasociar', authMiddleware.authenticateToken, 
  authMiddleware.requireRole(['Administrador']),
  destrezaController.desasociarDestrezaPersona);

export default router;
