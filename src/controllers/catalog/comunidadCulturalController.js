import comunidadCulturalService from '../../services/catalog/comunidadCulturalService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

class ComunidadCulturalController {
  /**
   * Create a new comunidad cultural
   */
  async createComunidadCultural(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json(
          createErrorResponse('El nombre de la comunidad cultural es requerido', null, 'VALIDATION_ERROR')
        );
      }

      const comunidadCultural = await comunidadCulturalService.createComunidadCultural({
        nombre,
        descripcion
      });

      res.status(201).json(
        createSuccessResponse(
          'Comunidad cultural creada exitosamente',
          { comunidadCultural }
        )
      );
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json(
          createErrorResponse(error.message, null, 'CONFLICT_ERROR')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error creando comunidad cultural',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all comunidades culturales
   */
  async getAllComunidadesCulturales(req, res) {
    try {
      const {
        search,
        sortBy = 'id_comunidad_cultural',
        sortOrder = 'ASC',
        activo
      } = req.query;

      const result = await comunidadCulturalService.getAllComunidadesCulturales({
        search,
        sortBy,
        sortOrder,
        activo: activo !== undefined ? activo === 'true' : null
      });

      res.json(
        createSuccessResponse(
          'Comunidades culturales obtenidas exitosamente',
          result
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error obteniendo comunidades culturales',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get comunidad cultural by ID
   */
  async getComunidadCulturalById(req, res) {
    try {
      const { id } = req.params;
      
      const comunidadCultural = await comunidadCulturalService.getComunidadCulturalById(id);

      res.json(
        createSuccessResponse(
          'Comunidad cultural obtenida exitosamente',
          { comunidadCultural }
        )
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(
          createErrorResponse(error.message, null, 'NOT_FOUND')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error obteniendo comunidad cultural',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update comunidad cultural
   */
  async updateComunidadCultural(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      const updatedComunidadCultural = await comunidadCulturalService.updateComunidadCultural(id, {
        nombre,
        descripcion,
        activo
      });

      res.json(
        createSuccessResponse(
          'Comunidad cultural actualizada exitosamente',
          { comunidadCultural: updatedComunidadCultural }
        )
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(
          createErrorResponse(error.message, null, 'NOT_FOUND')
        );
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json(
          createErrorResponse(error.message, null, 'CONFLICT_ERROR')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error actualizando comunidad cultural',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete comunidad cultural (soft delete)
   */
  async deleteComunidadCultural(req, res) {
    try {
      const { id } = req.params;
      
      await comunidadCulturalService.deleteComunidadCultural(id);

      res.json(
        createSuccessResponse(
          'Comunidad cultural eliminada exitosamente',
          null
        )
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json(
          createErrorResponse(error.message, null, 'NOT_FOUND')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error eliminando comunidad cultural',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get comunidades culturales for select dropdown
   */
  async getComunidadesCulturalesSelect(req, res) {
    try {
      const comunidades = await comunidadCulturalService.getComunidadesCulturalesForSelect();

      res.json(
        createSuccessResponse(
          'Comunidades culturales para select obtenidas exitosamente',
          { comunidades }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error obteniendo comunidades culturales para select',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get statistics
   */
  async getStats(req, res) {
    try {
      const stats = await comunidadCulturalService.getStats();

      res.json(
        createSuccessResponse(
          'Estadísticas obtenidas exitosamente',
          { stats }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error obteniendo estadísticas',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }
}

export default new ComunidadCulturalController();
