import habilidadService from '../../services/catalog/habilidadService.js';
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

class HabilidadController {
  /**
   * Obtener todas las habilidades
   */
  async getAllHabilidades(req, res) {
    try {
      const result = await habilidadService.getAllHabilidades();
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error en getAllHabilidades:', error);
      return res.status(500).json({
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener habilidades: ${error.message}`
      });
    }
  }

  /**
   * Obtener habilidad por ID
   */
  async getHabilidadById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de habilidad inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const habilidad = await habilidadService.getHabilidadById(parseInt(id));
      
      const response = createSuccessResponse('Habilidad obtenida exitosamente', {
        habilidad
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en getHabilidadById:', error);
      
      if (error.code === 'HABILIDAD_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'HABILIDAD_NOT_FOUND');
        return res.status(404).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Crear nueva habilidad
   */
  async createHabilidad(req, res) {
    try {
      const requiredFields = ['nombre', 'descripcion'];
      const validation = validateRequiredFields(req.body, requiredFields);
      
      if (!validation.isValid) {
        const errorResponse = createValidationErrorResponse(validation.message);
        return res.status(400).json(errorResponse);
      }
      
      const habilidadData = req.body;
      const nuevaHabilidad = await habilidadService.createHabilidad(habilidadData);
      
      const response = createSuccessResponse('Habilidad creada exitosamente', {
        habilidad: nuevaHabilidad
      });
      
      return res.status(201).json(response);
    } catch (error) {
      console.error('Error en createHabilidad:', error);
      
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
   * Actualizar habilidad
   */
  async updateHabilidad(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de habilidad inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const habilidadData = req.body;
      const habilidadActualizada = await habilidadService.updateHabilidad(parseInt(id), habilidadData);
      
      const response = createSuccessResponse('Habilidad actualizada exitosamente', {
        habilidad: habilidadActualizada
      });
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en updateHabilidad:', error);
      
      if (error.code === 'HABILIDAD_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'HABILIDAD_NOT_FOUND');
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
   * Eliminar habilidad
   */
  async deleteHabilidad(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        const errorResponse = createErrorResponse('ID de habilidad inválido', null, 'INVALID_ID');
        return res.status(400).json(errorResponse);
      }
      
      const result = await habilidadService.deleteHabilidad(parseInt(id));
      
      const response = createSuccessResponse(result.message, result);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en deleteHabilidad:', error);
      
      if (error.code === 'HABILIDAD_NOT_FOUND') {
        const errorResponse = createErrorResponse(error.message, null, 'HABILIDAD_NOT_FOUND');
        return res.status(404).json(errorResponse);
      }
      
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }

  /**
   * Obtener estadísticas de habilidades
   */
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await habilidadService.getEstadisticasHabilidades();
      
      const response = createSuccessResponse('Estadísticas de habilidades obtenidas exitosamente', estadisticas);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      const errorResponse = createErrorResponse(error.message, null, 'INTERNAL_ERROR');
      return res.status(error.statusCode || 500).json(errorResponse);
    }
  }
}

export default new HabilidadController();
