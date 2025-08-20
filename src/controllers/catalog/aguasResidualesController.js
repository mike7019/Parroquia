import aguasResidualesService from '../../services/catalog/aguasResidualesService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class AguasResidualesController {
  /**
   * Create a new tipo de aguas residuales
   */
  async createTipoAguasResiduales(req, res) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const tipoAguasResiduales = await aguasResidualesService.createTipoAguasResiduales({ nombre, descripcion });
      
      res.status(201).json(
        createSuccessResponse(
          'Tipo de aguas residuales creado exitosamente',
          tipoAguasResiduales
        )
      );
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse('Tipo de aguas residuales ya existe', null, 'DUPLICATE_ERROR')
        );
      }
      
      res.status(500).json(
        createErrorResponse(
          'Error creating tipo de aguas residuales',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all tipos de aguas residuales with search
   */
  async getAllTiposAguasResiduales(req, res) {
    try {
      const {
        search,
        sortBy = 'id_tipo_aguas_residuales',
        sortOrder = 'ASC'
      } = req.query;

      const tiposAguasResiduales = await aguasResidualesService.getAllTiposAguasResiduales({
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Tipos de aguas residuales retrieved successfully',
          tiposAguasResiduales
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving tipos de aguas residuales',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get tipo de aguas residuales by ID
   */
  async getTipoAguasResidualesById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const tipoAguasResiduales = await aguasResidualesService.getTipoAguasResidualesById(id);

      res.json(
        createSuccessResponse(
          'Tipo de aguas residuales retrieved successfully',
          tipoAguasResiduales
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Tipo de aguas residuales not found', null, 'NOT_FOUND')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error retrieving tipo de aguas residuales',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update tipo de aguas residuales
   */
  async updateTipoAguasResiduales(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const tipoAguasResiduales = await aguasResidualesService.updateTipoAguasResiduales(id, { nombre, descripcion });

      res.json(
        createSuccessResponse(
          'Tipo de aguas residuales updated successfully',
          tipoAguasResiduales
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Tipo de aguas residuales not found', null, 'NOT_FOUND')
        );
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse('Tipo de aguas residuales with this name already exists', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error updating tipo de aguas residuales',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete tipo de aguas residuales
   */
  async deleteTipoAguasResiduales(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json(
          createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await aguasResidualesService.deleteTipoAguasResiduales(id);

      res.json(
        createSuccessResponse(
          'Tipo de aguas residuales deleted successfully',
          result
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse('Tipo de aguas residuales not found', null, 'NOT_FOUND')
        );
      }

      if (error.message.includes('has associated familias')) {
        return res.status(409).json(
          createErrorResponse('Cannot delete tipo de aguas residuales: it has associated familias', null, 'CONSTRAINT_ERROR')
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error deleting tipo de aguas residuales',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Search tipos de aguas residuales
   */
  async searchTiposAguasResiduales(req, res) {
    try {
      const { q, limit = 20 } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json(
          createErrorResponse(
            'Search term must be at least 2 characters',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const tiposAguasResiduales = await aguasResidualesService.searchTiposAguasResiduales(q, { limit });

      res.json(
        createSuccessResponse(
          'Search completed successfully',
          tiposAguasResiduales
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching tipos de aguas residuales',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(req, res) {
    try {
      const statistics = await aguasResidualesService.getStatistics();

      res.json(
        createSuccessResponse(
          'Statistics retrieved successfully',
          statistics
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }
}

export default new AguasResidualesController();
