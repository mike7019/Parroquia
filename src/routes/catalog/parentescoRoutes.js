import express from 'express';
import parentescoController from '../../controllers/catalog/parentescoController.js';
import authMiddleware from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Parentescos
 *   description: |
 *     Gestión de catálogo de tipos de parentesco. 
 *     
 *     **Funcionalidades:** CRUD completo, búsqueda por nombre, paginación, soft delete, restauración, estadísticas. 
 *     Incluye 30 tipos de parentesco precargados (padre, madre, hijo, hermano, etc.).
 *     
 *     **URLs disponibles:**
 *     - `/api/catalog/parentescos` (recomendada)
 *     - `/api/parentescos` (compatibilidad)
 */

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
 *     summary: Obtener estadísticas de parentescos (acceso directo)
 *     description: |
 *       Recupera estadísticas generales de los parentescos registrados en el sistema.
 *       
 *       **Información incluida:**
 *       - Total de parentescos registrados
 *       - Cantidad de parentescos activos e inactivos
 *       - Porcentaje de parentescos activos
 *       
 *       **Requiere autenticación:** Sí
 *       **URL alternativa:** `/api/catalog/parentescos/stats`
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

/**
 * @swagger
 * /api/catalog/parentescos/stats:
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
  authMiddleware.authenticateToken,
  parentescoController.getParentescosMasUtilizados
);

/**
 * @swagger
 * /api/catalog/parentescos:
 *   get:
 *     summary: Obtener todos los parentescos
 *     description: Recupera una lista de todos los parentescos
 *     tags: [Parentescos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de parentescos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parentesco'
 *                 total:
 *                   type: integer
 *                   example: 30
 *                 message:
 *                   type: string
 *                   example: Se encontraron 30 parentescos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
// GET /api/parentescos - Obtener todos los parentescos
router.get('/',
  authMiddleware.authenticateToken,
  parentescoController.getAllParentescos
);

/**
 * @swagger
 * /api/catalog/parentescos:
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
  authMiddleware.authenticateToken,
  parentescoController.createParentesco
);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
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
  authMiddleware.authenticateToken,
  parentescoController.getParentescoById
);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
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
  authMiddleware.authenticateToken,
  parentescoController.updateParentesco
);

/**
 * @swagger
 * /api/catalog/parentescos/{id}:
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
  authMiddleware.authenticateToken,
  parentescoController.deleteParentesco
);

/**
 * @swagger
 * /api/catalog/parentescos/{id}/restore:
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
  authMiddleware.authenticateToken,
  parentescoController.deleteParentesco
);

export default router;
