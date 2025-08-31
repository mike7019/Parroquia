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
router.get('/info', reporteController.getInfo);

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
router.post('/excel/familias', authMiddleware.authenticateToken, reporteController.generarExcelFamilias);

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
router.post('/excel/difuntos', authMiddleware.authenticateToken, reporteController.generarExcelDifuntos);

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
router.post('/pdf/difuntos', authMiddleware.authenticateToken, reporteController.generarPDFDifuntos);

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
router.get('/test/excel', authMiddleware.authenticateToken, reporteController.generarTestExcel);

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
router.get('/test/pdf', authMiddleware.authenticateToken, reporteController.generarTestPDF);

export default router;
