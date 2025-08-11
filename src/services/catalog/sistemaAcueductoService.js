/**
 * Sistema de Acueducto Service
 * Provides business logic for sistemas de acueducto management
 */

import SistemaAcueducto from '../../models/catalog/SistemaAcueducto.js';
import { Op } from 'sequelize';

/**
 * Create a new sistema de acueducto
 * @param {Object} data - Sistema data
 * @param {string} data.nombre - Sistema name
 * @param {string} [data.descripcion] - Sistema description
 * @returns {Promise<Object>} Created sistema
 * @throws {Error} If creation fails or sistema already exists
 */
export const createSistemaAcueducto = async (data) => {
  try {
    // Check if sistema with same name already exists
    const existingSistema = await SistemaAcueducto.findOne({
      where: { nombre: data.nombre.trim() }
    });

    if (existingSistema) {
      throw new Error(`Sistema de acueducto with name "${data.nombre}" already exists`);
    }

    // Create new sistema
    const nuevoSistema = await SistemaAcueducto.create({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null
    });

    return nuevoSistema.toJSON();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

/**
 * Get all sistemas de acueducto with optional search and sorting
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term
 * @param {string} [options.sortBy] - Field to sort by
 * @param {string} [options.sortOrder] - Sort order (ASC/DESC)
 * @returns {Promise<Object>} Object containing sistemas array and total count
 */
export const getAllSistemasAcueducto = async (options = {}) => {
  try {
    const {
      search,
      sortBy = 'id_sistema_acueducto',
      sortOrder = 'ASC'
    } = options;

    const whereClause = {};
    
    // Add search functionality
    if (search?.trim()) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search.trim()}%` } },
        { descripcion: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    // Validate sortBy field
    const validSortFields = ['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'id_sistema_acueducto';
    const finalSortOrder = ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const sistemas = await SistemaAcueducto.findAll({
      where: whereClause,
      order: [[finalSortBy, finalSortOrder]],
      attributes: ['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at']
    });

    return {
      sistemas: sistemas.map(sistema => sistema.toJSON()),
      total: sistemas.length
    };
  } catch (error) {
    throw new Error(`Error retrieving sistemas de acueducto: ${error.message}`);
  }
};

/**
 * Get sistema de acueducto by ID
 * @param {number|string} id - Sistema ID
 * @returns {Promise<Object>} Sistema object
 * @throws {Error} If sistema not found
 */
export const getSistemaAcueductoById = async (id) => {
  try {
    const sistemaId = parseInt(id);
    if (isNaN(sistemaId)) {
      throw new Error('Invalid ID format');
    }

    const sistema = await SistemaAcueducto.findByPk(sistemaId, {
      attributes: ['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at']
    });

    if (!sistema) {
      throw new Error(`Sistema de acueducto with ID ${sistemaId} not found`);
    }

    return sistema.toJSON();
  } catch (error) {
    throw error;
  }
};

/**
 * Update sistema de acueducto
 * @param {number|string} id - Sistema ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.nombre] - Sistema name
 * @param {string} [updateData.descripcion] - Sistema description
 * @returns {Promise<Object>} Updated sistema
 * @throws {Error} If sistema not found or update fails
 */
export const updateSistemaAcueducto = async (id, updateData) => {
  try {
    const sistemaId = parseInt(id);
    if (isNaN(sistemaId)) {
      throw new Error('Invalid ID format');
    }

    const sistema = await SistemaAcueducto.findByPk(sistemaId);

    if (!sistema) {
      throw new Error(`Sistema de acueducto with ID ${sistemaId} not found`);
    }

    // Check for name uniqueness if name is being updated
    if (updateData.nombre && updateData.nombre.trim() !== sistema.nombre) {
      const existingSistema = await SistemaAcueducto.findOne({
        where: { 
          nombre: updateData.nombre.trim(),
          id_sistema_acueducto: { [Op.ne]: sistemaId }
        }
      });

      if (existingSistema) {
        throw new Error(`Sistema de acueducto with name "${updateData.nombre}" already exists`);
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (updateData.nombre !== undefined) {
      dataToUpdate.nombre = updateData.nombre.trim();
    }
    if (updateData.descripcion !== undefined) {
      dataToUpdate.descripcion = updateData.descripcion?.trim() || null;
    }

    await sistema.update(dataToUpdate);
    await sistema.reload();

    return sistema.toJSON();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

/**
 * Delete sistema de acueducto
 * @param {number|string} id - Sistema ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If sistema not found
 */
export const deleteSistemaAcueducto = async (id) => {
  try {
    const sistemaId = parseInt(id);
    if (isNaN(sistemaId)) {
      throw new Error('Invalid ID format');
    }

    const sistema = await SistemaAcueducto.findByPk(sistemaId);

    if (!sistema) {
      throw new Error(`Sistema de acueducto with ID ${sistemaId} not found`);
    }

    await sistema.destroy();

    return {
      message: 'Sistema de acueducto deleted successfully',
      id: sistemaId
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Search sistemas de acueducto by term
 * @param {string} searchTerm - Search term
 * @returns {Promise<Object>} Search results
 */
export const searchSistemasAcueducto = async (searchTerm) => {
  try {
    if (!searchTerm?.trim()) {
      throw new Error('Search term is required');
    }

    const sistemas = await SistemaAcueducto.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm.trim()}%` } },
          { descripcion: { [Op.iLike]: `%${searchTerm.trim()}%` } }
        ]
      },
      order: [['nombre', 'ASC']],
      attributes: ['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at']
    });

    return {
      sistemas: sistemas.map(sistema => sistema.toJSON()),
      total: sistemas.length,
      searchTerm: searchTerm.trim()
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get sistemas by name (exact match)
 * @param {string} nombre - Sistema name
 * @returns {Promise<Array>} Array of matching sistemas
 */
export const getSistemasByName = async (nombre) => {
  try {
    if (!nombre?.trim()) {
      throw new Error('Nombre parameter is required');
    }

    const sistemas = await SistemaAcueducto.findAll({
      where: { nombre: { [Op.iLike]: nombre.trim() } },
      order: [['created_at', 'ASC']],
      attributes: ['id_sistema_acueducto', 'nombre', 'descripcion', 'created_at', 'updated_at']
    });

    return sistemas.map(sistema => sistema.toJSON());
  } catch (error) {
    throw error;
  }
};

/**
 * Get unique nombres
 * @returns {Promise<Array>} Array of unique nombres
 */
export const getUniqueNombres = async () => {
  try {
    const nombres = await SistemaAcueducto.findAll({
      attributes: ['nombre'],
      group: ['nombre'],
      order: [['nombre', 'ASC']]
    });

    return nombres.map(item => item.nombre);
  } catch (error) {
    throw new Error(`Error retrieving unique nombres: ${error.message}`);
  }
};

/**
 * Get sistema statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getStatistics = async () => {
  try {
    const total = await SistemaAcueducto.count();
    
    const totalWithDescription = await SistemaAcueducto.count({
      where: {
        descripcion: { [Op.ne]: null }
      }
    });

    const uniqueNombres = await SistemaAcueducto.count({
      distinct: true,
      col: 'nombre'
    });

    const withoutDescription = total - totalWithDescription;

    return {
      total,
      totalWithDescription,
      uniqueNombres,
      withoutDescription
    };
  } catch (error) {
    throw new Error(`Error retrieving statistics: ${error.message}`);
  }
};

/**
 * Bulk create sistemas de acueducto
 * @param {Array} sistemasData - Array of sistema objects
 * @returns {Promise<Object>} Bulk creation result
 * @throws {Error} If validation fails or creation error occurs
 */
export const bulkCreateSistemasAcueducto = async (sistemasData) => {
  try {
    if (!Array.isArray(sistemasData) || sistemasData.length === 0) {
      throw new Error('Array of sistemas is required');
    }

    // Validate each sistema
    const processedData = sistemasData.map((sistema, index) => {
      if (!sistema.nombre?.trim()) {
        throw new Error(`Sistema at index ${index} must have a nombre`);
      }
      
      return {
        nombre: sistema.nombre.trim(),
        descripcion: sistema.descripcion?.trim() || null
      };
    });

    // Check for duplicate nombres in the array
    const nombres = processedData.map(s => s.nombre.toLowerCase());
    const duplicates = nombres.filter((nombre, index) => nombres.indexOf(nombre) !== index);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate nombres found in input: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Check for existing nombres in database
    const existingNombres = await SistemaAcueducto.findAll({
      where: {
        nombre: { [Op.in]: processedData.map(s => s.nombre) }
      },
      attributes: ['nombre']
    });

    if (existingNombres.length > 0) {
      const existing = existingNombres.map(s => s.nombre);
      throw new Error(`Sistemas already exist with nombres: ${existing.join(', ')}`);
    }

    // Bulk create
    const createdSistemas = await SistemaAcueducto.bulkCreate(processedData, {
      validate: true,
      returning: true
    });

    return {
      created: createdSistemas.map(sistema => sistema.toJSON()),
      count: createdSistemas.length
    };
  } catch (error) {
    if (error.name === 'SequelizeBulkRecordError') {
      throw new Error(`Bulk creation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};
