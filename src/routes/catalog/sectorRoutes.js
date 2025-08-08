import express from 'express';
import sectorController from '../../controllers/catalog/sectorController.js';
import authMiddleware from '../../middlewares/auth.js';
const { authenticateToken } = authMiddleware;

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/catalog/sectors:
 *   post:
 *     summary: Create a new sector
 *     description: |
 *       Crea un nuevo sector que puede estar relacionado con una o varias veredas.
 *       
 *       **RELACIONES:**
 *       - Un sector puede tener múltiples veredas asociadas
 *       - Las veredas pertenecen a municipios
 *       - Al crear un sector, opcionalmente se pueden asignar veredas existentes
 *       
 *       **CAMPOS OBLIGATORIOS:**
 *       - `nombre`: Nombre único del sector
 *       
 *       **CAMPOS OPCIONALES:**
 *       - `descripcion`: Descripción detallada del sector
 *       - `codigo`: Código único identificador (máx. 20 caracteres)
 *       - `estado`: Estado del sector ('activo' o 'inactivo', por defecto 'activo')
 *       - `veredas_ids`: Array de IDs de veredas a asociar con el sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSectorRequest'
 *           examples:
 *             sector_simple:
 *               summary: Sector básico (solo nombre)
 *               value:
 *                 nombre: "Sector San José"
 *             sector_completo:
 *               summary: Sector completo con veredas
 *               value:
 *                 nombre: "Sector San José"
 *                 descripcion: "Sector ubicado en la zona central de la parroquia"
 *                 codigo: "SEC001"
 *                 estado: "activo"
 *                 veredas_ids: [1, 2, 3]
 *             sector_sin_veredas:
 *               summary: Sector sin veredas asignadas
 *               value:
 *                 nombre: "Sector Rural Norte"
 *                 descripcion: "Sector que agrupa las zonas rurales del norte"
 *                 codigo: "SEC002"
 *                 estado: "activo"
 *     responses:
 *       201:
 *         description: Sector created successfully
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
 *                   example: "Sector created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Sector'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nombre_requerido:
 *                 summary: Nombre es obligatorio
 *                 value:
 *                   success: false
 *                   message: "El nombre del sector es obligatorio"
 *               veredas_invalidas:
 *                 summary: Veredas no encontradas
 *                 value:
 *                   success: false
 *                   message: "Una o más veredas especificadas no existen"
 *       409:
 *         description: Sector name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Ya existe un sector con ese nombre"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', sectorController.createSector);

/**
 * @swagger
 * /api/catalog/sectors:
 *   get:
 *     summary: Get all sectors with pagination and relationships
 *     description: |
 *       Obtiene todos los sectores con paginación y opcionalmente incluye las relaciones con veredas y municipios.
 *       
 *       **RELACIONES INCLUIDAS:**
 *       - Veredas asociadas al sector
 *       - Municipios a través de las veredas
 *       
 *       **FILTROS DISPONIBLES:**
 *       - `search`: Buscar por nombre del sector
 *       - `estado`: Filtrar por estado (activo/inactivo)
 *       - `municipio_id`: Filtrar sectores que contengan veredas de un municipio específico
 *       - `include_veredas`: Incluir información de veredas relacionadas (true/false)
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Elementos por página (máximo 100)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar por nombre
 *         example: "San José"
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo]
 *         description: Filtrar por estado del sector
 *         example: "activo"
 *       - in: query
 *         name: municipio_id
 *         schema:
 *           type: integer
 *         description: Filtrar sectores que contengan veredas del municipio especificado
 *         example: 1
 *       - in: query
 *         name: include_veredas
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir información detallada de veredas relacionadas
 *         example: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: nombre
 *           enum: [nombre, created_at, updated_at]
 *         description: Campo por el cual ordenar los resultados
 *         example: "nombre"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden de los resultados
 *         example: "ASC"
 *     responses:
 *       200:
 *         description: Sectores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sectores:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sector'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_sectores:
 *                           type: integer
 *                           example: 15
 *                         sectores_activos:
 *                           type: integer
 *                           example: 12
 *                         sectores_inactivos:
 *                           type: integer
 *                           example: 3
 *                         total_veredas_asignadas:
 *                           type: integer
 *                           example: 45
 *             examples:
 *               sectores_basicos:
 *                 summary: Respuesta básica sin relaciones
 *                 value:
 *                   success: true
 *                   data:
 *                     sectores:
 *                       - id_sector: 1
 *                         nombre: "Sector San José"
 *                         estado: "activo"
 *                       - id_sector: 2
 *                         nombre: "Sector Rural Norte"
 *                         estado: "activo"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 2
 *                       totalPages: 1
 *               sectores_con_veredas:
 *                 summary: Respuesta con veredas incluidas
 *                 value:
 *                   success: true
 *                   data:
 *                     sectores:
 *                       - id_sector: 1
 *                         nombre: "Sector San José"
 *                         estado: "activo"
 *                         veredas:
 *                           - id_vereda: 1
 *                             nombre: "Centro"
 *                             municipio:
 *                               id_municipio: 1
 *                               nombre_municipio: "Bogotá"
 *       500:
 *         description: Error del servidor
 */
