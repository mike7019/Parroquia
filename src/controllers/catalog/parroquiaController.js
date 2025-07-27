import parroquiaService from '../../services/catalog/parroquiaService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class ParroquiaController {
  /**
   * Create a new parroquia
   */
  async createParroquia(req, res) {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      const parroquia = await parroquiaService.createParroquia({ nombre });

      res.status(201).json(
        createSuccessResponse(
          'Parroquia created successfully',
          parroquia
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating parroquia',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all parroquias
   */
  async getAllParroquias(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id_parroquia',
        sortOrder = 'ASC'
      } = req.query;

      const result = await parroquiaService.getAllParroquias({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Parroquias retrieved successfully',
          result
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving parroquias',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get parroquia by ID
   */
  async getParroquiaById(req, res) {
    try {
      const { id } = req.params;

      const parroquia = await parroquiaService.getParroquiaById(id);

      res.json(
        createSuccessResponse(
          'Parroquia retrieved successfully',
          parroquia
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving parroquia',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update parroquia
   */
  async updateParroquia(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const parroquia = await parroquiaService.updateParroquia(id, updateData);

      res.json(
        createSuccessResponse(
          'Parroquia updated successfully',
          parroquia
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error updating parroquia',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete parroquia
   */
  async deleteParroquia(req, res) {
    try {
      const { id } = req.params;

      const result = await parroquiaService.deleteParroquia(id);

      res.json(
        createSuccessResponse(
          'Parroquia deleted successfully',
          result
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('associated personas')) statusCode = 409;

      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting parroquia',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get parroquia statistics
   */
  async getParroquiaStatistics(req, res) {
    try {
      const statistics = await parroquiaService.getParroquiaStatistics();

      res.json(
        createSuccessResponse(
          'Parroquia statistics retrieved successfully',
          statistics
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving parroquia statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }

  /**
   * Search parroquias
   */
  async searchParroquias(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json(
          createErrorResponse(
            'Search term must be at least 2 characters',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const parroquias = await parroquiaService.searchParroquias(q);

      res.json(
        createSuccessResponse(
          'Search completed successfully',
          parroquias
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching parroquias',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }
}

export default new ParroquiaController();
