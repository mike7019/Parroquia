import {
  createSistemaAcueducto as createSistemaAcueductoService,
  getAllSistemasAcueducto as getAllSistemasAcueductoService,
  getSistemaAcueductoById as getSistemaAcueductoByIdService,
  updateSistemaAcueducto as updateSistemaAcueductoService,
  deleteSistemaAcueducto as deleteSistemaAcueductoService,
  searchSistemasAcueducto as searchSistemasAcueductoService,
  getSistemasByName as getSistemasByNameService,
  getUniqueNombres as getUniqueNombresService,
  getStatistics as getStatisticsService,
  bulkCreateSistemasAcueducto as bulkCreateSistemasAcueductoService
} from '../../services/catalog/sistemaAcueductoService.js';
import { createSuccessResponse, createErrorResponse } from '../../utils/responses.js';

/**
 * Sistema de Acueducto Controller
 * Handles HTTP requests for sistemas de acueducto management
 */

/**
 * Get all sistemas de acueducto
 */
export const getAllSistemasAcueducto = async (req, res) => {
  try {
    const {
      search,
      sortBy = 'id_sistema_acueducto',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      search,
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const result = await getAllSistemasAcueductoService(options);

    res.json(
      createSuccessResponse(
        'Sistemas de acueducto obtenidos exitosamente',
        result
      )
    );
  } catch (error) {
    console.error('Error in getAllSistemasAcueducto:', error);
    res.status(500).json(
      createErrorResponse(
        'Error al obtener sistemas de acueducto',
        error.message,
        'FETCH_ERROR'
      )
    );
  }
};

/**
 * Get sistema de acueducto by ID
 */
export const getSistemaAcueductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const sistemaAcueducto = await getSistemaAcueductoByIdService(id);

    res.json(
      createSuccessResponse(
        'Sistema de acueducto obtenido exitosamente',
        sistemaAcueducto
      )
    );
  } catch (error) {
    console.error('Error in getSistemaAcueductoById:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto no encontrado', null, 'NOT_FOUND')
      );
    }

    if (error.message.includes('Invalid ID format')) {
      return res.status(400).json(
        createErrorResponse('Formato de ID inválido', null, 'VALIDATION_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al obtener sistema de acueducto',
        error.message,
        'FETCH_ERROR'
      )
    );
  }
};

/**
 * Create a new sistema de acueducto
 */
export const createSistemaAcueducto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const sistemaAcueducto = await createSistemaAcueductoService({ 
      nombre, 
      descripcion 
    });
    
    res.status(201).json(
      createSuccessResponse(
        'Sistema de acueducto creado exitosamente',
        sistemaAcueducto
      )
    );
  } catch (error) {
    console.error('Error in createSistemaAcueducto:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json(
        createErrorResponse('El sistema de acueducto ya existe', error.message, 'DUPLICATE_ERROR')
      );
    }

    if (error.message.includes('Validation error')) {
      return res.status(400).json(
        createErrorResponse('Error de validación', error.message, 'VALIDATION_ERROR')
      );
    }
    
    res.status(500).json(
      createErrorResponse(
        'Error al crear sistema de acueducto',
        error.message,
        'CREATE_ERROR'
      )
    );
  }
};

/**
 * Update sistema de acueducto
 */
export const updateSistemaAcueducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;

    const sistemaAcueducto = await updateSistemaAcueductoService(id, updateData);
    
    res.json(
      createSuccessResponse(
        'Sistema de acueducto actualizado exitosamente',
        sistemaAcueducto
      )
    );
  } catch (error) {
    console.error('Error in updateSistemaAcueducto:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto no encontrado', null, 'NOT_FOUND')
      );
    }

    if (error.message.includes('already exists')) {
      return res.status(409).json(
        createErrorResponse('Ya existe un sistema con ese nombre', error.message, 'DUPLICATE_ERROR')
      );
    }

    if (error.message.includes('Invalid ID format') || error.message.includes('Validation error')) {
      return res.status(400).json(
        createErrorResponse('Error de validación', error.message, 'VALIDATION_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al actualizar sistema de acueducto',
        error.message,
        'UPDATE_ERROR'
      )
    );
  }
};

