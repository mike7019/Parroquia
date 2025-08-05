import sexoService from '../../services/catalog/sexoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SexoController {
  /**
   * Create a new sexo
   */
  async createSexo(req, res) {
    try {
      const { sexo } = req.body;

      if (!sexo) {
        return res.status(400).json(
          createErrorResponse('Sexo is required', null, 'VALIDATION_ERROR')
        );
      }

      // Usar findOrCreate para evitar duplicados
      const result = await sexoService.findOrCreateSexo({ sexo });
      
      if (!result.created) {
        return res.status(409).json(
          createErrorResponse('Sexo ya existe', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Sexo creado exitosamente',
          null
        )
      );
    } catch (error) {
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
   * Get all sexos
   */
  async getAllSexos(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id_sexo',
        sortOrder = 'ASC'
      } = req.query;

      const result = await sexoService.getAllSexos({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Sexos retrieved successfully',
          result
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

  /**
   * Get sexo by ID
   */
  async getSexoById(req, res) {
    try {
      const { id } = req.params;

      const sexo = await sexoService.getSexoById(id);

      res.json(
        createSuccessResponse(
          'Sexo retrieved successfully',
          sexo
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
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
      const updateData = req.body;

      const sexo = await sexoService.updateSexo(id, updateData);

      res.json(
        createSuccessResponse(
          'Sexo updated successfully',
          sexo
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
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

      const result = await sexoService.deleteSexo(id);

      res.json(
        createSuccessResponse(
          'Sexo deleted successfully',
          result
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('associated personas')) statusCode = 409;

      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting sexo',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get sexo statistics
   */
  async getSexoStatistics(req, res) {
    try {
      const statistics = await sexoService.getSexoStatistics();

      res.json(
        createSuccessResponse(
          'Sexo statistics retrieved successfully',
          statistics
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexo statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }

  /**
   * Search sexos
   */
  async searchSexos(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.length < 1) {
        return res.status(400).json(
          createErrorResponse(
            'Search term is required',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const sexos = await sexoService.searchSexos(q);

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
   * Get sexo details with counts
   */
  async getSexoDetails(req, res) {
    try {
      const { id } = req.params;

      const sexo = await sexoService.getSexoDetails(id);

      res.json(
        createSuccessResponse(
          'Sexo details retrieved successfully',
          sexo
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving sexo details',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get sexos for select/dropdown
   */
  async getSexosForSelect(req, res) {
    try {
      const sexos = await sexoService.getSexosForSelect();

      res.json(
        createSuccessResponse(
          'Sexos for select retrieved successfully',
          sexos
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexos for select',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get sexo by name
   */
  async getSexoByName(req, res) {
    try {
      const { name } = req.params;

      const sexo = await sexoService.getSexoByName(name);

      if (!sexo) {
        return res.status(404).json(
          createErrorResponse(
            'Sexo not found',
            `Sexo with name '${name}' not found`,
            'NOT_FOUND'
          )
        );
      }

      res.json(
        createSuccessResponse(
          'Sexo retrieved successfully',
          sexo
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexo by name',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Bulk create sexos (for initial setup)
   */
  async bulkCreateSexos(req, res) {
    try {
      const { sexos } = req.body;

      if (!sexos || !Array.isArray(sexos) || sexos.length === 0) {
        return res.status(400).json(
          createErrorResponse(
            'Sexos array is required',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const result = await sexoService.bulkCreateSexos(sexos);

      res.status(201).json(
        createSuccessResponse(
          'Sexos creados exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error bulk creating sexos',
          error.message,
          'BULK_CREATE_ERROR'
        )
      );
    }
  }
}

export default new SexoController();
