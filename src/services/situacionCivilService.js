/**
 * Servicio para gestión de Situaciones Civiles
 * Contiene toda la lógica de negocio para el CRUD de situaciones civiles
 */

import { Op, ValidationError, UniqueConstraintError } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import { 
  NotFoundError, 
  ValidationError as CustomValidationError, 
  ConflictError 
} from '../utils/errors.js';

const { SituacionCivil } = sequelize.models;

class SituacionCivilService {
  
  /**
   * Obtiene todas las situaciones civiles con paginación y filtros
   */
  static async getAllSituacionesCiviles(options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      includeInactive = false,
      orderBy = 'orden',
      orderDirection = 'ASC'
    } = options;

    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtro de búsqueda
      if (search.trim()) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search.trim()}%` } },
          { descripcion: { [Op.iLike]: `%${search.trim()}%` } },
          { codigo: { [Op.iLike]: `%${search.trim()}%` } }
        ];
      }

      // Filtro de activos/inactivos
      if (!includeInactive) {
        whereClause.activo = true;
      }

      // Validar campo de ordenamiento
      const validOrderFields = ['orden', 'nombre', 'codigo', 'createdAt', 'updatedAt'];
      const orderField = validOrderFields.includes(orderBy) ? orderBy : 'orden';
      const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const { count, rows } = await SituacionCivil.findAndCountAll({
        where: whereClause,
        order: [
          [orderField, direction],
          ['nombre', 'ASC'] // Orden secundario
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        paranoid: !includeInactive // Si incluye inactivos, mostrar también eliminados
      });

      return {
        situacionesCiviles: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        },
        filters: {
          search,
          includeInactive,
          orderBy: orderField,
          orderDirection: direction
        }
      };

    } catch (error) {
      console.error('Error en getAllSituacionesCiviles:', error);
      throw error;
    }
  }

  /**
   * Obtiene una situación civil por ID
   */
  static async getSituacionCivilById(id, includeInactive = false) {
    try {
      const situacionCivil = await SituacionCivil.findByPk(id, {
        paranoid: !includeInactive
      });

      if (!situacionCivil) {
        throw new NotFoundError(`Situación civil con ID ${id} no encontrada`);
      }

      return situacionCivil;

    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('Error en getSituacionCivilById:', error);
      throw new Error('Error al obtener la situación civil');
    }
  }

  /**
   * Crea una nueva situación civil
   */
  static async createSituacionCivil(data) {
    const transaction = await sequelize.transaction();

    try {
      // Validaciones adicionales
      await this._validateSituacionCivilData(data);

      const situacionCivil = await SituacionCivil.create(data, { transaction });

      await transaction.commit();
      return situacionCivil;

    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof ValidationError) {
        throw new CustomValidationError('Datos de situación civil inválidos', error.errors);
      }
      
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0]?.path;
        const value = error.errors[0]?.value;
        throw new ConflictError(`Ya existe una situación civil con ${field}: ${value}`);
      }

      console.error('Error en createSituacionCivil:', error);
      throw error;
    }
  }

  /**
   * Actualiza una situación civil existente
   */
  static async updateSituacionCivil(id, data) {
    const transaction = await sequelize.transaction();

    try {
      const situacionCivil = await this.getSituacionCivilById(id);
      
      // Validaciones adicionales
      await this._validateSituacionCivilData(data, id);

      await situacionCivil.update(data, { transaction });
      await transaction.commit();

      return situacionCivil;

    } catch (error) {
      await transaction.rollback();
      
      if (error instanceof ValidationError) {
        throw new CustomValidationError('Datos de situación civil inválidos', error.errors);
      }
      
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0]?.path;
        const value = error.errors[0]?.value;
        throw new ConflictError(`Ya existe una situación civil con ${field}: ${value}`);
      }

      console.error('Error en updateSituacionCivil:', error);
      throw error;
    }
  }

  /**
   * Elimina una situación civil (soft delete)
   */
  static async deleteSituacionCivil(id) {
    const transaction = await sequelize.transaction();

    try {
      const situacionCivil = await this.getSituacionCivilById(id);

      // Verificar si tiene relaciones activas (si existen)
      // TODO: Implementar verificación de relaciones cuando se definan

      await situacionCivil.update({ activo: false }, { transaction });
      await situacionCivil.destroy({ transaction });

      await transaction.commit();
      return { message: 'Situación civil eliminada exitosamente' };

    } catch (error) {
      await transaction.rollback();
      console.error('Error en deleteSituacionCivil:', error);
      throw error;
    }
  }

  /**
   * Restaura una situación civil eliminada
   */
  static async restoreSituacionCivil(id) {
    const transaction = await sequelize.transaction();

    try {
      const situacionCivil = await SituacionCivil.findByPk(id, {
        paranoid: false,
        transaction
      });

      if (!situacionCivil) {
        throw new NotFoundError(`Situación civil con ID ${id} no encontrada`);
      }

      if (!situacionCivil.deletedAt) {
        throw new ConflictError('La situación civil no está eliminada');
      }

      await situacionCivil.restore({ transaction });
      await situacionCivil.update({ activo: true }, { transaction });

      await transaction.commit();
      return situacionCivil;

    } catch (error) {
      await transaction.rollback();
      console.error('Error en restoreSituacionCivil:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de situaciones civiles
   */
  static async getSituacionCivilStats() {
    try {
      const [total, activos, inactivos, eliminados] = await Promise.all([
        SituacionCivil.count({ paranoid: false }),
        SituacionCivil.count({ where: { activo: true } }),
        SituacionCivil.count({ where: { activo: false } }),
        SituacionCivil.count({ paranoid: false, where: { deletedAt: { [Op.ne]: null } } })
      ]);

      return {
        total,
        activos,
        inactivos,
        eliminados,
        porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0
      };

    } catch (error) {
      console.error('Error en getSituacionCivilStats:', error);
      throw new Error('Error al obtener estadísticas de situaciones civiles');
    }
  }

  /**
   * Busca situaciones civiles por término
   */
  static async searchSituacionesCiviles(searchTerm, options = {}) {
    try {
      const { limit = 10, includeInactive = false } = options;

      const whereClause = {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm}%` } },
          { descripcion: { [Op.iLike]: `%${searchTerm}%` } },
          { codigo: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      if (!includeInactive) {
        whereClause.activo = true;
      }

      const situacionesCiviles = await SituacionCivil.findAll({
        where: whereClause,
        order: [['orden', 'ASC'], ['nombre', 'ASC']],
        limit: parseInt(limit),
        paranoid: !includeInactive
      });

      return situacionesCiviles;

    } catch (error) {
      console.error('Error en searchSituacionesCiviles:', error);
      throw new Error('Error en la búsqueda de situaciones civiles');
    }
  }

  /**
   * Validaciones adicionales de datos
   */
  static async _validateSituacionCivilData(data, excludeId = null) {
    const errors = [];

    // Validar nombre único
    if (data.nombre) {
      const whereClause = { nombre: data.nombre.trim() };
      if (excludeId) {
        whereClause.id_situacion_civil = { [Op.ne]: excludeId };
      }

      const existingByNombre = await SituacionCivil.findOne({ where: whereClause });
      if (existingByNombre) {
        errors.push({
          field: 'nombre',
          message: 'Ya existe una situación civil con este nombre'
        });
      }
    }

    // Validar código único si se proporciona
    if (data.codigo) {
      const whereClause = { codigo: data.codigo.trim().toUpperCase() };
      if (excludeId) {
        whereClause.id_situacion_civil = { [Op.ne]: excludeId };
      }

      const existingByCodigo = await SituacionCivil.findOne({ where: whereClause });
      if (existingByCodigo) {
        errors.push({
          field: 'codigo',
          message: 'Ya existe una situación civil con este código'
        });
      }
    }

    if (errors.length > 0) {
      throw new CustomValidationError('Errores de validación', errors);
    }
  }
}

export default SituacionCivilService;