router.get('/', sectorController.getAllSectors);

/**
 * @swagger
 * /api/catalog/sectors/relationships/overview:
 *   get:
 *     summary: Get sectors relationships overview
 *     description: |
 *       Obtiene un resumen completo de las relaciones entre sectores, veredas y municipios.
 *       
 *       **INFORMACIÓN PROPORCIONADA:**
 *       - Listado de todos los sectores con sus veredas
 *       - Agrupación por municipios
 *       - Estadísticas generales de distribución territorial
 *       - Sectores sin veredas asignadas
 *       - Veredas sin sector asignado
 *       
 *       **CASOS DE USO:**
 *       - Análisis territorial completo
 *       - Identificación de inconsistencias en asignaciones
 *       - Reportes gerenciales de cobertura geográfica
 *       - Planificación de redistribución sectorial
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: municipio_id
 *         schema:
 *           type: integer
 *         description: Filtrar por municipio específico
 *         example: 1
 *       - in: query
 *         name: include_empty_sectors
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir sectores sin veredas asignadas
 *       - in: query
 *         name: include_unassigned_veredas
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir veredas sin sector asignado
 *     responses:
 *       200:
 *         description: Resumen de relaciones obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_sectores:
 *                           type: integer
 *                           example: 8
 *                         sectores_con_veredas:
 *                           type: integer
 *                           example: 6
 *                         sectores_sin_veredas:
 *                           type: integer
 *                           example: 2
 *                         total_veredas:
 *                           type: integer
 *                           example: 25
 *                         veredas_asignadas:
 *                           type: integer
 *                           example: 20
 *                         veredas_sin_asignar:
 *                           type: integer
 *                           example: 5
 *                         total_municipios:
 *                           type: integer
 *                           example: 3
 *                     sectores_por_municipio:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           municipio:
 *                             type: object
 *                             properties:
 *                               id_municipio:
 *                                 type: integer
 *                               nombre_municipio:
 *                                 type: string
 *                           sectores:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id_sector:
 *                                   type: integer
 *                                 nombre:
 *                                   type: string
 *                                 veredas_count:
 *                                   type: integer
 *                                 veredas:
 *                                   type: array
 *                                   items:
 *                                     $ref: '#/components/schemas/VeredaSimple'
 *                     sectores_sin_veredas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_sector:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           estado:
 *                             type: string
 *                     veredas_sin_sector:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/VeredaSimple'
 *                           - type: object
 *                             properties:
 *                               sugerencias_sector:
 *                                 type: array
 *                                 description: Sectores sugeridos basados en proximidad geográfica
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id_sector:
 *                                       type: integer
 *                                     nombre:
 *                                       type: string
 *                                     municipios_compatibles:
 *                                       type: boolean
 *       500:
 *         description: Error del servidor
 */
