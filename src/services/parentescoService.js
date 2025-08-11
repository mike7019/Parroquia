import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import Parentesco from '../models/catalog/Parentesco.js';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../utils/errors.js';

/**
 * Servicio para gestión de parentescos con operaciones CRUD completas
 */
class ParentescoService {
  /**
   * Obtener todos los parentescos activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de parentescos
   */
  static async getAllParentescos(options = {}) {
    try {
      const { includeInactive = false, page, limit, search } = options;
      
      let where = {};
      
      // Filtro por estado activo/inactivo
      if (!includeInactive) {
        where.activo = true;
      }
      
      // Filtro de búsqueda por nombre
      if (search) {
        where.nombre = {
          [Op.iLike]: `%${search}%`
        };
      }
      
      const queryOptions = {
        where,
        order: [['nombre', 'ASC']]
      };
      
      // Paginación si se especifica
      if (page && limit) {
        const offset = (page - 1) * limit;
        queryOptions.limit = parseInt(limit);
        queryOptions.offset = offset;
      }
      
      const parentescos = await Parentesco.findAll(queryOptions);
      
      // Si hay paginación, también devolver el total
      if (page && limit) {
        const total = await Parentesco.count({ where });
        return {
          parentescos,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        };
      }
      
      return parentescos;
    } catch (error) {
      throw new ValidationError('Error al obtener parentescos: ' + error.message);
    }
  }

  /**
   * Obtener parentesco por ID
   * @param {number} id - ID del parentesco
   * @returns {Promise<Object>} Parentesco encontrado
   */
  static async getParentescoById(id) {
    try {
      const parentesco = await Parentesco.findByPk(id);
      
      if (!parentesco) {
        throw new NotFoundError('Parentesco no encontrado');
      }
      
      return parentesco;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ValidationError('Error al obtener parentesco: ' + error.message);
    }
  }

  /**
   * Crear un nuevo parentesco
   * @param {Object} parentescoData - Datos del parentesco
   * @returns {Promise<Object>} Parentesco creado
   */
  static async createParentesco(parentescoData) {
    const transaction = await sequelize.transaction();
    
    try {
      const { nombre, descripcion } = parentescoData;
      
      // Validar datos requeridos
      if (!nombre || nombre.trim() === '') {
        throw new ValidationError('El nombre del parentesco es requerido');
      }
      
      // Verificar que no exista un parentesco con el mismo nombre
      const existingParentesco = await Parentesco.findOne({
        where: {
          nombre: {
            [Op.iLike]: nombre.trim()
          }
        }
      }, { transaction });
      
      if (existingParentesco) {
        throw new ConflictError('Ya existe un parentesco con ese nombre');
      }
      
      // Crear el parentesco
      const nuevoParentesco = await Parentesco.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        activo: true
      }, { transaction });
      
      await transaction.commit();
      
      return nuevoParentesco;
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      
      throw new ValidationError('Error al crear parentesco: ' + error.message);
    }
  }

  /**
   * Actualizar un parentesco existente
   * @param {number} id - ID del parentesco
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Parentesco actualizado
   */
  static async updateParentesco(id, updateData) {
    const transaction = await sequelize.transaction();
    
    try {
      const parentesco = await Parentesco.findByPk(id, { transaction });
      
      if (!parentesco) {
        throw new NotFoundError('Parentesco no encontrado');
      }
      
      const { nombre, descripcion, activo } = updateData;
      
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (nombre && nombre.trim() !== parentesco.nombre) {
        const existingParentesco = await Parentesco.findOne({
          where: {
            nombre: {
              [Op.iLike]: nombre.trim()
            },
            id_parentesco: {
              [Op.ne]: id
            }
          }
        }, { transaction });
        
        if (existingParentesco) {
          throw new ConflictError('Ya existe un parentesco con ese nombre');
        }
      }
      
      // Preparar datos de actualización
      const updateFields = {};
      
      if (nombre !== undefined) {
        updateFields.nombre = nombre.trim();
      }
      
      if (descripcion !== undefined) {
        updateFields.descripcion = descripcion?.trim() || null;
      }
      
      if (activo !== undefined) {
        updateFields.activo = Boolean(activo);
      }
      
      // Actualizar el parentesco
      await parentesco.update(updateFields, { transaction });
      
      await transaction.commit();
      
      return parentesco;
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof NotFoundError || 
          error instanceof ConflictError || 
          error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError('Error al actualizar parentesco: ' + error.message);
    }
  }

  /**
   * Eliminar un parentesco (soft delete)
   * @param {number} id - ID del parentesco
   * @returns {Promise<void>}
   */
  static async deleteParentesco(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const parentesco = await Parentesco.findByPk(id, { transaction });
      
      if (!parentesco) {
        throw new NotFoundError('Parentesco no encontrado');
      }
      
      if (!parentesco.activo) {
        throw new ValidationError('El parentesco ya está inactivo');
      }
      
      // Soft delete: cambiar activo a false
      await parentesco.update({
        activo: false
      }, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError('Error al eliminar parentesco: ' + error.message);
    }
  }

  /**
   * Restaurar un parentesco eliminado
   * @param {number} id - ID del parentesco
   * @returns {Promise<Object>} Parentesco restaurado
   */
  static async restoreParentesco(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const parentesco = await Parentesco.findByPk(id, { transaction });
      
      if (!parentesco) {
        throw new NotFoundError('Parentesco no encontrado');
      }
      
      if (parentesco.activo) {
        throw new ValidationError('El parentesco ya está activo');
      }
      
      // Verificar que no haya conflicto de nombres con parentescos activos
      const existingActiveParentesco = await Parentesco.findOne({
        where: {
          nombre: {
            [Op.iLike]: parentesco.nombre
          },
          activo: true,
          id_parentesco: {
            [Op.ne]: id
          }
        }
      }, { transaction });
      
      if (existingActiveParentesco) {
        throw new ConflictError('Ya existe un parentesco activo con ese nombre');
      }
      
      // Restaurar: cambiar activo a true
      await parentesco.update({
        activo: true
      }, { transaction });
      
      await transaction.commit();
      
      return parentesco;
    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof NotFoundError || 
          error instanceof ValidationError || 
          error instanceof ConflictError) {
        throw error;
      }
      
      throw new ValidationError('Error al restaurar parentesco: ' + error.message);
    }
  }

  /**
   * Obtener estadísticas de parentescos
   * @returns {Promise<Object>} Estadísticas
   */
  static async getParentescoStats() {
    try {
      const [total, activos, inactivos] = await Promise.all([
        Parentesco.count(),
        Parentesco.count({ where: { activo: true } }),
        Parentesco.count({ where: { activo: false } })
      ]);
      
      return {
        total,
        activos,
        inactivos,
        porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0
      };
    } catch (error) {
      throw new ValidationError('Error al obtener estadísticas: ' + error.message);
    }
  }
}

export default ParentescoService;
