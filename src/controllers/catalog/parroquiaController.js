import parroquiaService from '../../services/catalog/parroquiaService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class ParroquiaController {
  /**
   * Create a new parroquia
   */
  async createParroquia(req, res) {
    try {
      const { nombre, id_municipio, direccion, telefono, email } = req.body;

      if (!nombre) {
        return res.status(400).json(
          createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
        );
      }

      if (!id_municipio) {
        return res.status(400).json(
          createErrorResponse('ID de municipio es requerido', null, 'VALIDATION_ERROR')
        );
      }

      const parroquia = await parroquiaService.createParroquia({ 
        nombre, 
        id_municipio,
        direccion,
        telefono,
        email
      });

      // Estructura personalizada de respuesta para incluir created_at y updated_at
      const responseData = {
        ...parroquia.toJSON ? parroquia.toJSON() : parroquia,
        created_at: parroquia.created_at || parroquia.createdAt,
        updated_at: parroquia.updated_at || parroquia.updatedAt
      };

      res.status(201).json({
        success: true,
        message: 'Parroquia creada exitosamente',
        data: responseData
      });
    } catch (error) {
      const statusCode = error.message.includes('does not exist') ? 404 : 500;
      res.status(statusCode).json(
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
        search,
        sortBy = 'id_parroquia',
        sortOrder = 'ASC',
        id_municipio
      } = req.query;

      const parroquias = await parroquiaService.getAllParroquias({
        search,
        sortBy,
        sortOrder,
        id_municipio: id_municipio ? parseInt(id_municipio) : null
      });

      // Agregar created_at y updated_at a cada parroquia en los datos
      if (parroquias.data && Array.isArray(parroquias.data)) {
        parroquias.data = parroquias.data.map(parroquia => ({
          ...parroquia.toJSON ? parroquia.toJSON() : parroquia,
          created_at: parroquia.created_at || parroquia.createdAt,
          updated_at: parroquia.updated_at || parroquia.updatedAt
        }));
      }

      res.json({
        success: true,
        message: 'Parroquias retrieved successfully',
        data: parroquias.data,
        total: parroquias.total
      });
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

      // Estructura personalizada de respuesta para incluir created_at y updated_at
      const responseData = {
        ...parroquia.toJSON ? parroquia.toJSON() : parroquia,
        created_at: parroquia.created_at || parroquia.createdAt,
        updated_at: parroquia.updated_at || parroquia.updatedAt
      };

      res.json({
        success: true,
        message: 'Parroquia retrieved successfully',
        data: responseData
      });
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

      // Estructura personalizada de respuesta para incluir created_at y updated_at
      const responseData = {
        ...parroquia.toJSON ? parroquia.toJSON() : parroquia,
        created_at: parroquia.created_at || parroquia.createdAt,
        updated_at: parroquia.updated_at || parroquia.updatedAt
      };

      res.json({
        success: true,
        message: 'Parroquia updated successfully',
        data: responseData
      });
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

  /**
   * Get parroquias by municipio
   */
  async getParroquiasByMunicipio(req, res) {
    try {
      const { municipioId } = req.params;

      if (!municipioId) {
        return res.status(400).json(
          createErrorResponse(
            'Municipio ID is required',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const parroquias = await parroquiaService.getParroquiasByMunicipio(municipioId);

      res.json(
        createSuccessResponse(
          'Parroquias by municipio retrieved successfully',
          parroquias
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving parroquias by municipio',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new ParroquiaController();
