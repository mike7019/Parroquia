import express from 'express';
import parroquiasConsolidadoController from '../../controllers/consolidados/parroquiasConsolidadoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ParroquiaInfo:
 *       type: object
 *       properties:
 *         id_parroquia:
 *           type: integer
 *           description: ID único de la parroquia
 *           example: 1
 *         nombre_parroquia:
 *           type: string
 *           description: Nombre de la parroquia
 *           example: "San José"
 *         nombre_municipio:
 *           type: string
 *           description: Nombre del municipio al que pertenece
 *           example: "Medellín"
 *         nombre_departamento:
 *           type: string
 *           description: Nombre del departamento
 *           example: "Antioquia"
 *         total_familias:
 *           type: integer
 *           description: Número total de familias registradas
 *           example: 150
 *         total_personas:
 *           type: integer
 *           description: Número total de personas registradas
 *           example: 485
 *         estadisticas:
 *           type: object
 *           description: Estadísticas detalladas de infraestructura
 *           properties:
 *             promedio_miembros_familia:
 *               type: number
 *               format: float
 *               description: Promedio de miembros por familia
 *               example: 3.23
 *             tipos_vivienda_principales:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "Casa"
 *                   total:
 *                     type: integer
 *                     example: 80
 *             infraestructura:
 *               type: object
 *               properties:
 *                 tipos_vivienda:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo_vivienda:
 *                         type: string
 *                         example: "Casa"
 *                       total_familias:
 *                         type: integer
 *                         example: 80
 *                 sistemas_acueducto:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sistema_acueducto:
 *                         type: string
 *                         example: "Acueducto Público"
 *                       total_familias:
 *                         type: integer
 *                         example: 100
 *                 aguas_residuales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo_aguas_residuales:
 *                         type: string
 *                         example: "Alcantarillado"
 *                       total_familias:
 *                         type: integer
 *                         example: 90
 *                 disposicion_basura:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo_disposicion_basura:
 *                         type: string
 *                         example: "Recolección Municipal"
 *                       total_familias:
 *                         type: integer
 *                         example: 120
 *
 *     ParroquiasResponse:
 *       type: object
 *       properties:
 *         exito:
 *           type: boolean
 *           example: true
 *         mensaje:
 *           type: string
 *           example: "Consulta de parroquias completada. 15 registros encontrados."
 *         datos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ParroquiaInfo'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total de registros disponibles
 *               example: 15
 *             pagina:
 *               type: integer
 *               description: Página actual
 *               example: 1
 *             limite:
 *               type: integer
 *               description: Registros por página
 *               example: 50
 *             total_paginas:
 *               type: integer
 *               description: Total de páginas disponibles
 *               example: 1
 *             tiene_siguiente:
 *               type: boolean
 *               description: Indica si hay página siguiente
 *               example: false
 *             tiene_anterior:
 *               type: boolean
 *               description: Indica si hay página anterior
 *               example: false
 *         filtros_aplicados:
 *           type: object
 *           description: Filtros que se aplicaron en la consulta
 *           properties:
 *             municipio:
 *               type: string
 *               example: "Medellín"
 *             tipo_vivienda:
 *               type: string
 *               example: "Casa"
 *
 *     EstadisticasConsolidadas:
 *       type: object
 *       properties:
 *         resumen_general:
 *           type: object
 *           properties:
 *             total_parroquias:
 *               type: integer
 *               example: 45
 *             total_municipios:
 *               type: integer
 *               example: 12
 *             total_departamentos:
 *               type: integer
 *               example: 3
 *             total_familias:
 *               type: integer
 *               example: 2150
 *             total_personas:
 *               type: integer
 *               example: 7890
 *         top_parroquias:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               parroquia:
 *                 type: string
 *                 example: "San José"
 *               municipio:
 *                 type: string
 *                 example: "Medellín"
 *               total_familias:
 *                 type: integer
 *                 example: 250
 *         distribucion_tipos_vivienda:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo_vivienda:
 *                 type: string
 *                 example: "Casa"
 *               total_familias:
 *                 type: integer
 *                 example: 1200
 *               porcentaje:
 *                 type: number
 *                 format: float
 *                 example: 55.81
 *         fecha_consulta:
 *           type: string
 *           format: date-time
 *           example: "2025-08-28T10:30:00.000Z"
 *
 *     FiltrosDisponibles:
 *       type: object
 *       properties:
 *         tipos_vivienda:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *                 example: "Casa"
 *               etiqueta:
 *                 type: string
 *                 example: "Casa"
 *         sistemas_acueducto:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *                 example: "Acueducto Público"
 *               etiqueta:
 *                 type: string
 *                 example: "Acueducto Público"
 *         tipos_aguas_residuales:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *                 example: "Alcantarillado"
 *               etiqueta:
 *                 type: string
 *                 example: "Alcantarillado"
 *         tipos_disposicion_basura:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               valor:
 *                 type: string
 *                 example: "Recolección Municipal"
 *               etiqueta:
 *                 type: string
 *                 example: "Recolección Municipal"
 *         nota:
 *           type: string
 *           example: "Valores disponibles para usar en los filtros de consulta"
 */

