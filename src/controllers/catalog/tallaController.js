/**
 * Controlador para Tallas
 * Maneja las peticiones HTTP del CRUD de tallas
 */
import tallaService from '../../services/catalog/tallaService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

// Función simple de validación
const isValidTalla = (tallaData) => {
  const errors = [];
  
  if (!tallaData.tipo_prenda) {
    errors.push('tipo_prenda es requerido');
  } else if (!['zapato', 'camisa', 'pantalon'].includes(tallaData.tipo_prenda)) {
    errors.push('tipo_prenda debe ser: zapato, camisa o pantalon');
  }
  
  if (!tallaData.talla || tallaData.talla.trim() === '') {
    errors.push('talla es requerida');
  }
  
  if (tallaData.genero && !['masculino', 'femenino', 'unisex'].includes(tallaData.genero)) {
    errors.push('genero debe ser: masculino, femenino o unisex');
  }
  
  return errors;
};

class TallaController {
  // GET /api/catalog/tallas
  async getAllTallas(req, res) {
    try {
      const filters = {
        search: req.query.search,
        tipo_prenda: req.query.tipo_prenda,
        genero: req.query.genero,
        activo: req.query.activo,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await tallaService.getAllTallas(filters);
      
      return res.status(200).json(createSuccessResponse(
        'Tallas obtenidas exitosamente',
        result
      ));
    } catch (error) {
      console.error('Error en getAllTallas:', error);
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // GET /api/catalog/tallas/:id
  async getTallaById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de talla inválido',
          'INVALID_TALLA_ID'
        ));
      }

      const talla = await tallaService.getTallaById(id);
      
      return res.status(200).json(createSuccessResponse(
        'Talla obtenida exitosamente',
        { talla }
      ));
    } catch (error) {
      console.error('Error en getTallaById:', error);
      
      if (error.message === 'Talla no encontrada') {
        return res.status(404).json(createErrorResponse(
          'Talla no encontrada',
          'TALLA_NOT_FOUND'
        ));
      }
      
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // POST /api/catalog/tallas
  async createTalla(req, res) {
    try {
      const tallaData = req.body;
      
      // Validar datos de entrada
      const validationErrors = isValidTalla(tallaData);
      if (validationErrors.length > 0) {
        return res.status(400).json(createErrorResponse(
          'Datos de entrada inválidos',
          'VALIDATION_ERROR',
          { errors: validationErrors }
        ));
      }

      const nuevaTalla = await tallaService.createTalla(tallaData);
      
      return res.status(201).json(createSuccessResponse(
        'Talla creada exitosamente',
        { talla: nuevaTalla }
      ));
    } catch (error) {
      console.error('Error en createTalla:', error);
      
      if (error.message.includes('Ya existe una talla')) {
        return res.status(409).json(createErrorResponse(
          error.message,
          'TALLA_ALREADY_EXISTS'
        ));
      }
      
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // PUT /api/catalog/tallas/:id
  async updateTalla(req, res) {
    try {
      const { id } = req.params;
      const tallaData = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de talla inválido',
          'INVALID_TALLA_ID'
        ));
      }

      // Validar datos de entrada si se proporcionan
      if (tallaData.tipo_prenda || tallaData.talla || tallaData.genero) {
        const validationErrors = isValidTalla({ ...tallaData, talla: tallaData.talla || 'temp' });
        if (validationErrors.length > 0 && validationErrors[0] !== 'talla es requerida') {
          return res.status(400).json(createErrorResponse(
            'Datos de entrada inválidos',
            'VALIDATION_ERROR',
            { errors: validationErrors }
          ));
        }
      }

      const tallaActualizada = await tallaService.updateTalla(id, tallaData);
      
      return res.status(200).json(createSuccessResponse(
        'Talla actualizada exitosamente',
        { talla: tallaActualizada }
      ));
    } catch (error) {
      console.error('Error en updateTalla:', error);
      
      if (error.message === 'Talla no encontrada') {
        return res.status(404).json(createErrorResponse(
          'Talla no encontrada',
          'TALLA_NOT_FOUND'
        ));
      }
      
      if (error.message.includes('Ya existe una talla')) {
        return res.status(409).json(createErrorResponse(
          error.message,
          'TALLA_ALREADY_EXISTS'
        ));
      }
      
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // DELETE /api/catalog/tallas/:id
  async deleteTalla(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de talla inválido',
          'INVALID_TALLA_ID'
        ));
      }

      const result = await tallaService.deleteTalla(id);
      
      return res.status(200).json(createSuccessResponse(
        'Talla eliminada exitosamente',
        result
      ));
    } catch (error) {
      console.error('Error en deleteTalla:', error);
      
      if (error.message === 'Talla no encontrada') {
        return res.status(404).json(createErrorResponse(
          'Talla no encontrada',
          'TALLA_NOT_FOUND'
        ));
      }
      
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // GET /api/catalog/tallas/tipo/:tipo_prenda
  async getTallasByTipo(req, res) {
    try {
      const { tipo_prenda } = req.params;
      const { genero } = req.query;
      
      if (!['zapato', 'camisa', 'pantalon'].includes(tipo_prenda)) {
        return res.status(400).json(createErrorResponse(
          'Tipo de prenda inválido',
          'INVALID_TIPO_PRENDA'
        ));
      }

      const tallas = await tallaService.getTallasByTipo(tipo_prenda, genero);
      
      return res.status(200).json(createSuccessResponse(
        `Tallas de ${tipo_prenda} obtenidas exitosamente`,
        { tallas, total: tallas.length }
      ));
    } catch (error) {
      console.error('Error en getTallasByTipo:', error);
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }

  // GET /api/catalog/tallas/estadisticas
  async getEstadisticas(req, res) {
    try {
      const estadisticas = await tallaService.getEstadisticas();
      
      return res.status(200).json(createSuccessResponse(
        'Estadísticas obtenidas exitosamente',
        { estadisticas }
      ));
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      return res.status(500).json(createErrorResponse(
        'Error interno del servidor',
        'INTERNAL_SERVER_ERROR'
      ));
    }
  }
}

const tallaController = new TallaController();
export default tallaController;
