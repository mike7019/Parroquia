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

// Obtener el modelo SituacionCivil desde Sequelize una vez que se cargue
const getSituacionCivilModel = () => sequelize.models.SituacionCivil;

class SituacionCivilService {
  
  /**
   * Función para encontrar el próximo ID disponible reutilizando gaps
   */
  static async findNextAvailableId() {
    try {
      // Obtener todos los IDs de registros ACTIVOS (no eliminados lógicamente)
      const activeIds = await getSituacionCivilModel().findAll({
        attributes: ['id_situacion_civil'],
        order: [['id_situacion_civil', 'ASC']],
        raw: true,
        paranoid: true // Solo registros activos (no soft deleted)
      });

      // Si no hay registros activos, empezar desde 1
      if (activeIds.length === 0) {
        console.log(`🆕 Primer registro - Usando ID 1`);
        return 1;
      }

      // Extraer solo los números de ID de registros activos
      const usedIds = activeIds.map(item => item.id_situacion_civil).sort((a, b) => a - b);
      
      // Buscar el primer gap en la secuencia (ID libre para reutilizar)
      for (let i = 1; i <= usedIds[usedIds.length - 1]; i++) {
        if (!usedIds.includes(i)) {
          console.log(`🔄 Reutilizando ID ${i} (gap de registro eliminado)`);
          return i;
        }
      }

      // Si no hay gaps, usar el siguiente ID después del último activo
      const nextId = usedIds[usedIds.length - 1] + 1;
      console.log(`➕ Usando nuevo ID ${nextId} (secuencial)`);
      return nextId;
    } catch (error) {
      console.error('Error finding next available ID for situacion civil:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las situaciones civiles con filtros
   */
  static async getAllSituacionesCiviles(options = {}) {
    const {
      search = '',
      includeInactive = false,
      orderBy = 'orden',
      orderDirection = 'ASC'
    } = options;

    try {
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

      const situacionesCiviles = await getSituacionCivilModel().findAll({
        where: whereClause,
        order: [
          [orderField, direction],
          ['nombre', 'ASC'] // Orden secundario
        ],
        paranoid: !includeInactive // Si incluye inactivos, mostrar también eliminados
      });

      return situacionesCiviles;

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
      const situacionCivil = await getSituacionCivilModel().findByPk(id, {
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
      // Simplificar datos - solo requerir nombre y descripción opcional
      const simplifiedData = {
        nombre: data.nombre,
        descripcion: data.descripcion || null
      };

      // Los campos codigo, orden y activo son completamente opcionales
      // Si no se proporcionan, el modelo manejará los valores por defecto
      if (data.codigo !== undefined && data.codigo !== null && data.codigo.trim() !== '') {
        simplifiedData.codigo = data.codigo;
      }
      
      if (data.orden !== undefined && data.orden !== null) {
        simplifiedData.orden = data.orden;
      }
      
      if (data.activo !== undefined && data.activo !== null) {
        simplifiedData.activo = data.activo;
      }

      // Validaciones adicionales solo para los campos que se proporcionan
      await this._validateSituacionCivilData(simplifiedData, null, false); // false = isCreate

      // Find the next available ID
      const nextId = await this.findNextAvailableId();
      simplifiedData.id_situacion_civil = nextId;

      const situacionCivil = await getSituacionCivilModel().create(simplifiedData, { transaction });

      await transaction.commit();
      
      // Devolver solo los campos requeridos para la respuesta de creación
      return {
        id: situacionCivil.id_situacion_civil,
        nombre: situacionCivil.nombre,
        descripcion: situacionCivil.descripcion,
        createdAt: situacionCivil.createdAt,
        updatedAt: situacionCivil.updatedAt
      };

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
      await this._validateSituacionCivilData(data, id, true); // true = isUpdate

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
   * Elimina una situación civil (físicamente para permitir reutilización de ID)
   */
  static async deleteSituacionCivil(id) {
    const transaction = await sequelize.transaction();

    try {
      const situacionCivil = await this.getSituacionCivilById(id);

      // TODO: Verificar si tiene relaciones activas (si existen)
      // Por ahora hacemos eliminación física para permitir reutilización de IDs

      // Eliminación física directa
      await situacionCivil.destroy({ force: true, transaction });

      await transaction.commit();
      console.log(`🗑️ Eliminación física del ID ${id} completada (ID reutilizable)`);
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
      const situacionCivil = await getSituacionCivilModel().findByPk(id, {
        paranoid: false,
        transaction
      });

      if (!situacionCivil) {
        throw new NotFoundError(`Situación civil con ID ${id} no encontrada`);
      }

      if (!situacionCivil.fechaEliminacion) {
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
        getSituacionCivilModel().count({ paranoid: false }),
        getSituacionCivilModel().count({ where: { activo: true } }),
        getSituacionCivilModel().count({ where: { activo: false } }),
        getSituacionCivilModel().count({ paranoid: false, where: { fechaEliminacion: { [Op.ne]: null } } })
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

      const situacionesCiviles = await getSituacionCivilModel().findAll({
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
  static async _validateSituacionCivilData(data, excludeId = null, isUpdate = false) {
    const errors = [];

    // Validar nombre único (requerido solo en creación, opcional en actualización)
    if (data.nombre) {
      const whereClause = { nombre: data.nombre.trim() };
      if (excludeId) {
        whereClause.id_situacion_civil = { [Op.ne]: excludeId };
      }

      const existingByNombre = await getSituacionCivilModel().findOne({ where: whereClause });
      if (existingByNombre) {
        errors.push({
          field: 'nombre',
          message: 'Ya existe una situación civil con este nombre'
        });
      }
    } else if (!isUpdate) {
      // Solo requerir nombre en creación, no en actualización
      errors.push({
        field: 'nombre',
        message: 'El nombre es requerido'
      });
    }

    // Validar código único solo si se proporciona
    if (data.codigo !== undefined && data.codigo !== null && data.codigo.trim() !== '') {
      const whereClause = { codigo: data.codigo.trim().toUpperCase() };
      if (excludeId) {
        whereClause.id_situacion_civil = { [Op.ne]: excludeId };
      }

      const existingByCodigo = await getSituacionCivilModel().findOne({ where: whereClause });
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

