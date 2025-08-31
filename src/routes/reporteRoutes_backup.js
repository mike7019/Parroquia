/**
 * @swagger
 * components:
 *   schemas:
 *     ReporteInfo:
 *       type: object
 *       properties:
 *         version:
 *           type: string
 *         formatos:
 *           type: array
 *           items:
 *             type: string
 *         descripcion:
 *           type: string
 * 
 *     ReporteExcelRequest:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [familias, difuntos, estadisticas]
 *         filtros:
 *           type: object
 *           properties:
 *             municipio_id:
 *               type: integer
 *             departamento_id:
 *               type: integer
 *             sector:
 *               type: string
 *             fecha_inicio:
 *               type: string
 *               format: date
 *             fecha_fin:
 *               type: string
 *               format: date
 * 
 *     ReportePDFRequest:
 *       type: object
 *       properties:
 *         tipo:
 *           type: string
 *           enum: [difuntos, ceremonial, estadisticas]
 *         filtros:
 *           type: object
 *           properties:
 *             municipio_id:
 *               type: integer
 *             departamento_id:
 *               type: integer
 *             sector:
 *               type: string
 *             fecha_inicio:
 *               type: string
 *               format: date
 *             fecha_fin:
 *               type: string
 *               format: date
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import express from 'express';
import { reporteController } from '../controllers/reporteController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/reportes/info:
 *       in: query
 *       name: limite
 *       schema:
 *         type: integer
 *         maximum: 50000
 *       description: Límite de registros a incluir
 * 
 * tags:
 *   - name: Reportes
 *     description: Generación de reportes en Excel y PDF
 */

import express from 'express';
import ReporteController from '../controllers/reporteController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();
const reporteController = new ReporteController();

/**
 * @swagger
 * /api/reportes/familias/excel:
 *   get:
 *     summary: Genera reporte de familias en Excel
 *     description: Crea un archivo Excel con el listado de familias y sus datos completos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/municipio'
 *       - $ref: '#/components/parameters/sector'
 *       - in: query
 *         name: vereda
 *         schema:
 *           type: string
 *         description: Filtrar por vereda específica
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, todos]
 *         description: Estado de la familia
 *       - in: query
 *         name: tiene_telefono
 *         schema:
 *           type: boolean
 *         description: Filtrar familias con/sin teléfono
 *       - in: query
 *         name: incluir_estadisticas
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir hoja de estadísticas
 *       - in: query
 *         name: formato_avanzado
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Usar formato avanzado con gráficos
 *       - $ref: '#/components/parameters/fecha_desde'
 *       - $ref: '#/components/parameters/fecha_hasta'
 *       - $ref: '#/components/parameters/limite'
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
 *             description: Nombre del archivo para descarga
 *             schema:
 *               type: string
 *           X-Total-Registros:
 *             description: Cantidad total de registros en el reporte
 *             schema:
 *               type: integer
 *           X-Generado-En:
 *             description: Timestamp de generación
 *             schema:
 *               type: string
 *       404:
 *         description: No se encontraron familias con los filtros especificados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: false
 *                 mensaje:
 *                   type: string
 *                   example: "No se encontraron familias con los filtros especificados"
 *                 codigo:
 *                   type: string
 *                   example: "NO_DATA_FOUND"
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/familias/excel', 
  authMiddleware.authenticateToken,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarFamiliasExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/difuntos/pdf:
 *   get:
 *     summary: Genera reporte de difuntos en PDF
 *     description: Crea un documento PDF con el registro de personas fallecidas
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/municipio'
 *       - in: query
 *         name: apellido_familiar
 *         schema:
 *           type: string
 *         description: Filtrar por apellido familiar
 *       - in: query
 *         name: mes_aniversario
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mes del aniversario (1-12)
 *       - in: query
 *         name: fecha_aniversario
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica de aniversario
 *       - in: query
 *         name: parentesco
 *         schema:
 *           type: string
 *         description: Tipo de parentesco
 *       - in: query
 *         name: ceremonial
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Generar formato ceremonial para aniversarios
 *       - in: query
 *         name: incluir_versiculos
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir versículos bíblicos en formato ceremonial
 *       - $ref: '#/components/parameters/fecha_desde'
 *       - $ref: '#/components/parameters/fecha_hasta'
 *       - $ref: '#/components/parameters/limite'
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
 *             description: Nombre del archivo para descarga
 *             schema:
 *               type: string
 *           X-Total-Registros:
 *             description: Cantidad total de registros en el reporte
 *             schema:
 *               type: integer
 *           X-Tipo-Reporte:
 *             description: Tipo de reporte generado (standard o ceremonial)
 *             schema:
 *               type: string
 *           X-Generado-En:
 *             description: Timestamp de generación
 *             schema:
 *               type: string
 *       404:
 *         description: No se encontraron difuntos con los filtros especificados
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/difuntos/pdf',
  authMiddleware.authenticateToken,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarDifuntosPDF.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/estadisticas/excel:
 *   get:
 *     summary: Genera reporte estadístico en Excel
 *     description: Crea un archivo Excel con estadísticas y análisis de datos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [general, familias, difuntos]
 *           default: general
 *         description: Tipo de estadísticas a generar
 *       - $ref: '#/components/parameters/municipio'
 *       - $ref: '#/components/parameters/sector'
 *       - $ref: '#/components/parameters/fecha_desde'
 *       - $ref: '#/components/parameters/fecha_hasta'
 *     responses:
 *       200:
 *         description: Archivo Excel estadístico generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Nombre del archivo para descarga
 *             schema:
 *               type: string
 *           X-Tipo-Estadisticas:
 *             description: Tipo de estadísticas generadas
 *             schema:
 *               type: string
 *           X-Generado-En:
 *             description: Timestamp de generación
 *             schema:
 *               type: string
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas/excel',
  authMiddleware.authenticateToken,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarEstadisticasExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/info:
 *   get:
 *     summary: Obtiene información del sistema de reportes
 *     description: Retorna configuración, tipos disponibles y estadísticas del sistema
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del sistema obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Información del sistema de reportes"
 *                 datos:
 *                   $ref: '#/components/schemas/ReporteInfo'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/info',
  authMiddleware.authenticateToken,
  reporteController.obtenerInfoSistema.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/cache/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas del cache de reportes
 *     description: Retorna información sobre el estado actual del cache
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del cache obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Estadísticas del cache de reportes"
 *                 datos:
 *                   $ref: '#/components/schemas/ReporteEstadisticas'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/cache/estadisticas',
  authMiddleware.authenticateToken,
  reporteController.obtenerEstadisticasCache.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/cache:
 *   delete:
 *     summary: Limpia el cache de reportes
 *     description: Elimina todos los reportes almacenados en cache
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Cache de reportes limpiado exitosamente"
 *                 datos:
 *                   type: object
 *                   properties:
 *                     antes:
 *                       $ref: '#/components/schemas/ReporteEstadisticas'
 *                     despues:
 *                       $ref: '#/components/schemas/ReporteEstadisticas'
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/cache',
  authMiddleware.authenticateToken,
  reporteController.limpiarCache.bind(reporteController)
);

export default router;
