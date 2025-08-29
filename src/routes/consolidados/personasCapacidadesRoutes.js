import express from 'express';
import personasCapacidadesController from '../../controllers/consolidados/personasCapacidadesController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PersonaCapacidad:
 *       type: object
 *       properties:
 *         id_personas:
 *           type: integer
 *           description: ID único de la persona
 *           example: 1
 *         primer_nombre:
 *           type: string
 *           description: Primer nombre de la persona
 *           example: "Juan"
 *         segundo_nombre:
 *           type: string
 *           description: Segundo nombre de la persona
 *           example: "Carlos"
 *         primer_apellido:
 *           type: string
 *           description: Primer apellido de la persona
 *           example: "Pérez"
 *         segundo_apellido:
 *           type: string
 *           description: Segundo apellido de la persona
 *           example: "López"
 *         numero_identificacion:
 *           type: string
 *           description: Número de identificación
 *           example: "12345678"
 *         edad:
 *           type: integer
 *           description: Edad de la persona
 *           example: 35
 *         sexo:
 *           type: string
 *           description: Sexo de la persona
 *           example: "Masculino"
 *         nombre_destreza:
 *           type: string
 *           description: Nombre de la destreza/habilidad
 *           example: "Carpintería"
 *         destreza_descripcion:
 *           type: string
 *           description: Descripción de la destreza
 *           example: "Habilidad para trabajar la madera"
 *         nombre_municipio:
 *           type: string
 *           description: Nombre del municipio
 *           example: "Barbacoas"
 *         nombre_sector:
 *           type: string
 *           description: Nombre del sector
 *           example: "Centro"
 *         nombre_vereda:
 *           type: string
 *           description: Nombre de la vereda
 *           example: "El Carmen"
 *         codigo_familia:
 *           type: string
 *           description: Código de la familia
 *           example: "FAM001"
 * 
 *     AnalisisGeografico:
 *       type: object
 *       properties:
 *         analisis_sectores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_sector:
 *                 type: integer
 *                 example: 1
 *               nombre_sector:
 *                 type: string
 *                 example: "Centro"
 *               nombre_municipio:
 *                 type: string
 *                 example: "Barbacoas"
 *               total_familias:
 *                 type: integer
 *                 example: 15
 *               total_personas:
 *                 type: integer
 *                 example: 60
 *               hombres:
 *                 type: integer
 *                 example: 30
 *               mujeres:
 *                 type: integer
 *                 example: 30
 *               edad_promedio:
 *                 type: number
 *                 format: float
 *                 example: 35.5
 *         analisis_veredas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_vereda:
 *                 type: integer
 *                 example: 1
 *               nombre_vereda:
 *                 type: string
 *                 example: "El Carmen"
 *               nombre_sector:
 *                 type: string
 *                 example: "Centro"
 *               nombre_municipio:
 *                 type: string
 *                 example: "Barbacoas"
 *               total_familias:
 *                 type: integer
 *                 example: 8
 *               total_personas:
 *                 type: integer
 *                 example: 32
 *               hombres:
 *                 type: integer
 *                 example: 16
 *               mujeres:
 *                 type: integer
 *                 example: 16
 *         resumen:
 *           type: object
 *           properties:
 *             total_sectores:
 *               type: integer
 *               example: 6
 *             total_veredas:
 *               type: integer
 *               example: 8
 *             sector_mas_poblado:
 *               type: string
 *               example: "Centro"
 *             vereda_mas_poblada:
 *               type: string
 *               example: "El Carmen"
 * 
 *     PersonaProfesion:
 *       type: object
 *       properties:
 *         id_personas:
 *           type: integer
 *           example: 1
 *         primer_nombre:
 *           type: string
 *           example: "María"
 *         segundo_nombre:
 *           type: string
 *           example: "Elena"
 *         primer_apellido:
 *           type: string
 *           example: "García"
 *         segundo_apellido:
 *           type: string
 *           example: "Ruiz"
 *         numero_identificacion:
 *           type: string
 *           example: "87654321"
 *         edad:
 *           type: integer
 *           example: 28
 *         sexo:
 *           type: string
 *           example: "Femenino"
 *         nombre_profesion:
 *           type: string
 *           example: "Enfermera"
 *         profesion_descripcion:
 *           type: string
 *           example: "Profesional en enfermería"
 *         nombre_municipio:
 *           type: string
 *           example: "Barbacoas"
 *         nombre_sector:
 *           type: string
 *           example: "Centro"
 *         nombre_vereda:
 *           type: string
 *           example: "El Carmen"
 * 
 *     ComunidadCultural:
 *       type: object
 *       properties:
 *         id_comunidad_cultural:
 *           type: integer
 *           example: 1
 *         nombre_comunidad:
 *           type: string
 *           example: "Comunidad Afrodescendiente"
 *         descripcion:
 *           type: string
 *           example: "Comunidad de origen afrodescendiente"
 *         total_personas:
 *           type: integer
 *           example: 45
 *         total_familias:
 *           type: integer
 *           example: 12
 *         hombres:
 *           type: integer
 *           example: 22
 *         mujeres:
 *           type: integer
 *           example: 23
 *         edad_promedio:
 *           type: number
 *           format: float
 *           example: 32.5
 * 
 *     FiltrosCapacidades:
 *       type: object
 *       properties:
 *         destrezas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_destreza:
 *                 type: integer
 *                 example: 1
 *               nombre_destreza:
 *                 type: string
 *                 example: "Carpintería"
 *               descripcion:
 *                 type: string
 *                 example: "Habilidad para trabajar la madera"
 *         profesiones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_profesion:
 *                 type: integer
 *                 example: 1
 *               nombre_profesion:
 *                 type: string
 *                 example: "Médico"
 *               descripcion:
 *                 type: string
 *                 example: "Profesional en medicina"
 *         comunidades_culturales:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_comunidad_cultural:
 *                 type: integer
 *                 example: 1
 *               nombre_comunidad:
 *                 type: string
 *                 example: "Comunidad Indígena"
 *               descripcion:
 *                 type: string
 *                 example: "Comunidad de origen indígena"
 *         sectores:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_sector:
 *                 type: integer
 *                 example: 1
 *               nombre_sector:
 *                 type: string
 *                 example: "Centro"
 *               nombre_municipio:
 *                 type: string
 *                 example: "Barbacoas"
 *         veredas:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_vereda:
 *                 type: integer
 *                 example: 1
 *               nombre_vereda:
 *                 type: string
 *                 example: "El Carmen"
 *               nombre_sector:
 *                 type: string
 *                 example: "Centro"
 *               nombre_municipio:
 *                 type: string
 *                 example: "Barbacoas"
 */

