import departamentoService from '../../services/catalog/departamentoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class DepartamentoController {
  /**
   * Get all departamentos
   */
  async getAllDepartamentos(req, res) {
    try {
      const result = await departamentoService.getAllDepartamentos();
      res.json(result);
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving departamentos',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get departamento by ID
   */
  async getDepartamentoById(req, res) {
    try {
      const { id } = req.params;

      const departamento = await departamentoService.getDepartamentoById(id);

      res.json(
        createSuccessResponse(
          'Departamento retrieved successfully',
          departamento
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving departamento',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get departamento by codigo DANE
   */
  async getDepartamentoByCodigoDane(req, res) {
    try {
      const { codigo_dane } = req.params;

      const departamento = await departamentoService.getDepartamentoByCodigoDane(codigo_dane);

      res.json(
        createSuccessResponse(
          'Departamento retrieved successfully',
          departamento
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error retrieving departamento by codigo DANE',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Get departamentos statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await departamentoService.getStatistics();

      res.json(
        createSuccessResponse(
          'Estadísticas obtenidas exitosamente',
          stats
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving statistics',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }

  /**
   * Search departamentos by name
   */
  async searchDepartamentos(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json(
          createErrorResponse(
            'Search query parameter "q" is required',
            null,
            'VALIDATION_ERROR'
          )
        );
      }

      const result = await departamentoService.searchDepartamentosByName(q);

      res.json(result);
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching departamentos',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }
}

export default new DepartamentoController();
