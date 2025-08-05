import departamentoService from '../../services/catalog/departamentoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class DepartamentoController {
  /**
   * Create a new departamento
   */
  async createDepartamento(req, res) {
    try {
      const { nombre, codigo_dane, region } = req.body;

      if (!nombre || !codigo_dane) {
        return res.status(400).json(
          createErrorResponse('nombre and codigo_dane are required', null, 'VALIDATION_ERROR')
        );
      }

      // Usar findOrCreate para evitar duplicados
      const result = await departamentoService.findOrCreateDepartamento({ 
        nombre, 
        codigo_dane, 
        region 
      });

      if (!result.created) {
        return res.status(409).json(
          createErrorResponse('Departamento con este nombre o código DANE ya existe', null, 'DUPLICATE_ERROR')
        );
      }

      res.status(201).json(
        createSuccessResponse(
          'Departamento creado exitosamente',
          null
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error creating departamento',
          error.message,
          'CREATE_ERROR'
        )
      );
    }
  }

  /**
   * Get all departamentos
   */
  async getAllDepartamentos(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = req.query;

      const result = await departamentoService.getAllDepartamentos({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sortBy,
        sortOrder
      });

      res.json(
        createSuccessResponse(
          'Departamentos retrieved successfully',
          result
        )
      );
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
   * Update departamento
   */
  async updateDepartamento(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const departamento = await departamentoService.updateDepartamento(id, updateData);

      res.json(
        createSuccessResponse(
          'Departamento updated successfully',
          departamento
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error updating departamento',
          error.message,
          'UPDATE_ERROR'
        )
      );
    }
  }

  /**
   * Delete departamento
   */
  async deleteDepartamento(req, res) {
    try {
      const { id } = req.params;

      const result = await departamentoService.deleteDepartamento(id);

      res.json(
        createSuccessResponse(
          'Departamento deleted successfully',
          result
        )
      );
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 
                         error.message.includes('Cannot delete') ? 409 : 500;
      res.status(statusCode).json(
        createErrorResponse(
          'Error deleting departamento',
          error.message,
          'DELETE_ERROR'
        )
      );
    }
  }

  /**
   * Get departamentos by region
   */
  async getDepartamentosByRegion(req, res) {
    try {
      const { region } = req.params;

      const departamentos = await departamentoService.getDepartamentosByRegion(region);

      res.json(
        createSuccessResponse(
          'Departamentos by region retrieved successfully',
          { departamentos, region }
        )
      );
    } catch (error) {
      res.status(500).json(
        createErrorResponse(
          'Error retrieving departamentos by region',
          error.message,
          'FETCH_ERROR'
        )
      );
    }
  }
}

export default new DepartamentoController();
