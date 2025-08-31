import municipioService from '../../services/catalog/municipioService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class MunicipioController {

  /**
   * Get all municipios
   */
  async getAllMunicipios(req, res) {
    try {
      const {
        search,
        sortBy = 'nombre_municipio',
        sortOrder = 'ASC',
        id_departamento
      } = req.query;

      const result = await municipioService.getAllMunicipios({
        search,
        sortBy,
        sortOrder,
        id_departamento: id_departamento ? parseInt(id_departamento) : null
      });

      res.json({
        success: true,
        message: result.message,
        data: result.data,
        total: result.total,
        timestamp: new Date().toISOString()
      });
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
   * Search municipios by name
   */
  async searchMunicipios(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json(
          createErrorResponse('Search query parameter "q" is required', null, 'VALIDATION_ERROR')
        );
      }

      const municipios = await municipioService.searchMunicipiosByName(q);

      res.json({
        success: true,
        message: 'Búsqueda de municipios completada exitosamente',
        data: municipios,
        total: municipios.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error searching municipios',
          error.message,
          'SEARCH_ERROR'
        )
      );
    }
  }

  /**
   * Get municipios statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await municipioService.getStatistics();

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving municipios statistics',
          error.message,
          'STATS_ERROR'
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

      res.json({
        success: true,
        message: 'Municipio obtenido exitosamente',
        data: municipio,
        timestamp: new Date().toISOString()
      });
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
   * Get municipio by codigo DANE
   */
  async getMunicipioByCodigoDane(req, res) {
    try {
      const { codigo_dane } = req.params;

      const municipio = await municipioService.getMunicipioByCodigoDane(codigo_dane);

      res.json({
        success: true,
        message: 'Municipio obtenido exitosamente',
        data: municipio,
        timestamp: new Date().toISOString()
      });
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

      res.json({
        success: true,
        message: 'Municipios por departamento obtenidos exitosamente',
        data: municipios,
        total: municipios.length,
        timestamp: new Date().toISOString()
      });
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
}

export default new MunicipioController();

