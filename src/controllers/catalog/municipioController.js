import municipioService from '../../services/catalog/municipioService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class MunicipioController {
  /**
   * Create a new municipio
   */
  async createMunicipio(req, res) {
    try {
      const { nombre_municipio, codigo_dane, id_departamento } = req.body;

      if (!nombre_municipio || !codigo_dane || !id_departamento) {
        return res.status(400).json(
          createErrorResponse('nombre_municipio, codigo_dane, and id_departamento are required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await municipioService.findOrCreateMunicipio({
        nombre_municipio,
        codigo_dane,
        id_departamento 
      });

      if (!result.created) {
        return res.status(409).json(
          createErrorResponse(
            'Municipio ya existe con ese nombre o código DANE',
            null,
            'DUPLICATE_ERROR'
          )
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Municipio creado exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating municipio',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all municipios
   */
  async getAllMunicipios(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'nombre_municipio',
        sortOrder = 'ASC',
        id_departamento
      } = req.query;

      const result = await municipioService.getAllMunicipios({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder,
        id_departamento: id_departamento ? parseInt(id_departamento) : null
      });

      res.json(
        createSuccessResponse(
          'Municipios retrieved successfully',
          result
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving municipios',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get municipio by ID
   */
  async getMunicipioById(req, res) {
    try {
      const { id } = req.params;

      const municipio = await municipioService.getMunicipioById(id);

      res.json(
        createSuccessResponse(
          'Municipio retrieved successfully',
          municipio
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving municipio',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Update municipio
   */
  async updateMunicipio(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const municipio = await municipioService.updateMunicipio(id, updateData);

      res.json(
        createSuccessResponse(
          'Municipio updated successfully',
          municipio
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error updating municipio',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete municipio
   */
  async deleteMunicipio(req, res) {
    try {
      const { id } = req.params;

      const result = await municipioService.deleteMunicipio(id);

      res.json(
        createSuccessResponse(
          'Municipio deleted successfully',
          result
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting municipio',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get municipio by codigo DANE
   */
  async getMunicipioByCodigoDane(req, res) {
    try {
      const { codigo_dane } = req.params;

      const municipio = await municipioService.getMunicipioByCodigoDane(codigo_dane);

      res.json(
        createSuccessResponse(
          'Municipio retrieved successfully',
          municipio
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving municipio by codigo DANE',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get municipios by departamento
   */
  async getMunicipiosByDepartamento(req, res) {
    try {
      const { id_departamento } = req.params;

      const municipios = await municipioService.getMunicipiosByDepartamento(parseInt(id_departamento));

      res.json(
        createSuccessResponse(
          'Municipios by departamento retrieved successfully',
          { municipios, id_departamento: parseInt(id_departamento) }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving municipios by departamento',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Search municipios by codigo DANE pattern
   */
  async searchMunicipiosByCodigoDane(req, res) {
    try {
      const { pattern } = req.params;

      const municipios = await municipioService.searchMunicipiosByCodigoDane(pattern);

      res.json(
        createSuccessResponse(
          'Municipios search by codigo DANE completed',
          { municipios, pattern }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching municipios by codigo DANE',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }

  /**
   * Bulk create municipios
   */
  async bulkCreateMunicipios(req, res) {
    try {
      const { municipios } = req.body;

      if (!municipios || !Array.isArray(municipios)) {
        return res.status(400).json(
          createErrorResponse('municipios array is required', null, 'VALIDATION_ERROR')
        );
      }

      const result = await municipioService.bulkCreateMunicipios(municipios);

      res.status(201).json(
        createSuccessResponse(
          'Municipios creados exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error bulk creating municipios',
          error.message,
          'BULK_CREATE_ERROR'
        )
      );
    }
  }
}

export default new MunicipioController();

