import parentescoService from '../../services/catalog/parentescoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

class ParentescoController {
  
  /**
   * Obtener todos los parentescos
   */
  async getAllParentescos(req, res) {
    try {
      const result = await parentescoService.getAllParentescos();
      
      res.json(createSuccessResponse(
        'Parentescos obtenidos exitosamente',
        result.data
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Error al obtener parentescos',
        error.message,
        'FETCH_ERROR'
      ));
    }
  }

  /**
   * Obtener parentesco por ID
   */
  async getParentescoById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de parentesco válido es requerido',
          null,
          'VALIDATION_ERROR'
        ));
      }

      const parentesco = await parentescoService.getParentescoById(parseInt(id));
      
      res.json(createSuccessResponse(
        'Parentesco obtenido exitosamente',
        parentesco
      ));
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json(createErrorResponse(
        error.message.includes('not found') || error.message.includes('no encontrado') ? 'Parentesco no encontrado' : 'Error al obtener parentesco',
        error.message,
        error.message.includes('not found') || error.message.includes('no encontrado') ? 'NOT_FOUND' : 'FETCH_ERROR'
      ));
    }
  }

  /**
   * Crear nuevo parentesco
   */
  async createParentesco(req, res) {
    try {
      const { nombre, descripcion } = req.body;
      
      // Validación básica
      if (!nombre) {
        return res.status(400).json(createErrorResponse(
          'El nombre del parentesco es obligatorio',
          null,
          'VALIDATION_ERROR'
        ));
      }

      const nuevoParentesco = await parentescoService.createParentesco({ nombre, descripcion });
      
      res.status(201).json(createSuccessResponse(
        'Parentesco creado exitosamente',
        nuevoParentesco
      ));
    } catch (error) {
      if (error.message.includes('ya existe') || error.message.includes('already exists')) {
        return res.status(409).json(createErrorResponse(
          'Ya existe un parentesco con ese nombre',
          error.message,
          'DUPLICATE_ERROR'
        ));
      }

      res.status(500).json(createErrorResponse(
        'Error al crear el parentesco',
        error.message,
        'CREATE_ERROR'
      ));
    }
  }

  /**
   * Actualizar parentesco
   */
  async updateParentesco(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de parentesco válido es requerido',
          null,
          'VALIDATION_ERROR'
        ));
      }

      const parentescoActualizado = await parentescoService.updateParentesco(parseInt(id), { nombre, descripcion });
      
      res.json(createSuccessResponse(
        'Parentesco actualizado exitosamente',
        parentescoActualizado
      ));
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('no encontrado')) {
        return res.status(404).json(createErrorResponse(
          'Parentesco no encontrado',
          error.message,
          'NOT_FOUND'
        ));
      }

      if (error.message.includes('ya existe') || error.message.includes('already exists')) {
        return res.status(409).json(createErrorResponse(
          'Ya existe un parentesco con ese nombre',
          error.message,
          'DUPLICATE_ERROR'
        ));
      }

      res.status(500).json(createErrorResponse(
        'Error al actualizar el parentesco',
        error.message,
        'UPDATE_ERROR'
      ));
    }
  }

  /**
   * Eliminar parentesco
   */
  async deleteParentesco(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json(createErrorResponse(
          'ID de parentesco válido es requerido',
          null,
          'VALIDATION_ERROR'
        ));
      }

      await parentescoService.deleteParentesco(parseInt(id));
      
      res.json(createSuccessResponse(
        'Parentesco eliminado exitosamente',
        null
      ));
    } catch (error) {
      const statusCode = error.message.includes('not found') || error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json(createErrorResponse(
        error.message.includes('not found') || error.message.includes('no encontrado') ? 'Parentesco no encontrado' : 'Error al eliminar parentesco',
        error.message,
        error.message.includes('not found') || error.message.includes('no encontrado') ? 'NOT_FOUND' : 'DELETE_ERROR'
      ));
    }
  }
}

export default new ParentescoController();
