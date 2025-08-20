import sexoService from '../../services/catalog/sexoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SexoController {
  /**
   * Create a new sexo
   */
  async createSexo(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre || nombre.trim() === '') {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const sexo = await sexoService.createSexo({ nombre: nombre.trim() });

      res.status(201).json(
        createSuccessResponse(
          'Sexo created successfully',
          sexo
        )
      );
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse(
            'Sexo already exists',
            error.message,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error creating sexo',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get sexo by ID
   */
  async getSexoById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Invalid ID provided', null, 'VALIDATION_ERROR')
        );
      }

      const sexo = await sexoService.getSexoById(parseInt(id));

      res.json(
        createSuccessResponse(
          'Sexo retrieved successfully',
          sexo
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(
            'Sexo not found',
            error.message,
            'NOT_FOUND'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexo',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update sexo
   */
  async updateSexo(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Invalid ID provided', null, 'VALIDATION_ERROR')
        );
      }

      if (!nombre || nombre.trim() === '') {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const sexo = await sexoService.updateSexo(parseInt(id), { nombre: nombre.trim() });

      res.json(
        createSuccessResponse(
          'Sexo updated successfully',
          sexo
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(
            'Sexo not found',
            error.message,
            'NOT_FOUND'
          )
        );
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json(
          createErrorResponse(
            'Sexo with this name already exists',
            error.message,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error updating sexo',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete sexo
   */
  async deleteSexo(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Invalid ID provided', null, 'VALIDATION_ERROR')
        );
      }

      const result = await sexoService.deleteSexo(parseInt(id));

      res.json(
        createSuccessResponse(
          'Sexo deleted successfully',
          result
        )
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json(
          createErrorResponse(
            'Sexo not found',
            error.message,
            'NOT_FOUND'
          )
        );
      }

      if (error.message.includes('associated with families')) {
        return res.status(409).json(
          createErrorResponse(
            'Cannot delete sexo with associated families',
            error.message,
            'CONSTRAINT_ERROR'
          )
        );
      }

      res.status(500).json(
        createErrorResponse(
          'Error deleting sexo',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Search sexos
   */
  async searchSexos(req, res) {
    try {
      const { q, limit = 20 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json(
          createErrorResponse(
            'Search query must be at least 2 characters long',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const sexos = await sexoService.searchSexos(q.trim(), parseInt(limit));

      res.json(
        createSuccessResponse(
          'Search completed successfully',
          sexos
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching sexos',
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
      const stats = await sexoService.getStatistics();

      res.json(
        createSuccessResponse(
          'Statistics retrieved successfully',
          stats
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

  /**
   * Get all sexos
   */
  async getAllSexos(req, res) {
    try {
      const {
        search,
        sortBy = 'id_sexo',
        sortOrder = 'ASC'
      } = req.query;

      const sexos = await sexoService.getAllSexos({
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Sexos retrieved successfully',
          sexos
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexos',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new SexoController();
