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
      sortBy = 'nombre',
      sortOrder = 'ASC'
    } = req.query;

    const options = {
      search,
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    };

    const sistemas = await getAllSistemasAcueductoService(options);

    res.json(
      createSuccessResponse(
        'Sistemas de acueducto retrieved successfully',
        sistemas
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error retrieving sistemas de acueducto',
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

    if (!id || isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
      );
    }

    const sistemaAcueducto = await getSistemaAcueductoByIdService(id);

    res.json(
      createSuccessResponse(
        'Sistema de acueducto retrieved successfully',
        sistemaAcueducto
      )
    );
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto not found', null, 'NOT_FOUND')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error retrieving sistema de acueducto',
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

    if (!nombre) {
      return res.status(400).json(
        createErrorResponse('Nombre is required', null, 'VALIDATION_ERROR')
      );
    }

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
    if (error.message.includes('already exists')) {
      return res.status(409).json(
        createErrorResponse('Sistema de acueducto ya existe', null, 'DUPLICATE_ERROR')
      );
    }
    
    res.status(500).json(
      createErrorResponse(
        'Error creating sistema de acueducto',
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

    if (!id || isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
      );
    }

    if (!nombre && descripcion === undefined) {
      return res.status(400).json(
        createErrorResponse('At least one field (nombre, descripcion) is required for update', null, 'VALIDATION_ERROR')
      );
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;

    const sistemaAcueducto = await updateSistemaAcueductoService(id, updateData);
    
    res.json(
      createSuccessResponse(
        'Sistema de acueducto updated successfully',
        sistemaAcueducto
      )
    );
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto not found', null, 'NOT_FOUND')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error updating sistema de acueducto',
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

    if (!id || isNaN(id)) {
      return res.status(400).json(
        createErrorResponse('Valid ID is required', null, 'VALIDATION_ERROR')
      );
    }

    await deleteSistemaAcueductoService(id);

    res.json(
      createSuccessResponse(
        'Sistema de acueducto deleted successfully',
        { id }
      )
    );
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json(
        createErrorResponse('Sistema de acueducto not found', null, 'NOT_FOUND')
      );
    }

    res.status(500).json(
      createErrorResponse(
        'Error deleting sistema de acueducto',
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

    if (!query) {
      return res.status(400).json(
        createErrorResponse('Search query is required', null, 'VALIDATION_ERROR')
      );
    }

    const result = await searchSistemasAcueductoService(query);

    res.json(
      createSuccessResponse(
        'Search completed successfully',
        result
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error performing search',
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

    if (!nombre) {
      return res.status(400).json(
        createErrorResponse('Nombre parameter is required', null, 'VALIDATION_ERROR')
      );
    }

    const sistemas = await getSistemasByNameService(nombre);

    res.json(
      createSuccessResponse(
        'Sistemas retrieved by name successfully',
        sistemas
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error retrieving sistemas by name',
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
        'Unique nombres retrieved successfully',
        nombres
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error retrieving unique nombres',
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
        'Statistics retrieved successfully',
        statistics
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error retrieving statistics',
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

    if (!Array.isArray(sistemas) || sistemas.length === 0) {
      return res.status(400).json(
        createErrorResponse('Array of sistemas is required', null, 'VALIDATION_ERROR')
      );
    }

    // Validate each sistema
    for (const sistema of sistemas) {
      if (!sistema.nombre) {
        return res.status(400).json(
          createErrorResponse('All sistemas must have a nombre', null, 'VALIDATION_ERROR')
        );
      }
    }

    const result = await bulkCreateSistemasAcueductoService(sistemas);

    res.status(201).json(
      createSuccessResponse(
        'Sistemas de acueducto created successfully',
        result
      )
    );
  } catch (error) {
    res.status(500).json(
      createErrorResponse(
        'Error creating sistemas de acueducto',
        error.message,
        'BULK_CREATE_ERROR'
      )
    );
  }
};
