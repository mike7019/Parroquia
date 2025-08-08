import sexoService from '../../services/catalog/sexoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class SexoController {
  /**
   * Create a new sexo
   */
  async createSexo(req, res) {
    try {
      const { sexo } = req.body;

      if (!sexo) {
        return res.status(400).json(
          createErrorResponse('Sexo is required', null, 'VALIDATION_ERROR')
        );
      }

      // Usar findOrCreate para evitar duplicados
      const result = await sexoService.findOrCreateSexo({ sexo });
      
      if (!result.created) {
        return res.status(409).json(
          createErrorResponse('Sexo ya existe', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Sexo creado exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating sexo',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all sexos
   */
  async getAllSexos(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id_sexo',
        sortOrder = 'ASC'
      } = req.query;

      const result = await sexoService.getAllSexos({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Sexos retrieved successfully',
          result
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving sexos',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new SexoController();