/**
 * @swagger
 * /api/personas/capacidades/destrezas:
 *   get:
 *     summary: Consultar personas por destrezas/habilidades
 *     description: Obtiene un listado de personas filtradas por sus destrezas o habilidades específicas, con análisis geográfico y demográfico
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: destreza_id
 *         schema:
 *           type: integer
 *         description: ID específico de la destreza a filtrar
 *         example: 1
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Nombre del municipio (búsqueda parcial)
 *         example: "Barbacoas"
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Nombre del sector (búsqueda parcial)
 *         example: "Centro"
 *       - in: query
 *         name: vereda
 *         schema:
 *           type: string
 *         description: Nombre de la vereda (búsqueda parcial)
 *         example: "El Carmen"
 *       - in: query
 *         name: sexo
 *         schema:
 *           type: string
 *           enum: [Masculino, Femenino]
 *         description: Sexo de la persona
 *         example: "Masculino"
 *       - in: query
 *         name: edad_min
 *         schema:
 *           type: integer
 *         description: Edad mínima
 *         example: 18
 *       - in: query
 *         name: edad_max
 *         schema:
 *           type: integer
 *         description: Edad máxima
 *         example: 65
 *       - in: query
 *         name: incluir_estadisticas
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir estadísticas de destrezas en la respuesta
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de personas por destrezas obtenida exitosamente
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
 *                   example: "Consulta de personas por destrezas realizada exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonaCapacidad'
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 pagina:
 *                   type: integer
 *                   example: 1
 *                 limite:
 *                   type: integer
 *                   example: 50
 *                 total_paginas:
 *                   type: integer
 *                   example: 1
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     distribucion_destrezas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nombre_destreza:
 *                             type: string
 *                             example: "Carpintería"
 *                           descripcion:
 *                             type: string
 *                             example: "Habilidad para trabajar la madera"
 *                           total_personas:
 *                             type: integer
 *                             example: 10
 *                           hombres:
 *                             type: integer
 *                             example: 8
 *                           mujeres:
 *                             type: integer
 *                             example: 2
 *                           edad_promedio:
 *                             type: number
 *                             format: float
 *                             example: 35.5
 *                     total_destrezas_disponibles:
 *                       type: integer
 *                       example: 5
 *                     fecha_consulta:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/destrezas', authMiddleware.authenticateToken, personasCapacidadesController.obtenerPersonasPorDestrezas);

/**
 * @swagger
 * /api/personas/capacidades/analisis-geografico:
 *   get:
 *     summary: Análisis geográfico por sectores y veredas
 *     description: Obtiene un análisis detallado de la distribución de personas por sectores y veredas, incluyendo estadísticas demográficas
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Nombre del municipio para filtrar el análisis
 *         example: "Barbacoas"
 *       - in: query
 *         name: incluir_detalles
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir detalles adicionales en el análisis
 *     responses:
 *       200:
 *         description: Análisis geográfico obtenido exitosamente
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
 *                   example: "Análisis geográfico realizado exitosamente"
 *                 datos:
 *                   $ref: '#/components/schemas/AnalisisGeografico'
 *                 total:
 *                   type: integer
 *                   example: 14
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/analisis-geografico', authMiddleware.authenticateToken, personasCapacidadesController.obtenerAnalisisGeografico);

/**
 * @swagger
 * /api/personas/capacidades/profesiones:
 *   get:
 *     summary: Consultar personas por profesiones
 *     description: Obtiene un listado de personas filtradas por sus profesiones, con estadísticas por tipo de profesión
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profesion_id
 *         schema:
 *           type: integer
 *         description: ID específico de la profesión a filtrar
 *         example: 1
 *       - in: query
 *         name: profesion_nombre
 *         schema:
 *           type: string
 *         description: Nombre de la profesión (búsqueda parcial)
 *         example: "Médico"
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Nombre del municipio (búsqueda parcial)
 *         example: "Barbacoas"
 *       - in: query
 *         name: sexo
 *         schema:
 *           type: string
 *           enum: [Masculino, Femenino]
 *         description: Sexo de la persona
 *         example: "Femenino"
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Lista de personas por profesiones obtenida exitosamente
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
 *                   example: "Consulta de personas por profesiones realizada exitosamente"
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PersonaProfesion'
 *                 estadisticas_profesiones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre_profesion:
 *                         type: string
 *                         example: "Médico"
 *                       total_personas:
 *                         type: integer
 *                         example: 5
 *                       hombres:
 *                         type: integer
 *                         example: 3
 *                       mujeres:
 *                         type: integer
 *                         example: 2
 *                       edad_promedio:
 *                         type: number
 *                         format: float
 *                         example: 35.2
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 pagina:
 *                   type: integer
 *                   example: 1
 *                 limite:
 *                   type: integer
 *                   example: 50
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/profesiones', authMiddleware.authenticateToken, personasCapacidadesController.obtenerPersonasPorProfesiones);

/**
 * @swagger
 * /api/personas/capacidades/comunidades-culturales:
 *   get:
 *     summary: Consultar comunidades culturales
 *     description: Obtiene estadísticas y análisis de las comunidades culturales, con opción de incluir listado detallado de personas
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: comunidad_id
 *         schema:
 *           type: integer
 *         description: ID específico de la comunidad cultural a consultar
 *         example: 1
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Nombre del municipio (búsqueda parcial)
 *         example: "Barbacoas"
 *       - in: query
 *         name: incluir_personas
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir listado de personas de la comunidad (solo si se especifica comunidad_id)
 *     responses:
 *       200:
 *         description: Análisis de comunidades culturales obtenido exitosamente
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
 *                   example: "Consulta de comunidades culturales realizada exitosamente"
 *                 datos:
 *                   type: object
 *                   properties:
 *                     estadisticas_comunidades:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ComunidadCultural'
 *                     personas:
 *                       type: array
 *                       nullable: true
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_personas:
 *                             type: integer
 *                             example: 1
 *                           primer_nombre:
 *                             type: string
 *                             example: "Ana"
 *                           segundo_nombre:
 *                             type: string
 *                             example: "María"
 *                           primer_apellido:
 *                             type: string
 *                             example: "González"
 *                           segundo_apellido:
 *                             type: string
 *                             example: "Pérez"
 *                           numero_identificacion:
 *                             type: string
 *                             example: "12345678"
 *                           edad:
 *                             type: integer
 *                             example: 30
 *                           sexo:
 *                             type: string
 *                             example: "Femenino"
 *                           nombre_municipio:
 *                             type: string
 *                             example: "Barbacoas"
 *                           nombre_sector:
 *                             type: string
 *                             example: "Centro"
 *                           nombre_vereda:
 *                             type: string
 *                             example: "El Carmen"
 *                 total:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/comunidades-culturales', authMiddleware.authenticateToken, personasCapacidadesController.obtenerComunidadesCulturales);

/**
 * @swagger
 * /api/personas/capacidades/filtros:
 *   get:
 *     summary: Obtener filtros disponibles para capacidades
 *     description: Obtiene todos los filtros disponibles para el sistema de capacidades (destrezas, profesiones, comunidades culturales, sectores, veredas)
 *     tags: [Personas y Capacidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filtros disponibles obtenidos exitosamente
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
 *                   example: "Filtros disponibles obtenidos exitosamente"
 *                 datos:
 *                   $ref: '#/components/schemas/FiltrosCapacidades'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/filtros', authMiddleware.authenticateToken, personasCapacidadesController.obtenerFiltrosDisponibles);

export default router;
