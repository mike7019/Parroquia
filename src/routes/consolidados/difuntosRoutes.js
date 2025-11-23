import express from 'express';
import difuntosConsolidadoController from '../../controllers/consolidados/difuntosConsolidadoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DifuntoConsolidado:
 *       type: object
 *       properties:
 *         id_difunto:
 *           type: integer
 *           description: ID único del difunto
 *         nombre:
 *           type: string
 *           description: Nombre completo del difunto
 *         apellido_familiar:
 *           type: string
 *           description: Apellido de la familia
 *         parentesco:
 *           type: string
 *           description: Parentesco inferido (Padre, Madre, Hijo/a, etc.)
 *         fecha_aniversario:
 *           type: string
 *           format: date
 *           description: Fecha de fallecimiento / aniversario
 *         sector:
 *           type: string
 *           description: Sector o vereda de residencia
 *         municipio:
 *           type: string
 *           description: Municipio de residencia
 *         parroquia:
 *           type: string
 *           description: Parroquia de residencia
 *         años_fallecido:
 *           type: integer
 *           description: Años transcurridos desde el fallecimiento
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *     
 *     RespuestaDifuntos:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *         mensaje:
 *           type: string
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DifuntoConsolidado'
 *         total:
 *           type: integer
 *         estadisticas:
 *           type: object
 *         filtros_aplicados:
 *           type: object
 */

/**
 * @swagger
 * /api/difuntos:
 *   get:
 *     summary: Consulta consolidada de difuntos
 *     description: Obtiene registros de difuntos con filtros múltiples incluyendo IDs específicos
 *     tags: [Difuntos Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector
 *       - in: query
 *         name: id_corregimiento
 *         schema:
 *           type: integer
 *         description: ID específico del corregimiento
 *       - in: query
 *         name: id_centro_poblado
 *         schema:
 *           type: integer
 *         description: ID específico del centro poblado
 *       - in: query
 *         name: id_parentesco
 *         schema:
 *           type: integer
 *         description: ID específico del parentesco
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio del rango de búsqueda (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin del rango de búsqueda (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaDifuntos'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware.authenticateToken, difuntosConsolidadoController.consultarDifuntos);

/**
 * @swagger
 * /api/difuntos/aniversarios:
 *   get:
 *     summary: Obtener aniversarios próximos
 *     description: Lista de difuntos con aniversario en los próximos días
 *     tags: [Difuntos Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de días hacia adelante para buscar aniversarios
 *     responses:
 *       200:
 *         description: Aniversarios próximos obtenidos
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
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                       apellido_familiar:
 *                         type: string
 *                       fecha_aniversario:
 *                         type: string
 *                         format: date
 *                       días_hasta_aniversario:
 *                         type: integer
 *                 total:
 *                   type: integer
 */
router.get('/aniversarios', authMiddleware.authenticateToken, difuntosConsolidadoController.obtenerAniversariosProximos);

/**
 * @swagger
 * /api/difuntos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de difuntos
 *     description: Estadísticas generales de todos los difuntos registrados
 *     tags: [Difuntos Consolidado]
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
 *                     por_parentesco:
 *                       type: object
 *                     por_mes:
 *                       type: object
 *                     por_año:
 *                       type: object
 *                     por_municipio:
 *                       type: object
 *                     por_sector:
 *                       type: object
 *                 total_difuntos:
 *                   type: integer
 */
router.get('/estadisticas', authMiddleware.authenticateToken, difuntosConsolidadoController.obtenerEstadisticas);

/**
 * @swagger
 * /api/difuntos/reporte/excel:
 *   get:
 *     summary: Generar reporte Excel de difuntos
 *     description: Genera un archivo Excel con datos consolidados de difuntos, incluye múltiples hojas con análisis detallado
 *     tags: [Difuntos Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia para filtrar
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio para filtrar
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector para filtrar
 *       - in: query
 *         name: parentesco
 *         schema:
 *           type: string
 *           enum: [Madre, Padre, Hijo, Hija, Esposo, Esposa, Hermano, Hermana, Otro]
 *         description: Filtrar por parentesco específico
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio del rango de análisis (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin del rango de análisis (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=reporte_difuntos_consolidado.xlsx
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor al generar el reporte
 */
router.get('/reporte/excel', authMiddleware.authenticateToken, difuntosConsolidadoController.generarReporteExcelCompleto);

/**
 * @swagger
 * /api/difuntos/reporte/pdf:
 *   get:
 *     summary: Generar reporte PDF de difuntos
 *     description: Genera un archivo PDF con datos consolidados de difuntos, incluye resumen estadístico y análisis detallado
 *     tags: [Difuntos Consolidado]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_parroquia
 *         schema:
 *           type: integer
 *         description: ID específico de la parroquia para filtrar
 *       - in: query
 *         name: id_municipio
 *         schema:
 *           type: integer
 *         description: ID específico del municipio para filtrar
 *       - in: query
 *         name: id_sector
 *         schema:
 *           type: integer
 *         description: ID específico del sector para filtrar
 *       - in: query
 *         name: parentesco
 *         schema:
 *           type: string
 *           enum: [Madre, Padre, Hijo, Hija, Esposo, Esposa, Hermano, Hermana, Otro]
 *         description: Filtrar por parentesco específico
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio del rango de análisis (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin del rango de análisis (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename=reporte_difuntos_consolidado.pdf
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor al generar el reporte
 */
router.get('/reporte/pdf', authMiddleware.authenticateToken, difuntosConsolidadoController.generarReportePDFCompleto);

export default router;
