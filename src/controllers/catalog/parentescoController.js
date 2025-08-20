import parentescoService from '../../services/catalog/parentescoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';
import logger from '../../utils/logger.js';

class ParentescoController {
  
  /**
   * Obtener todos los parentescos
   */
  async getAllParentescos(req, res) {
    try {
      const { search, sortBy, sortOrder } = req.query;
      
      const parentescos = await parentescoService.getAllParentescos(search, sortBy, sortOrder);
      
      res.json(createSuccessResponse(
        parentescos,
        'Parentescos obtenidos exitosamente',
        {
          total: parentescos.length,
          hasSearch: !!search
        }
      ));
    } catch (error) {
      logger.error('Error in getAllParentescos controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Obtener parentesco por ID
   */
  async getParentescoById(req, res) {
    try {
      const { id } = req.params;
      
      const parentesco = await parentescoService.getParentescoById(parseInt(id));
      
      res.json(createSuccessResponse(
        parentesco,
        'Parentesco obtenido exitosamente'
      ));
    } catch (error) {
      logger.error('Error in getParentescoById controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Crear nuevo parentesco
   */
  async createParentesco(req, res) {
    try {
      const parentescoData = req.body;
      
      // Validación básica
      if (!parentescoData.nombre) {
        return res.status(400).json(createErrorResponse(
          'El nombre del parentesco es obligatorio',
          'MISSING_REQUIRED_FIELD'
        ));
      }

      const nuevoParentesco = await parentescoService.createParentesco(parentescoData);
      
      res.status(201).json(createSuccessResponse(
        nuevoParentesco,
        'Parentesco creado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in createParentesco controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Actualizar parentesco
   */
  async updateParentesco(req, res) {
    try {
      const { id } = req.params;
      const parentescoData = req.body;
      
      const parentescoActualizado = await parentescoService.updateParentesco(parseInt(id), parentescoData);
      
      res.json(createSuccessResponse(
        parentescoActualizado,
        'Parentesco actualizado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in updateParentesco controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Eliminar parentesco
   */
  async deleteParentesco(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await parentescoService.deleteParentesco(parseInt(id));
      
      res.json(createSuccessResponse(
        resultado,
        'Parentesco eliminado exitosamente'
      ));
    } catch (error) {
      logger.error('Error in deleteParentesco controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }

  /**
   * Obtener parentescos más utilizados
   */
  async getParentescosMasUtilizados(req, res) {
    try {
      const parentescos = await parentescoService.getParentescosMasUtilizados();
      
      res.json(createSuccessResponse(
        parentescos,
        'Parentescos más utilizados obtenidos exitosamente'
      ));
    } catch (error) {
      logger.error('Error in getParentescosMasUtilizados controller:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json(createErrorResponse(
        error.message,
        error.code || 'INTERNAL_ERROR'
      ));
    }
  }
}

export default new ParentescoController();