/**
 * Delete sistema de acueducto
 */
export const deleteSistemaAcueducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteSistemaAcueductoService(id);

    res.json(
      createSuccessResponse(
        'Sistema de acueducto eliminado exitosamente',
        result
      )
    );
  } catch (error) {
    console.error('Error in deleteSistemaAcueducto:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto no encontrado', null, 'NOT_FOUND')
      );
    }

    if (error.message.includes('Invalid ID format')) {
      return res.status(400).json(
        createErrorResponse('Formato de ID inválido', null, 'VALIDATION_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al eliminar sistema de acueducto',
        error.message,
        'DELETE_ERROR'
      )
    );
  }
};

/**
 * Search sistemas de acueducto
 */
export const searchSistemasAcueducto = async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchSistemasAcueductoService(query);

    res.json(
      createSuccessResponse(
        'Búsqueda completada exitosamente',
        result
      )
    );
  } catch (error) {
    console.error('Error in searchSistemasAcueducto:', error);
    
    if (error.message.includes('required')) {
      return res.status(400).json(
        createErrorResponse('Término de búsqueda requerido', null, 'VALIDATION_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al realizar la búsqueda',
        error.message,
        'SEARCH_ERROR'
      )
    );
  }
};

/**
 * Get sistemas by name
 */
export const getSistemasByName = async (req, res) => {
  try {
    const { nombre } = req.params;
    const sistemas = await getSistemasByNameService(nombre);

    res.json(
      createSuccessResponse(
        'Sistemas obtenidos por nombre exitosamente',
        sistemas
      )
    );
  } catch (error) {
    console.error('Error in getSistemasByName:', error);
    
    if (error.message.includes('required')) {
      return res.status(400).json(
        createErrorResponse('Parámetro nombre requerido', null, 'VALIDATION_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al obtener sistemas por nombre',
        error.message,
        'FETCH_ERROR'
      )
    );
  }
};

/**
 * Get unique nombres
 */
export const getUniqueNombres = async (req, res) => {
  try {
    const nombres = await getUniqueNombresService();

    res.json(
      createSuccessResponse(
        'Nombres únicos obtenidos exitosamente',
        nombres
      )
    );
  } catch (error) {
    console.error('Error in getUniqueNombres:', error);
    res.status(500).json(
      createErrorResponse(
        'Error al obtener nombres únicos',
        error.message,
        'FETCH_ERROR'
      )
    );
  }
};

/**
 * Get statistics
 */
export const getStatistics = async (req, res) => {
  try {
    const statistics = await getStatisticsService();

    res.json(
      createSuccessResponse(
        'Estadísticas obtenidas exitosamente',
        statistics
      )
    );
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json(
      createErrorResponse(
        'Error al obtener estadísticas',
        error.message,
        'STATS_ERROR'
      )
    );
  }
};

/**
 * Bulk create sistemas de acueducto
 */
export const bulkCreateSistemasAcueducto = async (req, res) => {
  try {
    const { sistemas } = req.body;
    const result = await bulkCreateSistemasAcueductoService(sistemas);

    res.status(201).json(
      createSuccessResponse(
        'Sistemas de acueducto creados exitosamente',
        result
      )
    );
  } catch (error) {
    console.error('Error in bulkCreateSistemasAcueducto:', error);
    
    if (error.message.includes('Array of sistemas is required') || 
        error.message.includes('must have a nombre') ||
        error.message.includes('Duplicate nombres') ||
        error.message.includes('Bulk creation error')) {
      return res.status(400).json(
        createErrorResponse('Error de validación', error.message, 'VALIDATION_ERROR')
      );
    }

    if (error.message.includes('already exist')) {
      return res.status(409).json(
        createErrorResponse('Sistemas duplicados', error.message, 'DUPLICATE_ERROR')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error al crear sistemas de acueducto',
        error.message,
        'BULK_CREATE_ERROR'
      )
    );
  }
};
