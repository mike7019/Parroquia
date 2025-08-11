import ParentescoService from '../services/parentescoService.js';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors.js';

/**
 * Controlador para gestión de parentescos con operaciones CRUD completas
 */
class ParentescoController {
  /**
   * Obtener todos los parentescos
   * GET /api/parentescos
   */
  static async getAllParentescos(req, res, next) {
    try {
      const { 
        includeInactive = false, 
        page, 
        limit = 10, 
        search 
      } = req.query;
      
      const options = {
        includeInactive: includeInactive === 'true',
        search: search?.trim(),
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined
      };
      
      const result = await ParentescoService.getAllParentescos(options);
      
      res.status(200).json({
        status: 'success',
        message: 'Parentescos obtenidos exitosamente',
        data: Array.isArray(result) ? { parentescos: result } : result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener parentesco por ID
   * GET /api/parentescos/:id
   */
  static async getParentescoById(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        throw new ValidationError('ID de parentesco inválido');
      }
      
      const parentesco = await ParentescoService.getParentescoById(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        message: 'Parentesco obtenido exitosamente',
        data: { parentesco }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nuevo parentesco
   * POST /api/parentescos
   */
  static async createParentesco(req, res, next) {
    try {
      const { nombre, descripcion } = req.body;
      
      // Validaciones básicas
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new ValidationError('El nombre del parentesco es requerido y debe ser una cadena válida');
      }
      
      if (descripcion && typeof descripcion !== 'string') {
        throw new ValidationError('La descripción debe ser una cadena de texto');
      }
      
      const parentescoData = {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim()
      };
      
      const nuevoParentesco = await ParentescoService.createParentesco(parentescoData);
      
      res.status(201).json({
        status: 'success',
        message: 'Parentesco creado exitosamente',
        data: { parentesco: nuevoParentesco }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar parentesco
   * PUT /api/parentescos/:id
   */
  static async updateParentesco(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        throw new ValidationError('ID de parentesco inválido');
      }
      
      // Validaciones de datos
      if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
          throw new ValidationError('El nombre debe ser una cadena válida y no puede estar vacío');
        }
      }
      
      if (descripcion !== undefined && descripcion !== null) {
        if (typeof descripcion !== 'string') {
          throw new ValidationError('La descripción debe ser una cadena de texto');
        }
      }
      
      if (activo !== undefined) {
        if (typeof activo !== 'boolean') {
          throw new ValidationError('El campo activo debe ser un valor booleano');
        }
      }
      
      const updateData = {
        nombre: nombre?.trim(),
        descripcion: descripcion?.trim(),
        activo
      };
      
      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('Debe proporcionar al menos un campo para actualizar');
      }
      
      const parentescoActualizado = await ParentescoService.updateParentesco(parseInt(id), updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Parentesco actualizado exitosamente',
        data: { parentesco: parentescoActualizado }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar parentesco (soft delete)
   * DELETE /api/parentescos/:id
   */
  static async deleteParentesco(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        throw new ValidationError('ID de parentesco inválido');
      }
      
      await ParentescoService.deleteParentesco(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        message: 'Parentesco eliminado exitosamente',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar parentesco eliminado
   * PATCH /api/parentescos/:id/restore
   */
  static async restoreParentesco(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        throw new ValidationError('ID de parentesco inválido');
      }
      
      const parentescoRestaurado = await ParentescoService.restoreParentesco(parseInt(id));
      
      res.status(200).json({
        status: 'success',
        message: 'Parentesco restaurado exitosamente',
        data: { parentesco: parentescoRestaurado }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de parentescos
   * GET /api/parentescos/stats
   */
  static async getParentescoStats(req, res, next) {
    try {
      const stats = await ParentescoService.getParentescoStats();
      
      res.status(200).json({
        status: 'success',
        message: 'Estadísticas obtenidas exitosamente',
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ParentescoController;
