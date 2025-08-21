import estudioService from '../../services/catalog/estudioService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';
import logger from '../../utils/logger.js';

class EstudioController {
  
  /**
   * Obtener todos los estudios
   */
  async getAllEstudios(req, res) {
    try {
      const { search, sortBy, sortOrder } = req.query;
      
      const estudios = await estudioService.getAllEstudios(search, sortBy, sortOrder);
      
      res.json(createSuccessResponse(
        estudios,
        'Estudios obtenidos exitosamente',
        {
          total: estudios.length,
          hasSearch: !!search
        }
      ));
    } catch (error) {
      logger.error('Error in getAllEstudios controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Obtener estudio por ID
   */
  async getEstudioById(req, res) {
    try {
      const { id } = req.params;
      
      const estudio = await estudioService.getEstudioById(parseInt(id));
      
      res.json(createSuccessResponse(
        estudio,
        'Estudio obtenido exitosamente'
      ));
    } catch (error) {
      logger.error('Error in getEstudioById controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Crear nuevo estudio
   */
  async createEstudio(req, res) {
    try {
      const estudioData = req.body;
      
      // Validación básica
      if (!estudioData.nivel) {
        return res.status(400).json(createErrorResponse(
          'El nivel del estudio es obligatorio',
          'MISSING_REQUIRED_FIELD'
        ));
      }

      const nuevoEstudio = await estudioService.createEstudio(estudioData);
      
      res.status(201).json(createSuccessResponse(
        nuevoEstudio,
        'Estudio creado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in createEstudio controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Actualizar estudio
   */
  async updateEstudio(req, res) {
    try {
      const { id } = req.params;
      const estudioData = req.body;
      
      const estudioActualizado = await estudioService.updateEstudio(parseInt(id), estudioData);
      
      res.json(createSuccessResponse(
        estudioActualizado,
        'Estudio actualizado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in updateEstudio controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Eliminar estudio
   */
  async deleteEstudio(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await estudioService.deleteEstudio(parseInt(id));
      
      res.json(createSuccessResponse(
        resultado,
        'Estudio eliminado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in deleteEstudio controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Obtener estudios por nivel
   */
  async getEstudiosPorNivel(req, res) {
    try {
      const { nivel } = req.params;
      
      const estudios = await estudioService.getEstudiosPorNivel(nivel);
      
      res.json(createSuccessResponse(
        estudios,
        'Estudios por nivel obtenidos exitosamente'
      ));
    } catch (error) {
      logger.error('Error in getEstudiosPorNivel controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Obtener estadísticas de estudios
   */
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await estudioService.getEstadisticas();
      
      res.json(createSuccessResponse(
        estadisticas,
        'Estadísticas de estudios obtenidas exitosamente'
      ));
    } catch (error) {
      logger.error('Error in getEstadisticas controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }
}

export default new EstudioController();