// TODO: Implementar endpoint de relaciones territoriales
// router.get('/relationships/overview', sectorController.getRelationshipsOverview);

/**
 * @swagger
 * /api/catalog/sectors/search:
 *   get:
 *     summary: Search sectors
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum results
 *     responses:
 *       200:
 *         description: Search completed successfully
 *       400:
 *         description: Search term too short
 *       500:
 *         description: Server error
 */
router.get('/search', sectorController.getAllSectors);

/**
 * @swagger
 * /api/catalog/sectors/statistics:
 *   get:
 *     summary: Get sector statistics
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sectorId
 *         schema:
 *           type: string
 *         description: Get statistics for specific sector
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/statistics', sectorController.getSectorsStats);

/**
 * @swagger
 * /api/catalog/sectors/coordinator/{coordinatorId}:
 *   get:
 *     summary: Get sectors by coordinator
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coordinatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Coordinator user ID
 *     responses:
 *       200:
 *         description: Coordinator sectors retrieved successfully
 *       500:
 *         description: Server error
 */
// router.get('/coordinator/:coordinatorId', sectorController.getSectorsByCoordinator);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   get:
 *     summary: Get sector by ID with relationships
 *     description: |
 *       Obtiene un sector específico por su ID, incluyendo todas sus relaciones con veredas y municipios.
 *       
 *       **INFORMACIÓN INCLUIDA:**
 *       - Datos básicos del sector (id, nombre, descripción, código, estado)
 *       - Lista de veredas asociadas al sector
 *       - Información del municipio de cada vereda
 *       - Estadísticas del sector (número de veredas, familias, etc.)
 *       
 *       **CASOS DE USO:**
 *       - Visualizar detalles completos de un sector
 *       - Obtener veredas asociadas para gestión territorial
 *       - Consultar información para reportes geográficos
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del sector
 *         example: 1
 *       - in: query
 *         name: include_statistics
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir estadísticas del sector (familias, personas, etc.)
 *         example: true
 *     responses:
 *       200:
 *         description: Sector obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Sector'
 *                     - type: object
 *                       properties:
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             total_veredas:
 *                               type: integer
 *                               example: 5
 *                             total_familias:
 *                               type: integer
 *                               example: 120
 *                             total_personas:
 *                               type: integer
 *                               example: 456
 *                             municipios_involucrados:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id_municipio:
 *                                     type: integer
 *                                   nombre_municipio:
 *                                     type: string
 *                                   veredas_count:
 *                                     type: integer
 *             examples:
 *               sector_basico:
 *                 summary: Sector sin estadísticas
 *                 value:
 *                   success: true
 *                   data:
 *                     id_sector: 1
 *                     nombre: "Sector San José"
 *                     descripcion: "Sector ubicado en la zona central"
 *                     codigo: "SEC001"
 *                     estado: "activo"
 *                     veredas:
 *                       - id_vereda: 1
 *                         nombre: "Centro"
 *                         codigo_vereda: "V001"
 *                         municipio:
 *                           id_municipio: 1
 *                           nombre_municipio: "Bogotá"
 *               sector_con_estadisticas:
 *                 summary: Sector con estadísticas incluidas
 *                 value:
 *                   success: true
 *                   data:
 *                     id_sector: 1
 *                     nombre: "Sector San José"
 *                     veredas:
 *                       - id_vereda: 1
 *                         nombre: "Centro"
 *                     statistics:
 *                       total_veredas: 3
 *                       total_familias: 85
 *                       total_personas: 324
 *       404:
 *         description: Sector no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Sector no encontrado"
 *               error_code: "SECTOR_NOT_FOUND"
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', sectorController.getSectorById);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   put:
 *     summary: Update sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sector San José"
 *               description:
 *                 type: string
 *                 example: "Descripción del sector"
 *               coordinator:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: "active"
 *               code:
 *                 type: string
 *                 example: "SEC001"
 *               municipioId:
 *                 type: integer
 *                 example: 1
 *               veredaId:
 *                 type: integer
 *                 example: 1
 *             required: [name]
 *             example:
 *               name: "Sector San José"
 *               description: "Sector ubicado en el centro"
 *               coordinator: 2
 *               status: "active"
 *               code: "SJ001"
 *               municipioId: 1
 *               veredaId: 1
 *     responses:
 *       200:
 *         description: Sector updated successfully
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Sector name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', sectorController.updateSector);