/**
 * @swagger
 * /api/parroquias:
 *   get:
 *     summary: 🏡 Consultar parroquias con información de infraestructura
 *     description: |
 *       **Endpoint consolidado para consultas de parroquias e infraestructura.**
 *       
 *       Consolida las siguientes consultas originales:
 *       - Lista de parroquias con estadísticas
 *       - Tipos de vivienda por parroquia 
 *       - Sistemas de acueducto disponibles
 *       - Tratamiento de aguas residuales
 *       - Manejo de disposición de basura
 *       
 *       **Características:**
 *       - ✅ Paginación automática (máximo 100 por página)
 *       - ✅ Filtros múltiples combinables
 *       - ✅ Estadísticas automáticas por parroquia
 *       - ✅ Información de infraestructura detallada
 *       - ✅ Conteo de familias y personas por parroquia
 *       
 *       **Casos de uso:**
 *       - Análisis demográfico por parroquia
 *       - Planificación de infraestructura
 *       - Reportes de vivienda y servicios públicos
 *       - Estudios socioeconómicos parroquiales
 *     tags:
 *       - Parroquias Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de municipio (búsqueda parcial)
 *         example: Medellín
 *       - in: query
 *         name: parroquia
 *         schema:
 *           type: string
 *         description: Filtrar por nombre de parroquia (búsqueda parcial)
 *         example: San José
 *       - in: query
 *         name: tipo_vivienda
 *         schema:
 *           type: string
 *         description: Filtrar familias por tipo de vivienda
 *         example: Casa
 *       - in: query
 *         name: sistema_acueducto
 *         schema:
 *           type: string
 *         description: Filtrar familias por sistema de acueducto
 *         example: Acueducto Público
 *       - in: query
 *         name: tipo_aguas_residuales
 *         schema:
 *           type: string
 *         description: Filtrar familias por tratamiento de aguas residuales
 *         example: Alcantarillado
 *       - in: query
 *         name: disposicion_basura
 *         schema:
 *           type: string
 *         description: Filtrar familias por disposición de basura
 *         example: Recolección Municipal
 *       - in: query
 *         name: incluir_estadisticas
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir estadísticas detalladas por parroquia
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página a consultar
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Cantidad de registros por página
 *     responses:
 *       200:
 *         description: Consulta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParroquiasResponse'
 *             examples:
 *               consulta_basica:
 *                 summary: Consulta básica de parroquias
 *                 value:
 *                   exito: true
 *                   mensaje: "Consulta de parroquias completada. 15 registros encontrados."
 *                   datos:
 *                     - id_parroquia: 1
 *                       nombre_parroquia: "San José"
 *                       nombre_municipio: "Medellín"
 *                       nombre_departamento: "Antioquia"
 *                       total_familias: 150
 *                       total_personas: 485
 *                       estadisticas:
 *                         promedio_miembros_familia: 3.23
 *                         tipos_vivienda_principales:
 *                           - nombre: "Casa"
 *                             total: 80
 *                           - nombre: "Apartamento"
 *                             total: 50
 *                   meta:
 *                     total: 15
 *                     pagina: 1
 *                     limite: 50
 *                     total_paginas: 1
 *                     tiene_siguiente: false
 *                     tiene_anterior: false
 *               consulta_con_filtros:
 *                 summary: Consulta con filtros de infraestructura
 *                 value:
 *                   exito: true
 *                   mensaje: "Consulta de parroquias completada. 8 registros encontrados."
 *                   datos:
 *                     - id_parroquia: 2
 *                       nombre_parroquia: "Santa María"
 *                       nombre_municipio: "Medellín"
 *                       total_familias: 95
 *                       total_personas: 320
 *                   filtros_aplicados:
 *                     municipio: "Medellín"
 *                     tipo_vivienda: "Casa"
 *                     sistema_acueducto: "Acueducto Público"
 *       400:
 *         description: Error en parámetros de consulta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "El límite máximo por página es 100"
 *               code: "LIMITE_EXCEDIDO"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Error interno del servidor al consultar parroquias"
 *               code: "CONSULTA_PARROQUIAS_ERROR"
 */
