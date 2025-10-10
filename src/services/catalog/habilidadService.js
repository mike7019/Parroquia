import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class HabilidadService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.Habilidad;
      if (!this.model) {
        throw new Error('Modelo Habilidad no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      const Habilidad = this.getModel();
      
      // Get all existing IDs ordered
      const existingRecords = await Habilidad.findAll({
        attributes: ['id_habilidad'],
        order: [['id_habilidad', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.id_habilidad));
      
      // Find the first gap in the sequence
      for (let i = 1; i <= existingIds.length + 1; i++) {
        if (!existingIds.includes(i)) {
          return i;
        }
      }

      // If no gaps found, return the next sequential number
      return Math.max(...existingIds) + 1;
    } catch (error) {
      throw new Error(`Error finding next available ID: ${error.message}`);
    }
  }

  async getAllHabilidades(filters = {}) {
    try {
      const Habilidad = this.getModel();
      
      const whereClause = {};
      
      // Filtrar por activo
      if (filters.activo !== undefined) {
        whereClause.activo = filters.activo;
      }
      
      // Filtrar por categoría
      if (filters.categoria) {
        whereClause.categoria = filters.categoria;
      }
      
      const habilidades = await Habilidad.findAll({
        where: whereClause,
        order: [['nombre', 'ASC']],
        attributes: [
          'id_habilidad',
          'nombre', 
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      const total = habilidades.length;
      
      return {
        status: 'success',
        data: habilidades,
        total: total,
        message: `Se encontraron ${total} habilidades`
      };
    } catch (error) {
      console.error('Error en getAllHabilidades:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener habilidades: ${error.message}`
      };
    }
  }

  async getHabilidadById(id) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id, {
        attributes: [
          'id_habilidad',
          'nombre',
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      return habilidad;
    } catch (error) {
      console.error('Error en getHabilidadById:', error);
      throw error;
    }
  }

  async createHabilidad(habilidadData) {
    try {
      const Habilidad = this.getModel();
      
      // Validar datos requeridos
      if (!habilidadData.nombre || habilidadData.nombre.trim() === '') {
        const error = new Error('El nombre de la habilidad es requerido');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      if (!habilidadData.descripcion || habilidadData.descripcion.trim() === '') {
        const error = new Error('La descripción de la habilidad es requerida');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Verificar si ya existe una habilidad con el mismo nombre
      const existingHabilidad = await Habilidad.findOne({
        where: { 
          nombre: habilidadData.nombre.trim()
        }
      });
      
      if (existingHabilidad) {
        const error = new Error('Ya existe una habilidad con este nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
      
      // Find the next available ID
      const nextId = await this.findNextAvailableId();
      
      const nuevaHabilidad = await Habilidad.create({
        id_habilidad: nextId,
        nombre: habilidadData.nombre.trim(),
        descripcion: habilidadData.descripcion.trim()
      });
      
      return nuevaHabilidad;
    } catch (error) {
      console.error('Error en createHabilidad:', error);
      throw error;
    }
  }

  async updateHabilidad(id, habilidadData) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id);
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (habilidadData.nombre && habilidadData.nombre.trim() !== habilidad.nombre) {
        const existingHabilidad = await Habilidad.findOne({
          where: { 
            nombre: habilidadData.nombre.trim(),
            id_habilidad: { [Op.ne]: id }
          }
        });
        
        if (existingHabilidad) {
          const error = new Error('Ya existe una habilidad con este nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }
      
      const datosActualizacion = {};
      
      if (habilidadData.nombre !== undefined) {
        datosActualizacion.nombre = habilidadData.nombre.trim();
      }
      if (habilidadData.descripcion !== undefined) {
        datosActualizacion.descripcion = habilidadData.descripcion?.trim() || null;
      }
      if (habilidadData.categoria !== undefined) {
        datosActualizacion.categoria = habilidadData.categoria?.trim() || null;
      }
      if (habilidadData.activo !== undefined) {
        datosActualizacion.activo = habilidadData.activo;
      }
      
      await habilidad.update(datosActualizacion);
      
      return habilidad;
    } catch (error) {
      console.error('Error en updateHabilidad:', error);
      throw error;
    }
  }

  async deleteHabilidad(id) {
    try {
      const Habilidad = this.getModel();
      
      const habilidad = await Habilidad.findByPk(id);
      
      if (!habilidad) {
        const error = new Error('Habilidad no encontrada');
        error.statusCode = 404;
        error.code = 'HABILIDAD_NOT_FOUND';
        throw error;
      }
      
      // Eliminar permanentemente
      await habilidad.destroy();
      
      return { message: 'Habilidad eliminada exitosamente' };
    } catch (error) {
      console.error('Error en deleteHabilidad:', error);
      throw error;
    }
  }

  async getEstadisticasHabilidades() {
    try {
      const Habilidad = this.getModel();
      
      const total = await Habilidad.count();
      
      return {
        total
      };
    } catch (error) {
      console.error('Error en getEstadisticasHabilidades:', error);
      throw error;
    }
  }
}

export default new HabilidadService();