/**
 * @swagger
 * /api/catalog/sectors/{id}/assign-veredas:
 *   put:
 *     summary: Assign veredas to a sector
 *     description: |
 *       Asigna una o varias veredas a un sector específico.
 *       
 *       **FUNCIONALIDADES:**
 *       - Asignar múltiples veredas a un sector de una vez
 *       - Validar que las veredas existan antes de la asignación
 *       - Reasignar veredas que ya tenían otro sector (opcional)
 *       - Verificar compatibilidad geográfica entre veredas del mismo sector
 *       
 *       **VALIDACIONES:**
 *       - El sector debe existir y estar activo
 *       - Las veredas deben existir en la base de datos
 *       - Opcionalmente verificar que las veredas sean del mismo municipio
 *       
 *       **CASOS DE USO:**
 *       - Redistribución territorial de sectores
 *       - Asignación inicial de veredas a nuevos sectores
 *       - Corrección de asignaciones erróneas
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sector al que se asignarán las veredas
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               veredas_ids:
 *                 type: array
 *                 description: Array de IDs de veredas a asignar al sector
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3, 4]
 *                 minItems: 1
 *               replace_existing:
 *                 type: boolean
 *                 description: Si es true, reasigna veredas que ya tenían otro sector
 *                 default: false
 *                 example: false
 *               validate_municipality:
 *                 type: boolean
 *                 description: Si es true, valida que todas las veredas sean del mismo municipio
 *                 default: false
 *                 example: true
 *             required: [veredas_ids]
 *           examples:
 *             asignacion_simple:
 *               summary: Asignación simple de veredas
 *               value:
 *                 veredas_ids: [1, 2, 3]
 *             asignacion_con_reemplazo:
 *               summary: Asignación permitiendo reasignación
 *               value:
 *                 veredas_ids: [1, 2, 3, 4]
 *                 replace_existing: true
 *                 validate_municipality: true
 *             asignacion_validada:
 *               summary: Asignación con validación de municipio
 *               value:
 *                 veredas_ids: [5, 6, 7]
 *                 validate_municipality: true
 *     responses:
 *       200:
 *         description: Veredas asignadas exitosamente
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
 *                   example: "3 veredas asignadas exitosamente al sector"
 *                 data:
 *                   type: object
 *                   properties:
 *                     sector:
 *                       $ref: '#/components/schemas/Sector'
 *                     asignaciones:
 *                       type: object
 *                       properties:
 *                         exitosas:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id_vereda:
 *                                 type: integer
 *                               nombre:
 *                                 type: string
 *                               sector_anterior:
 *                                 type: string
 *                                 nullable: true
 *                         fallidas:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id_vereda:
 *                                 type: integer
 *                               razon:
 *                                 type: string
 *                         advertencias:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id_vereda:
 *                                 type: integer
 *                               mensaje:
 *                                 type: string
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               veredas_no_encontradas:
 *                 summary: Veredas no existen
 *                 value:
 *                   success: false
 *                   message: "Las siguientes veredas no fueron encontradas: [5, 7]"
 *                   error_code: "VEREDAS_NOT_FOUND"
 *               municipios_diferentes:
 *                 summary: Veredas de municipios diferentes
 *                 value:
 *                   success: false
 *                   message: "Las veredas pertenecen a municipios diferentes"
 *                   error_code: "MUNICIPALITY_MISMATCH"
 *               veredas_ya_asignadas:
 *                 summary: Veredas ya tienen sector asignado
 *                 value:
 *                   success: false
 *                   message: "Las veredas [1, 3] ya tienen sector asignado. Use replace_existing=true para reasignar"
 *                   error_code: "VEREDAS_ALREADY_ASSIGNED"
 *       404:
 *         description: Sector no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 */
