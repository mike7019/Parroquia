import express from 'express';
import familiasConsolidadoController from '../../controllers/consolidados/familiasConsolidadoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonaFamilia:
 *       type: object
 *       properties:
 *         id_persona:
 *           type: integer
 *           description: ID único de la persona
 *         documento:
 *           type: string
 *           description: Número de documento de identificación
 *         nombre:
 *           type: string
 *           description: Nombre completo de la persona
 *         sexo:
 *           type: string
 *           description: Sexo de la persona
 *         edad:
 *           type: integer
 *           description: Edad calculada
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *         parentesco:
 *           type: string
 *           description: Parentesco inferido
 *         apellido_familiar:
 *           type: string
 *           description: Apellido de la familia
 *         direccion:
 *           type: string
 *           description: Dirección de residencia
 *         parroquia:
 *           type: string
 *           description: Parroquia de pertenencia
 *         municipio:
 *           type: string
 *           description: Municipio de residencia
 *         sector:
 *           type: string
 *           description: Sector o vereda
 *         familia:
 *           type: object
 *           properties:
 *             id_familia:
 *               type: integer
 *             apellido_familiar:
 *               type: string
 *             tipo_vivienda:
 *               type: string
 *             tamaño_familia:
 *               type: integer
 *     
 *     RespuestaFamilias:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PersonaFamilia'
 *         total:
 *           type: integer
 *         estadisticas:
 *           type: object
 *         filtros_aplicados:
 *           type: object
 */

/**
 * @swagger
 * /api/familias:
 *   get:
 *     summary: Consulta consolidada de familias y personas
 *     description: Obtiene información de familias y sus integrantes con filtros múltiples
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parroquia
 *         schema:
 *           type: string
 *         description: Filtrar por parroquia específica
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector o vereda
 *       - in: query
 *         name: sexo
 *         schema:
 *           type: string
 *           enum: [M, F, Masculino, Femenino]
 *         description: Filtrar por sexo
 *       - in: query
 *         name: parentesco
 *         schema:
 *           type: string
 *           enum: [Madre, Padre]
 *         description: Filtrar por parentesco
 *       - in: query
 *         name: sinPadre
 *         schema:
 *           type: boolean
 *         description: Familias sin padre
 *       - in: query
 *         name: sinMadre
 *         schema:
 *           type: boolean
 *         description: Familias sin madre
 *       - in: query
 *         name: edad_min
 *         schema:
 *           type: integer
 *         description: Edad mínima
 *       - in: query
 *         name: edad_max
 *         schema:
 *           type: integer
 *         description: Edad máxima
 *       - in: query
 *         name: incluir_detalles
 *         schema:
 *           type: boolean
 *         description: Incluir estadísticas detalladas
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaFamilias'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamilias);

/**
 * @swagger
 * /api/familias/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de familias
 *     description: Estadísticas generales de todas las familias y personas
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: object
 *                   properties:
 *                     total_personas:
 *                       type: integer
 *                     por_sexo:
 *                       type: object
 *                     por_parentesco:
 *                       type: object
 *                     por_municipio:
 *                       type: object
 *                     distribucion_edades:
 *                       type: object
 *                 total_personas:
 *                   type: integer
 */
router.get('/estadisticas', authMiddleware.authenticateToken, familiasConsolidadoController.obtenerEstadisticas);

/**
 * @swagger
 * /api/familias/madres:
 *   get:
 *     summary: Consultar madres específicamente
 *     description: Lista de todas las madres registradas en el sistema
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parroquia
 *         schema:
 *           type: string
 *         description: Filtrar por parroquia
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: incluir_detalles
 *         schema:
 *           type: boolean
 *         description: Incluir estadísticas
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Madres encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonaFamilia'
 *                 total:
 *                   type: integer
 */
router.get('/madres', authMiddleware.authenticateToken, familiasConsolidadoController.consultarMadres);

/**
 * @swagger
 * /api/familias/padres:
 *   get:
 *     summary: Consultar padres específicamente
 *     description: Lista de todos los padres registrados en el sistema
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parroquia
 *         schema:
 *           type: string
 *         description: Filtrar por parroquia
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: incluir_detalles
 *         schema:
 *           type: boolean
 *         description: Incluir estadísticas
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Padres encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonaFamilia'
 *                 total:
 *                   type: integer
 */
router.get('/padres', authMiddleware.authenticateToken, familiasConsolidadoController.consultarPadres);

/**
 * @swagger
 * /api/familias/sin-padre:
 *   get:
 *     summary: Consultar familias sin padre
 *     description: Lista de familias que no tienen una figura paterna
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Familias sin padre encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                 total:
 *                   type: integer
 */
router.get('/sin-padre', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamiliasSinPadre);

/**
 * @swagger
 * /api/familias/sin-madre:
 *   get:
 *     summary: Consultar familias sin madre
 *     description: Lista de familias que no tienen una figura materna
 *     tags: [Familias Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por municipio
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filtrar por sector
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Familias sin madre encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 datos:
 *                   type: array
 *                 total:
 *                   type: integer
 */
router.get('/sin-madre', authMiddleware.authenticateToken, familiasConsolidadoController.consultarFamiliasSinMadre);

export default router;
