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
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import ReporteController from '../controllers/reporteController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();
const reporteController = new ReporteController();

// ✅ MEJORA: Rate limiting específico para reportes (IPv6 compatible)
const reporteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 reportes por usuario cada 15 minutos
  message: {
    exito: false,
    mensaje: 'Demasiadas solicitudes de reportes. Intente nuevamente en 15 minutos.',
    codigo: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Usar el helper IPv6 para IPs
    return ipKeyGenerator(req);
  }
});

// Rate limiting más restrictivo para reportes grandes (IPv6 compatible)
const reporteGrandeRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutos
  max: 3, // máximo 3 reportes grandes por usuario cada 30 minutos
  message: {
    exito: false,
    mensaje: 'Límite de reportes grandes alcanzado. Intente nuevamente en 30 minutos.',
    codigo: 'LARGE_REPORT_RATE_LIMIT'
  },
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado
    if (req.user?.id) {
      return `user_large:${req.user.id}`;
    }
    // Usar el helper IPv6 para IPs
    return ipKeyGenerator(req);
  }
});

/**
 * @swagger
 * /api/reportes/info:
 *   get:
 *     summary: Obtener información sobre el sistema de reportes
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Información del sistema de reportes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReporteInfo'
 */
router.get('/info', reporteController.obtenerInfoSistema.bind(reporteController));

/**
 * @swagger
 * /api/reportes/excel/familias:
 *   post:
 *     summary: Generar reporte de familias en formato Excel
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReporteExcelRequest'
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/excel/familias', 
  authMiddleware.authenticateToken, 
  reporteRateLimit, // ✅ MEJORA: Rate limiting aplicado
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarFamiliasExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/excel/difuntos:
 *   post:
 *     summary: Generar reporte de difuntos en formato Excel
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReporteExcelRequest'
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/excel/difuntos', 
  authMiddleware.authenticateToken, 
  reporteRateLimit,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarDifuntosExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/pdf/difuntos:
 *   post:
 *     summary: Generar reporte de difuntos en formato PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportePDFRequest'
 *     responses:
 *       200:
 *         description: Archivo PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/pdf/difuntos', 
  authMiddleware.authenticateToken, 
  reporteRateLimit,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarDifuntosPDF.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/test/excel:
 *   get:
 *     summary: Generar reporte de prueba en Excel
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de prueba generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/test/excel', authMiddleware.authenticateToken, reporteController.generarTestExcel.bind(reporteController));

/**
 * @swagger
 * /api/reportes/test/pdf:
 *   get:
 *     summary: Generar reporte de prueba en PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de prueba generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/test/pdf', authMiddleware.authenticateToken, reporteController.generarTestPDF.bind(reporteController));

// Rutas adicionales para compatibilidad (formato alternativo)
/**
 * @swagger
 * /api/reportes/familias/excel:
 *   get:
 *     summary: Generar reporte de familias en Excel (formato alternativo)
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: incluir_estadisticas
 *         schema:
 *           type: boolean
 *         description: Incluir estadísticas en el reporte
 *       - in: query
 *         name: formato_avanzado
 *         schema:
 *           type: boolean
 *         description: Usar formato avanzado
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/familias/excel', 
  authMiddleware.authenticateToken, 
  reporteRateLimit,
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarFamiliasExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/difuntos/pdf:
 *   get:
 *     summary: Generar reporte de difuntos en PDF (formato alternativo)
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: incluir_estadisticas
 *         schema:
 *           type: boolean
 *         description: Incluir estadísticas en el reporte
 *       - in: query
 *         name: formato_detallado
 *         schema:
 *           type: boolean
 *         description: Usar formato detallado
 *     responses:
 *       200:
 *         description: Archivo PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/difuntos/pdf', authMiddleware.authenticateToken, reporteController.generarDifuntosPDF.bind(reporteController));

/**
 * @swagger
 * /api/reportes/download/familias-excel:
 *   post:
 *     summary: Generar y guardar reporte de familias Excel en servidor
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReporteExcelRequest'
 *     responses:
 *       200:
 *         description: Reporte generado y guardado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exito:
 *                   type: boolean
 *                 mensaje:
 *                   type: string
 *                 archivo:
 *                   type: string
 *                 ruta_descarga:
 *                   type: string
 */
router.post('/download/familias-excel', 
  authMiddleware.authenticateToken, 
  reporteGrandeRateLimit, // Rate limit más restrictivo para archivos guardados
  reporteController.validarSolicitudReporte.bind(reporteController),
  reporteController.generarYGuardarFamiliasExcel.bind(reporteController)
);

/**
 * @swagger
 * /api/reportes/download/file/{filename}:
 *   get:
 *     summary: Descargar archivo de reporte generado
 *     tags: [Reportes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo a descargar
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/download/file/:filename', authMiddleware.authenticateToken, reporteController.descargarArchivo.bind(reporteController));

export default router;
