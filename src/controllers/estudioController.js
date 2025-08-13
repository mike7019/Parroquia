/**
 * Controlador para Estudios (Niveles Educativos)
 * Maneja las peticiones HTTP relacionadas con niveles educativos
 */

import EstudioService from '../services/estudioService.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';

class EstudioController {
  /**
   * Obtener estadísticas de estudios
   * GET /api/catalog/estudios/stats
   */
  async getStats(req, res) {
    try {
      const stats = await EstudioService.getStats();
      
      res.status(200).json({
        status: 'success',
        data: stats,
        message: 'Estadísticas de estudios obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en getStats estudios:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener todos los estudios con filtros (sin paginación)
   * GET /api/catalog/estudios
   */
  async getAll(req, res) {
    try {
      const {
        search = '',
        includeInactive = 'false',
        orderBy = 'ordenNivel',
        orderDirection = 'ASC'
      } = req.query;

      const options = {
        search: search.trim(),
        includeInactive: includeInactive === 'true',
        orderBy,
        orderDirection: orderDirection.toUpperCase()
      };

      const result = await EstudioService.getAllEstudios(options);

      res.status(200).json({
        status: 'success',
        data: result.estudios,
        total: result.total,
        filters: result.filters,
        message: `${result.total} estudios encontrados`
      });
    } catch (error) {
      console.error('Error en getAll estudios:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear nuevo estudio
   * POST /api/catalog/estudios
   */
  async create(req, res) {
    try {
      const { nivel, descripcion, ordenNivel, activo } = req.body;

      // Validaciones básicas
      if (!nivel || typeof nivel !== 'string' || nivel.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'El nivel educativo es requerido y debe ser una cadena de texto válida'
        });
      }

      if (nivel.trim().length < 2 || nivel.trim().length > 255) {
        return res.status(400).json({
          status: 'error',
          message: 'El nivel educativo debe tener entre 2 y 255 caracteres'
        });
      }

      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'La descripción no puede exceder los 1000 caracteres'
        });
      }

      if (ordenNivel !== undefined && (isNaN(ordenNivel) || parseInt(ordenNivel) < 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'El orden debe ser un número positivo'
        });
      }

      const estudioData = {
        nivel: nivel.trim(),
        descripcion: descripcion?.trim(),
        ordenNivel: ordenNivel ? parseInt(ordenNivel) : undefined,
        activo: activo !== undefined ? Boolean(activo) : true
      };

      const nuevoEstudio = await EstudioService.createEstudio(estudioData);

      res.status(201).json({
        status: 'success',
        data: nuevoEstudio,
        message: 'Estudio creado exitosamente'
      });
    } catch (error) {
      console.error('Error en create estudio:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
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

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estudio por ID
   * GET /api/catalog/estudios/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const { includeInactive = 'false' } = req.query;

      // Validación del ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de estudio inválido'
        });
      }

      const estudio = await EstudioService.getEstudioById(
        parseInt(id),
        includeInactive === 'true'
      );

      res.status(200).json({
        status: 'success',
        data: estudio,
        message: 'Estudio encontrado'
      });
    } catch (error) {
      console.error('Error en getById estudio:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Actualizar estudio
   * PUT /api/catalog/estudios/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nivel, descripcion, ordenNivel, activo } = req.body;

      // Validación del ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de estudio inválido'
        });
      }

      // Validaciones de datos
      if (nivel !== undefined) {
        if (typeof nivel !== 'string' || nivel.trim().length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'El nivel educativo debe ser una cadena de texto válida'
          });
        }

        if (nivel.trim().length < 2 || nivel.trim().length > 255) {
          return res.status(400).json({
            status: 'error',
            message: 'El nivel educativo debe tener entre 2 y 255 caracteres'
          });
        }
      }

      if (descripcion !== undefined && descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          status: 'error',
          message: 'La descripción no puede exceder los 1000 caracteres'
        });
      }

      if (ordenNivel !== undefined && ordenNivel !== null && (isNaN(ordenNivel) || parseInt(ordenNivel) < 0)) {
        return res.status(400).json({
          status: 'error',
          message: 'El orden debe ser un número positivo'
        });
      }

      const updateData = {};
      if (nivel !== undefined) updateData.nivel = nivel.trim();
      if (descripcion !== undefined) updateData.descripcion = descripcion?.trim();
      if (ordenNivel !== undefined) updateData.ordenNivel = ordenNivel ? parseInt(ordenNivel) : null;
      if (activo !== undefined) updateData.activo = Boolean(activo);

      const estudioActualizado = await EstudioService.updateEstudio(parseInt(id), updateData);

      res.status(200).json({
        status: 'success',
        data: estudioActualizado,
        message: 'Estudio actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en update estudio:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
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

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Eliminar estudio
   * DELETE /api/catalog/estudios/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validación del ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de estudio inválido'
        });
      }

      const result = await EstudioService.deleteEstudio(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: null,
        message: result.message
      });
    } catch (error) {
      console.error('Error en delete estudio:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          status: 'error',
          message: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Restaurar estudio eliminado
   * PATCH /api/catalog/estudios/:id/restore
   */
  async restore(req, res) {
    try {
      const { id } = req.params;

      // Validación del ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          status: 'error',
          message: 'ID de estudio inválido'
        });
      }

      const estudioRestaurado = await EstudioService.restoreEstudio(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: estudioRestaurado,
        message: 'Estudio restaurado exitosamente'
      });
    } catch (error) {
      console.error('Error en restore estudio:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
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

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Buscar estudios
   * GET /api/catalog/estudios/search
   */
  async search(req, res) {
    try {
      const { q, limit = 10, includeInactive = 'false' } = req.query;

      // Validaciones
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.status(400).json({
          status: 'error',
          message: 'El parámetro de búsqueda (q) es requerido y debe tener al menos 2 caracteres'
        });
      }

      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          status: 'error',
          message: 'El límite debe ser un número entre 1 y 50'
        });
      }

      const estudios = await EstudioService.searchEstudios(q.trim(), {
        limit: limitNum,
        includeInactive: includeInactive === 'true'
      });

      res.status(200).json({
        status: 'success',
        data: estudios,
        total: estudios.length,
        message: `${estudios.length} estudios encontrados`
      });
    } catch (error) {
      console.error('Error en search estudios:', error);
      
      if (error instanceof ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default new EstudioController();
