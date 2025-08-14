import veredaService from '../../services/catalog/veredaService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class VeredaController {
  /**
   * Create a new vereda
   */
  async createVereda(req, res) {
    try {
      const { nombre, codigo_vereda, id_municipio } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      // Validate that municipio exists if id_municipio is provided
      if (id_municipio) {
        const { Municipios } = await import('../../models/index.js');
        const municipioExists = await Municipios.findByPk(id_municipio);
        
        if (!municipioExists) {
          return res.status(400).json(
            createErrorResponse(
              `Municipio with ID ${id_municipio} does not exist`,
              null,
              'VALIDATION_ERROR'
            )
          );
        }
      }

      const result = await veredaService.findOrCreateVereda({
        nombre,
        codigo_vereda,
        id_municipio
      });

      if (!result.created) {
        return res.status(409).json(
          createErrorResponse(
            'Vereda ya existe con ese nombre o código',
            null,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Vereda creada exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating vereda',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all veredas (sin paginación)
   */
  async getAllVeredas(req, res) {
    try {
      const {
        search,
        municipioId,
        sortBy = 'id_vereda',
        sortOrder = 'ASC'
      } = req.query;

      const result = await veredaService.getAllVeredas({
        search,
        municipioId,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Veredas retrieved successfully',
          result
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving veredas',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get vereda by ID
   */
  async getVeredaById(req, res) {
    try {
      const { id } = req.params;

      const vereda = await veredaService.getVeredaById(id);

      res.json(
        createSuccessResponse(
          'Vereda retrieved successfully',
          vereda
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving vereda',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update vereda
   */
  async updateVereda(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const vereda = await veredaService.updateVereda(id, updateData);

      res.json(
        createSuccessResponse(
          'Vereda updated successfully',
          vereda
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error updating vereda',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete vereda
   */
  async deleteVereda(req, res) {
    try {
      const { id } = req.params;

      const result = await veredaService.deleteVereda(id);

      res.json(
        createSuccessResponse(
          'Vereda deleted successfully',
          result
        )
      );
    } catch (error) {
      let statusCode = 500;
      if (error.message.includes('not found')) statusCode = 404;
      if (error.message.includes('associated')) statusCode = 409;

      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting vereda',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get veredas by municipio
   */
  async getVeredasByMunicipio(req, res) {
    try {
      const { municipioId } = req.params;

      const veredas = await veredaService.getVeredasByMunicipio(municipioId);

      res.json(
        createSuccessResponse(
          'Veredas by municipio retrieved successfully',
          veredas
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving veredas by municipio',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get vereda statistics
   */
  async getVeredaStatistics(req, res) {
    try {
      const { veredaId } = req.query;

      const statistics = await veredaService.getVeredaStatistics(veredaId);

      res.json(
        createSuccessResponse(
          'Vereda statistics retrieved successfully',
          statistics
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving vereda statistics',
          error.message,
          'STATS_ERROR'
        )
      );
    }
  }

  /**
   * Search veredas
   */
  async searchVeredas(req, res) {
    try {
      const { q, municipioId } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json(
          createErrorResponse(
            'Search term must be at least 2 characters',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const veredas = await veredaService.searchVeredas(q, { municipioId });

      res.json(
        createSuccessResponse(
          'Search completed successfully',
          veredas
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching veredas',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }

  /**
   * Get vereda with full details
   */
  async getVeredaDetails(req, res) {
    try {
      const { id } = req.params;

      const vereda = await veredaService.getVeredaDetails(id);

      res.json(
        createSuccessResponse(
          'Vereda details retrieved successfully',
          vereda
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving vereda details',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new VeredaController();
