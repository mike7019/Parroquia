/**
 * Servicio para gestión de Estudios (Niveles Educativos)
 * Maneja toda la lógica de negocio relacionada con niveles educativos
 */

import Estudio from '../models/catalog/Estudio.js';
import { Op, Sequelize } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';

class EstudioService {
  /**
   * Obtener estadísticas de estudios
   */
  async getStats() {
    try {
      const stats = await Estudio.findAll({
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN activo = true THEN 1 END")), 'activos'],
          [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN activo = false THEN 1 END")), 'inactivos'],
          [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN \"deletedAt\" IS NOT NULL THEN 1 END")), 'eliminados']
        ],
        paranoid: false
      });

      const result = stats[0]?.dataValues || {};
      const total = parseInt(result.total) || 0;
      const activos = parseInt(result.activos) || 0;
      
      return {
        total,
        activos,
        inactivos: parseInt(result.inactivos) || 0,
        eliminados: parseInt(result.eliminados) || 0,
        porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de estudios: ${error.message}`);
    }
  }

  /**
   * Obtener todos los estudios con filtros y paginación
   */
  async getAllEstudios(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        includeInactive = false,
        orderBy = 'ordenNivel',
        orderDirection = 'ASC'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtro de búsqueda
      if (search) {
        whereClause[Op.or] = [
          { nivel: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Filtro de activos/inactivos
      if (!includeInactive) {
        whereClause.activo = true;
      }

      // Construcción del orden
      let order = [];
      const validOrderFields = ['ordenNivel', 'nivel', 'descripcion', 'activo', 'createdAt', 'updatedAt'];
      const validDirections = ['ASC', 'DESC'];

      if (validOrderFields.includes(orderBy) && validDirections.includes(orderDirection.toUpperCase())) {
        const fieldMap = {
          'ordenNivel': 'orden_nivel'
        };
        const dbField = fieldMap[orderBy] || orderBy;
        order.push([dbField, orderDirection.toUpperCase()]);
      } else {
        order.push(['orden_nivel', 'ASC'], ['nivel', 'ASC']);
      }

      const { count, rows } = await Estudio.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      return {
        estudios: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          search,
          includeInactive,
          orderBy,
          orderDirection
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener estudios: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo estudio
   */
  async createEstudio(estudioData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Validaciones
      if (!estudioData.nivel || estudioData.nivel.trim().length === 0) {
        throw new ValidationError('El nivel educativo es requerido');
      }

      // Verificar si ya existe un estudio con el mismo nivel
      const existingEstudio = await Estudio.findOne({
        where: { 
          nivel: estudioData.nivel.trim(),
          deletedAt: null
        },
        paranoid: false,
        transaction
      });

      if (existingEstudio) {
        throw new ConflictError('Ya existe un estudio con este nivel educativo');
      }

      // Crear el estudio
      const nuevoEstudio = await Estudio.create({
        nivel: estudioData.nivel.trim(),
        descripcion: estudioData.descripcion?.trim() || null,
        ordenNivel: estudioData.ordenNivel || null,
        activo: estudioData.activo !== undefined ? estudioData.activo : true
      }, { transaction });

      await transaction.commit();
      return nuevoEstudio;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error al crear estudio: ${error.message}`);
    }
  }

  /**
   * Obtener estudio por ID
   */
  async getEstudioById(id, includeInactive = false) {
    try {
      if (!id) {
        throw new ValidationError('El ID del estudio es requerido');
      }

      const whereClause = { id };
      if (!includeInactive) {
        whereClause.activo = true;
      }

      const estudio = await Estudio.findOne({
        where: whereClause
      });

      if (!estudio) {
        throw new NotFoundError('Estudio no encontrado');
      }

      return estudio;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Error al obtener estudio: ${error.message}`);
    }
  }

  /**
   * Actualizar estudio
   */
  async updateEstudio(id, updateData) {
    const transaction = await sequelize.transaction();
    
    try {
      if (!id) {
        throw new ValidationError('El ID del estudio es requerido');
      }

      const estudio = await Estudio.findByPk(id, { transaction });
      if (!estudio) {
        throw new NotFoundError('Estudio no encontrado');
      }

      // Verificar conflictos de nivel si se está actualizando
      if (updateData.nivel && updateData.nivel.trim() !== estudio.nivel) {
        const existingEstudio = await Estudio.findOne({
          where: { 
            nivel: updateData.nivel.trim(),
            id: { [Op.ne]: id },
            deletedAt: null
          },
          paranoid: false,
          transaction
        });

        if (existingEstudio) {
          throw new ConflictError('Ya existe un estudio con este nivel educativo');
        }
      }

      // Actualizar campos
      const fieldsToUpdate = {};
      if (updateData.nivel !== undefined) fieldsToUpdate.nivel = updateData.nivel.trim();
      if (updateData.descripcion !== undefined) fieldsToUpdate.descripcion = updateData.descripcion?.trim() || null;
      if (updateData.ordenNivel !== undefined) fieldsToUpdate.ordenNivel = updateData.ordenNivel;
      if (updateData.activo !== undefined) fieldsToUpdate.activo = updateData.activo;

      await estudio.update(fieldsToUpdate, { transaction });
      await transaction.commit();

      return estudio.reload();
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error al actualizar estudio: ${error.message}`);
    }
  }

  /**
   * Eliminar estudio (soft delete)
   */
  async deleteEstudio(id) {
    const transaction = await sequelize.transaction();
    
    try {
      if (!id) {
        throw new ValidationError('El ID del estudio es requerido');
      }

      const estudio = await Estudio.findByPk(id, { transaction });
      if (!estudio) {
        throw new NotFoundError('Estudio no encontrado');
      }

      // Soft delete
      await estudio.destroy({ transaction });
      await transaction.commit();

      return { message: 'Estudio eliminado exitosamente' };
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Error al eliminar estudio: ${error.message}`);
    }
  }

  /**
   * Restaurar estudio eliminado
   */
  async restoreEstudio(id) {
    const transaction = await sequelize.transaction();
    
    try {
      if (!id) {
        throw new ValidationError('El ID del estudio es requerido');
      }

      const estudio = await Estudio.findByPk(id, { 
        paranoid: false,
        transaction 
      });

      if (!estudio) {
        throw new NotFoundError('Estudio no encontrado');
      }

      if (!estudio.deletedAt) {
        throw new ConflictError('El estudio no está eliminado');
      }

      // Verificar conflictos antes de restaurar
      const existingActive = await Estudio.findOne({
        where: { 
          nivel: estudio.nivel,
          deletedAt: null
        },
        paranoid: false,
        transaction
      });

      if (existingActive) {
        throw new ConflictError('Ya existe un estudio activo con este nivel educativo');
      }

      await estudio.restore({ transaction });
      await transaction.commit();

      return estudio.reload();
    } catch (error) {
      await transaction.rollback();
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error al restaurar estudio: ${error.message}`);
    }
  }

  /**
   * Buscar estudios
   */
  async searchEstudios(searchTerm, options = {}) {
    try {
      const { limit = 10, includeInactive = false } = options;

      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new ValidationError('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const whereClause = {
        [Op.or]: [
          { nivel: { [Op.iLike]: `%${searchTerm.trim()}%` } },
          { descripcion: { [Op.iLike]: `%${searchTerm.trim()}%` } }
        ]
      };

      if (!includeInactive) {
        whereClause.activo = true;
      }

      const estudios = await Estudio.findAll({
        where: whereClause,
        limit: parseInt(limit),
        order: [['orden_nivel', 'ASC'], ['nivel', 'ASC']]
      });

      return estudios;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Error al buscar estudios: ${error.message}`);
    }
  }
}

export default new EstudioService();