// TODO: Implementar endpoint para asignar veredas a sectores
// router.put('/:id/assign-veredas', sectorController.assignVeredasToSector);

/**
 * @swagger
 * /api/catalog/sectors/{id}/unassign-veredas:
 *   put:
 *     summary: Unassign veredas from a sector
 *     description: |
 *       Desasigna veredas de un sector, dejándolas sin sector asignado.
 *       
 *       **FUNCIONALIDADES:**
 *       - Desasignar veredas específicas de un sector
 *       - Desasignar todas las veredas de un sector
 *       - Validar que las veredas estén efectivamente asignadas al sector
 *       
 *       **CASOS DE USO:**
 *       - Corrección de asignaciones erróneas
 *       - Preparación para redistribución territorial
 *       - Limpieza de datos antes de reasignaciones masivas
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del sector del que se desasignarán las veredas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               veredas_ids:
 *                 type: array
 *                 description: Array de IDs de veredas a desasignar. Si se omite, se desasignan todas
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               unassign_all:
 *                 type: boolean
 *                 description: Si es true, desasigna todas las veredas del sector
 *                 default: false
 *                 example: false
 *           examples:
 *             desasignar_especificas:
 *               summary: Desasignar veredas específicas
 *               value:
 *                 veredas_ids: [1, 2, 3]
 *             desasignar_todas:
 *               summary: Desasignar todas las veredas
 *               value:
 *                 unassign_all: true
 *     responses:
 *       200:
 *         description: Veredas desasignadas exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Sector no encontrado
 *       500:
 *         description: Error del servidor
 */
// TODO: Implementar endpoint para desasignar veredas de sectores  
// router.put('/:id/unassign-veredas', sectorController.unassignVeredasFromSector);

/**
 * @swagger
 * /api/catalog/sectors/{id}/assign-coordinator:
 *   put:
 *     summary: Assign coordinator to sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coordinatorId
 *             properties:
 *               coordinatorId:
 *                 type: string
 *                 description: Coordinator user ID
 *     responses:
 *       200:
 *         description: Coordinator assigned successfully
 *       400:
 *         description: Validation error or user is not a coordinator
 *       404:
 *         description: Sector or coordinator not found
 *       500:
 *         description: Server error
 */
// router.put('/:id/assign-coordinator', sectorController.assignCoordinator);

/**
 * @swagger
 * /api/catalog/sectors/{sectorName}/update-stats:
 *   put:
 *     summary: Update sector survey statistics
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectorName
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector name
 *     responses:
 *       200:
 *         description: Statistics updated successfully
 *       404:
 *         description: Sector not found
 *       500:
 *         description: Server error
 */
// router.put('/:sectorName/update-stats', sectorController.updateSectorSurveyStats);

/**
 * @swagger
 * /api/catalog/sectors/{id}:
 *   delete:
 *     summary: Delete sector
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sector ID
 *     responses:
 *       200:
 *         description: Sector deleted successfully
 *       404:
 *         description: Sector not found
 *       409:
 *         description: Cannot delete - has associated records
 *       500:
 *         description: Server error
 */
router.delete('/:id', sectorController.deleteSector);

/**
 * @swagger
 * /api/catalog/sectors/bulk:
 *   post:
 *     summary: Bulk create sectors
 *     tags: [Sectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sectors:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateSectorRequest'
 *             required: [sectors]
 *     responses:
 *       201:
 *         description: Sectors created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk', sectorController.bulkCreateSectors);

export default router;