router.get('/', authMiddleware.authenticateToken, parroquiasConsolidadoController.obtenerParroquias);

/**
 * @swagger
 * /api/parroquias/estadisticas:
 *   get:
 *     summary: 📊 Estadísticas consolidadas del sistema de parroquias
 *     description: |
 *       **Obtiene estadísticas generales y consolidadas de todo el sistema de parroquias.**
 *       
 *       **Información incluida:**
 *       - ✅ Resumen general (totales de parroquias, municipios, familias, personas)
 *       - ✅ Top 10 parroquias por número de familias
 *       - ✅ Distribución porcentual por tipos de vivienda
 *       - ✅ Fecha y hora de la consulta
 *       
 *       **Casos de uso:**
 *       - Dashboards administrativos
 *       - Reportes ejecutivos
 *       - Análisis demográfico general
 *       - Planificación estratégica
 *     tags:
 *       - Parroquias Consolidado
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
 *                 exito:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Estadísticas consolidadas obtenidas exitosamente"
 *                 datos:
 *                   $ref: '#/components/schemas/EstadisticasConsolidadas'
 *             example:
 *               exito: true
 *               mensaje: "Estadísticas consolidadas obtenidas exitosamente"
 *               datos:
 *                 resumen_general:
 *                   total_parroquias: 45
 *                   total_municipios: 12
 *                   total_departamentos: 3
 *                   total_familias: 2150
 *                   total_personas: 7890
 *                 top_parroquias:
 *                   - parroquia: "San José"
 *                     municipio: "Medellín"
 *                     total_familias: 250
 *                   - parroquia: "Santa María"
 *                     municipio: "Bello"
 *                     total_familias: 180
 *                 distribucion_tipos_vivienda:
 *                   - tipo_vivienda: "Casa"
 *                     total_familias: 1200
 *                     porcentaje: 55.81
 *                   - tipo_vivienda: "Apartamento"
 *                     total_familias: 680
 *                     porcentaje: 31.63
 *                 fecha_consulta: "2025-08-28T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/estadisticas', authMiddleware.authenticateToken, parroquiasConsolidadoController.obtenerEstadisticasConsolidadas);

/**
 * @swagger
 * /api/parroquias/filtros:
 *   get:
 *     summary: 🔧 Obtener filtros disponibles para consultas
 *     description: |
 *       **Obtiene todas las opciones disponibles para filtrar consultas de parroquias.**
 *       
 *       Retorna listas de valores únicos disponibles en:
 *       - ✅ Tipos de vivienda activos
 *       - ✅ Sistemas de acueducto disponibles
 *       - ✅ Tipos de tratamiento de aguas residuales
 *       - ✅ Métodos de disposición de basura
 *       
 *       **Útil para:**
 *       - Construir interfaces de filtrado dinámicas
 *       - Validar parámetros de consulta
 *       - Mostrar opciones disponibles a usuarios
 *     tags:
 *       - Parroquias Consolidado
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
 *                   $ref: '#/components/schemas/FiltrosDisponibles'
 *             example:
 *               exito: true
 *               mensaje: "Filtros disponibles obtenidos exitosamente"
 *               datos:
 *                 tipos_vivienda:
 *                   - valor: "Casa"
 *                     etiqueta: "Casa"
 *                   - valor: "Apartamento"
 *                     etiqueta: "Apartamento"
 *                   - valor: "Rancho"
 *                     etiqueta: "Rancho"
 *                 sistemas_acueducto:
 *                   - valor: "Acueducto Público"
 *                     etiqueta: "Acueducto Público"
 *                   - valor: "Pozo"
 *                     etiqueta: "Pozo"
 *                   - valor: "Río"
 *                     etiqueta: "Río"
 *                 nota: "Valores disponibles para usar en los filtros de consulta"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/filtros', authMiddleware.authenticateToken, parroquiasConsolidadoController.obtenerFiltrosDisponibles);

/**
 * @swagger
 * /api/parroquias/{id}:
 *   get:
 *     summary: 🔍 Obtener información detallada de una parroquia específica
 *     description: |
 *       **Consulta información completa de una parroquia incluyendo estadísticas detalladas.**
 *       
 *       **Información incluida:**
 *       - ✅ Datos básicos de la parroquia (nombre, municipio, departamento)
 *       - ✅ Estadísticas de familias y personas
 *       - ✅ Promedio de miembros por familia
 *       - ✅ Top 3 tipos de vivienda más comunes
 *       - ✅ Distribución completa de infraestructura:
 *         - Tipos de vivienda con conteos
 *         - Sistemas de acueducto utilizados
 *         - Tratamiento de aguas residuales
 *         - Métodos de disposición de basura
 *       
 *       **Casos de uso:**
 *       - Vista detallada de parroquia específica
 *       - Análisis profundo de infraestructura local
 *       - Reportes parroquiales específicos
 *       - Planificación de servicios focalizados
 *     tags:
 *       - Parroquias Consolidado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID único de la parroquia a consultar
 *         example: 1
 *     responses:
 *       200:
 *         description: Información de parroquia obtenida exitosamente
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
 *                   example: "Información de parroquia obtenida exitosamente"
 *                 datos:
 *                   $ref: '#/components/schemas/ParroquiaInfo'
 *             example:
 *               exito: true
 *               mensaje: "Información de parroquia obtenida exitosamente"
 *               datos:
 *                 id_parroquia: 1
 *                 nombre_parroquia: "San José"
 *                 id_municipio: 5
 *                 nombre_municipio: "Medellín"
 *                 id_departamento: 1
 *                 nombre_departamento: "Antioquia"
 *                 estadisticas:
 *                   total_familias: 150
 *                   total_personas: 485
 *                   promedio_miembros_familia: 3.23
 *                   tipos_vivienda_principales:
 *                     - nombre: "Casa"
 *                       total: 80
 *                     - nombre: "Apartamento"
 *                       total: 50
 *                     - nombre: "Rancho"
 *                       total: 20
 *                   infraestructura:
 *                     tipos_vivienda:
 *                       - tipo_vivienda: "Casa"
 *                         total_familias: 80
 *                       - tipo_vivienda: "Apartamento"
 *                         total_familias: 50
 *                     sistemas_acueducto:
 *                       - sistema_acueducto: "Acueducto Público"
 *                         total_familias: 100
 *                       - sistema_acueducto: "Pozo"
 *                         total_familias: 30
 *                     aguas_residuales:
 *                       - tipo_aguas_residuales: "Alcantarillado"
 *                         total_familias: 90
 *                       - tipo_aguas_residuales: "Pozo Séptico"
 *                         total_familias: 40
 *                     disposicion_basura:
 *                       - tipo_disposicion_basura: "Recolección Municipal"
 *                         total_familias: 120
 *                       - tipo_disposicion_basura: "Quema"
 *                         total_familias: 20
 *       400:
 *         description: ID de parroquia inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "ID de parroquia inválido"
 *               code: "ID_INVALIDO"
 *       404:
 *         description: Parroquia no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               message: "Parroquia con ID 999 no encontrada"
 *               code: "PARROQUIA_NO_ENCONTRADA"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authMiddleware.authenticateToken, parroquiasConsolidadoController.obtenerParroquiaPorId);

export default router;
