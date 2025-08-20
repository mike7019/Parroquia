/**
 * Controlador para Situaciones Civiles
 * Maneja las peticiones HTTP para el CRUD de situaciones civiles
 */

import SituacionCivilService from '../services/situacionCivilService.js';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError 
} from '../utils/errors.js';

class SituacionCivilController {

  /**
   * Obtiene estadísticas de situaciones civiles
   * GET /api/catalog/situaciones-civiles/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await SituacionCivilService.getSituacionCivilStats();
      
      res.status(200).json({
        status: 'success',
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las situaciones civiles con filtros
   * GET /api/catalog/situaciones-civiles
   */
  static async getAll(req, res, next) {
    try {
      const {
        search = '',
        includeInactive = 'false',
        orderBy = 'orden',
        orderDirection = 'ASC'
      } = req.query;

      // Validaciones
      const includeInactiveBool = includeInactive === 'true';

      const situacionesCiviles = await SituacionCivilService.getAllSituacionesCiviles({
        search: search.toString(),
        includeInactive: includeInactiveBool,
        orderBy: orderBy.toString(),
        orderDirection: orderDirection.toString()
      });

      res.status(200).json({
        status: 'success',
        data: situacionesCiviles,
        message: `${situacionesCiviles.length} situaciones civiles encontradas`
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva situación civil
   * POST /api/catalog/situaciones-civiles
   */
  static async create(req, res, next) {
    try {
      const { nombre, descripcion, codigo, orden, activo = true } = req.body;

      // Validaciones básicas
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El nombre de la situación civil es requerido',
          errors: [{ field: 'nombre', message: 'Campo requerido' }]
        });
      }

      const situacionCivilData = {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        codigo: codigo?.trim() || null,
        orden: orden ? parseInt(orden) : undefined,
        activo: Boolean(activo)
      };

      const situacionCivil = await SituacionCivilService.createSituacionCivil(situacionCivilData);

      res.status(201).json({
        status: 'success',
        data: situacionCivil,
        message: 'Situación civil creada exitosamente'
      });

    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          errors: error.errors
        });
      }

      if (error instanceof ConflictError) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Obtiene una situación civil por ID
   * GET /api/catalog/situaciones-civiles/:id
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const { includeInactive = 'false' } = req.query;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de situación civil inválido'
        });
      }

      const includeInactiveBool = includeInactive === 'true';
      const situacionCivil = await SituacionCivilService.getSituacionCivilById(
        parseInt(id), 
        includeInactiveBool
      );

      res.status(200).json({
        status: 'success',
        data: situacionCivil,
        message: 'Situación civil encontrada'
      });

    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Actualiza una situación civil
   * PUT /api/catalog/situaciones-civiles/:id
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, codigo, orden, activo } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de situación civil inválido'
        });
      }

      const updateData = {};
      
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
      if (codigo !== undefined) updateData.codigo = codigo?.trim() || null;
      if (orden !== undefined) updateData.orden = parseInt(orden);
      if (activo !== undefined) updateData.activo = Boolean(activo);

      const situacionCivil = await SituacionCivilService.updateSituacionCivil(
        parseInt(id), 
        updateData
      );

      res.status(200).json({
        status: 'success',
        data: situacionCivil,
        message: 'Situación civil actualizada exitosamente'
      });

    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message,
          errors: error.errors
        });
      }

      if (error instanceof ConflictError) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Elimina una situación civil (soft delete)
   * DELETE /api/catalog/situaciones-civiles/:id
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de situación civil inválido'
        });
      }

      const result = await SituacionCivilService.deleteSituacionCivil(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: null,
        message: result.message
      });

    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Restaura una situación civil eliminada
   * PATCH /api/catalog/situaciones-civiles/:id/restore
   */
  static async restore(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de situación civil inválido'
        });
      }

      const situacionCivil = await SituacionCivilService.restoreSituacionCivil(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: situacionCivil,
        message: 'Situación civil restaurada exitosamente'
      });

    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      if (error instanceof ConflictError) {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Busca situaciones civiles
   * GET /api/catalog/situaciones-civiles/search
   */
  static async search(req, res, next) {
    try {
      const { q: searchTerm, limit = 10, includeInactive = 'false' } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const limitNum = Math.min(Math.max(1, parseInt(limit)), 50);
      const includeInactiveBool = includeInactive === 'true';

      const situacionesCiviles = await SituacionCivilService.searchSituacionesCiviles(
        searchTerm.toString(),
        {
          limit: limitNum,
          includeInactive: includeInactiveBool
        }
      );

      res.status(200).json({
        status: 'success',
        data: situacionesCiviles,
        total: situacionesCiviles.length,
        message: `${situacionesCiviles.length} situaciones civiles encontradas para "${searchTerm}"`
      });

    } catch (error) {
      next(error);
    }
  }
}

export default SituacionCivilController;
