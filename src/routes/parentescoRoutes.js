import express from 'express';
import ParentescoController from '../controllers/parentescoController.js';
import AuthMiddleware from '../middlewares/auth.js';

const router = express.Router();

/**
 * Rutas para gestión de parentescos con autenticación
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     # Los esquemas están definidos en src/config/swagger.js
 *     # - Parentesco: Esquema completo del parentesco
 *     # - ParentescoInput: Datos para crear parentesco
 *     # - ParentescoUpdate: Datos para actualizar parentesco
 *     # - ParentescoResponse: Respuesta con un parentesco
 *     # - ParentescosListResponse: Respuesta con lista de parentescos
 *     # - EstadisticasParentesco: Estadísticas de parentescos
 *     # - EstadisticasParentescoResponse: Respuesta con estadísticas
 */

/**
 * @swagger
 * /api/parentescos/stats:
 *   get:
 *     summary: Obtener estadísticas de parentescos
 *     description: |
 *       Recupera estadísticas generales de los parentescos registrados en el sistema.
 *       
 *       **Información incluida:**
 *       - Total de parentescos registrados
 *       - Cantidad de parentescos activos e inactivos
 *       - Porcentaje de parentescos activos
 *       
 *       **Requiere autenticación:** Sí
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadisticasParentescoResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/parentescos/stats - Obtener estadísticas (debe ir antes que /:id)
router.get('/stats',
  AuthMiddleware.authenticateToken,
  ParentescoController.getParentescoStats
);

/**
 * @swagger
 * /api/parentescos:
 *   get:
 *     summary: Obtener todos los parentescos
 *     description: |
 *       Recupera una lista de todos los parentescos con opciones avanzadas de filtrado y paginación.
 *       
 *       **Funcionalidades:**
 *       - Filtrado por estado (activo/inactivo)
 *       - Búsqueda por nombre del parentesco
 *       - Paginación configurable
 *       - Ordenamiento alfabético por nombre
 *       
 *       **Datos incluidos por defecto:** 30 tipos de parentesco comunes
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir parentescos inactivos
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre del parentesco
 *     responses:
 *       200:
 *         description: Lista de parentescos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentescosListResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/parentescos - Obtener todos los parentescos
router.get('/',
  AuthMiddleware.authenticateToken,
  ParentescoController.getAllParentescos
);

/**
 * @swagger
 * /api/parentescos:
 *   post:
 *     summary: Crear nuevo parentesco
 *     description: |
 *       Crea un nuevo tipo de parentesco en el sistema con validaciones completas.
 *       
 *       **Validaciones aplicadas:**
 *       - Nombre único (no puede repetirse)
 *       - Nombre obligatorio (2-255 caracteres)
 *       - Descripción opcional (máximo 500 caracteres)
 *       
 *       **Nota:** El parentesco se crea automáticamente como activo
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParentescoInput'
 *           example:
 *             nombre: "Abuelo"
 *             descripcion: "Abuelo paterno o materno"
 *     responses:
 *       201:
 *         description: Parentesco creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentescoResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       409:
 *         description: El parentesco ya existe
 *       500:
 *         description: Error interno del servidor
 */
// POST /api/parentescos - Crear nuevo parentesco
router.post('/',
  AuthMiddleware.authenticateToken,
  ParentescoController.createParentesco
);

/**
 * @swagger
 * /api/parentescos/{id}:
 *   get:
 *     summary: Obtener parentesco por ID
 *     description: Recupera un parentesco específico por su ID
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     responses:
 *       200:
 *         description: Parentesco obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentescoResponse'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Parentesco no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/parentescos/:id - Obtener parentesco por ID
router.get('/:id',
  AuthMiddleware.authenticateToken,
  ParentescoController.getParentescoById
);

/**
 * @swagger
 * /api/parentescos/{id}:
 *   put:
 *     summary: Actualizar parentesco
 *     description: Actualiza un parentesco existente
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParentescoUpdate'
 *           example:
 *             nombre: "Hermano"
 *             descripcion: "Hermano mayor o menor"
 *             activo: true
 *     responses:
 *       200:
 *         description: Parentesco actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentescoResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Parentesco no encontrado
 *       409:
 *         description: Conflicto con el nombre del parentesco
 *       500:
 *         description: Error interno del servidor
 */
// PUT /api/parentescos/:id - Actualizar parentesco
router.put('/:id',
  AuthMiddleware.authenticateToken,
  ParentescoController.updateParentesco
);

/**
 * @swagger
 * /api/parentescos/{id}:
 *   delete:
 *     summary: Eliminar parentesco
 *     description: Elimina un parentesco (soft delete - lo marca como inactivo)
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     responses:
 *       200:
 *         description: Parentesco eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Parentesco no encontrado
 *       500:
 *         description: Error interno del servidor
 */
// DELETE /api/parentescos/:id - Eliminar parentesco (soft delete)
router.delete('/:id',
  AuthMiddleware.authenticateToken,
  ParentescoController.deleteParentesco
);

/**
 * @swagger
 * /api/parentescos/{id}/restore:
 *   patch:
 *     summary: Restaurar parentesco eliminado
 *     description: Restaura un parentesco que fue eliminado (soft delete)
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del parentesco
 *         example: 1
 *     responses:
 *       200:
 *         description: Parentesco restaurado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParentescoResponse'
 *       400:
 *         description: ID inválido o parentesco ya activo
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Parentesco no encontrado
 *       409:
 *         description: Conflicto con nombre de parentesco activo
 *       500:
 *         description: Error interno del servidor
 */
// PATCH /api/parentescos/:id/restore - Restaurar parentesco eliminado
router.patch('/:id/restore',
  AuthMiddleware.authenticateToken,
  ParentescoController.restoreParentesco
);

export default router;
