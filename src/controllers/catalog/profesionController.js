import profesionService from '../../services/catalog/profesionService.js';
import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '../../utils/responses.js';

// Función simple de validación
function validateRequiredFields(data, requiredFields) {
  const missingFields = requiredFields.filter(field => !data[field] || data[field].toString().trim() === '');
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`
    };
  }
  
  return { isValid: true };
}

class ProfesionController {
  /**
   * Obtener todas las profesiones
   */
  async getAllProfesiones(req, res) {
    try {
      const result = await profesionService.getAllProfesiones();
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error en getAllProfesiones:', error);
      return res.status(500).json({
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener profesiones: ${error.message}`
      });
    }
  }

  /**
   * Obtener profesión por ID
   */
  async getProfesionById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de profesión inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const profesion = await profesionService.getProfesionById(parseInt(id));
      
      const response = createSuccessResponse('Profesión obtenida exitosamente', {
        profesion
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en getProfesionById:', error);
      
      if (error.code === 'PROFESION_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'PROFESION_NOT_FOUND');
        return res.status(404).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Crear nueva profesión
   */
  async createProfesion(req, res) {
    try {
      const requiredFields = ['nombre'];
      const validation = validateRequiredFields(req.body, requiredFields);
      
      if (!validation.isValid) {
        const errorResponse = createValidationErrorResponse(validation.message);
        return res.status(400).json(errorResponse);
      }
      
      const profesionData = req.body;
      const nuevaProfesion = await profesionService.createProfesion(profesionData);
      
      const response = createSuccessResponse('Profesión creada exitosamente', {
        profesion: nuevaProfesion
      });
      
      return res.status(201).json(response);
    } catch (error) {
      console.error('Error en createProfesion:', error);
      
      // Manejo específico para errores de duplicado
      if (error.code === 'DUPLICATE_NAME') {
        const errorResponse = createErrorResponse(error.message, null, 'DUPLICATE_NAME');
        return res.status(409).json(errorResponse);
      }
      
      if (error.code === 'VALIDATION_ERROR') {
        const errorResponse = createValidationErrorResponse(error.message);
        return res.status(400).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Actualizar profesión
   */
  async updateProfesion(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de profesión inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const profesionData = req.body;
      const profesionActualizada = await profesionService.updateProfesion(parseInt(id), profesionData);
      
      const response = createSuccessResponse('Profesión actualizada exitosamente', {
        profesion: profesionActualizada
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en updateProfesion:', error);
      
      if (error.code === 'PROFESION_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'PROFESION_NOT_FOUND');
        return res.status(404).json(errorResponse);
      }
      
      // Manejo específico para errores de duplicado
      if (error.code === 'DUPLICATE_NAME') {
        const errorResponse = createErrorResponse(error.message, null, 'DUPLICATE_NAME');
        return res.status(409).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Eliminar profesión (soft delete)
   */
  async deleteProfesion(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de profesión inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const result = await profesionService.deleteProfesion(parseInt(id));
      
      const response = createSuccessResponse(result.message, result);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en deleteProfesion:', error);
      
      if (error.code === 'PROFESION_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'PROFESION_NOT_FOUND');
        return res.status(404).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Obtener categorías de profesiones
   */
  async getCategorias(req, res) {
    try {
      const categorias = await profesionService.getProfesionesPorCategoria();
      
      const response = createSuccessResponse('Categorías de profesiones obtenidas exitosamente', {
        categorias
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en getCategorias:', error);
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Obtener estadísticas de profesiones
   */
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await profesionService.getEstadisticasProfesiones();
      
      const response = createSuccessResponse('Estadísticas de profesiones obtenidas exitosamente', estadisticas);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }
}

export default new ProfesionController();
