import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class ProfesionService {
  constructor() {
    this.model = null;
  }

  // Método para obtener el modelo de forma lazy
  getModel() {
    if (!this.model) {
      this.model = sequelize.models.Profesion;
      if (!this.model) {
        throw new Error('Modelo Profesion no encontrado en sequelize.models');
      }
    }
    return this.model;
  }

  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      const Profesion = this.getModel();
      
      // Get all existing IDs ordered
      const existingRecords = await Profesion.findAll({
        attributes: ['id_profesion'],
        order: [['id_profesion', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.id_profesion));
      
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

  async getAllProfesiones(filters = {}) {
    try {
      const Profesion = this.getModel();
      
      // Sin filtros - retorna todas las profesiones
      const profesiones = await Profesion.findAll({
        order: [['nombre', 'ASC']],
        attributes: [
          'id_profesion',
          'nombre', 
          'descripcion',
          'created_at',
          'updated_at'
        ]
      });
      
      const total = profesiones.length;
      
      return {
        status: 'success',
        data: profesiones,
        total: total,
        message: `Se encontraron ${total} profesiones`
      };
    } catch (error) {
      console.error('Error en getAllProfesiones:', error);
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener profesiones: ${error.message}`
      };
    }
  }

  async getProfesionById(id) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id, {
        attributes: [
          'id_profesion',
          'nombre',
          'descripcion', 
          'created_at',
          'updated_at'
        ]
      });
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      return profesion;
    } catch (error) {
      console.error('Error en getProfesionById:', error);
      throw error;
    }
  }

  async createProfesion(profesionData) {
    try {
      const Profesion = this.getModel();
      
      // Validar datos requeridos
      if (!profesionData.nombre || profesionData.nombre.trim() === '') {
        const error = new Error('El nombre de la profesión es requerido');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Verificar si ya existe una profesión con el mismo nombre
      const existingProfesion = await Profesion.findOne({
        where: { 
          nombre: profesionData.nombre.trim()
        }
      });
      
      if (existingProfesion) {
        const error = new Error('Ya existe una profesión con este nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
      
      // Find the next available ID
      const nextId = await this.findNextAvailableId();
      
      const nuevaProfesion = await Profesion.create({
        id_profesion: nextId,
        nombre: profesionData.nombre.trim(),
        descripcion: profesionData.descripcion?.trim() || null
      });
      
      return nuevaProfesion;
    } catch (error) {
      console.error('Error en createProfesion:', error);
      throw error;
    }
  }

  async updateProfesion(id, profesionData) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id);
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (profesionData.nombre && profesionData.nombre.trim() !== profesion.nombre) {
        const existingProfesion = await Profesion.findOne({
          where: { 
            nombre: profesionData.nombre.trim(),
            id_profesion: { [Op.ne]: id }
          }
        });
        
        if (existingProfesion) {
          const error = new Error('Ya existe una profesión con este nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }
      
      const datosActualizacion = {};
      
      if (profesionData.nombre !== undefined) {
        datosActualizacion.nombre = profesionData.nombre.trim();
      }
      if (profesionData.descripcion !== undefined) {
        datosActualizacion.descripcion = profesionData.descripcion?.trim() || null;
      }
      
      await profesion.update(datosActualizacion);
      
      return profesion;
    } catch (error) {
      console.error('Error en updateProfesion:', error);
      throw error;
    }
  }

  async deleteProfesion(id) {
    try {
      const Profesion = this.getModel();
      
      const profesion = await Profesion.findByPk(id);
      
      if (!profesion) {
        const error = new Error('Profesión no encontrada');
        error.statusCode = 404;
        error.code = 'PROFESION_NOT_FOUND';
        throw error;
      }
      
      // Hard delete por ahora (hasta que tengamos la columna activo)
      await profesion.destroy();
      
      return { message: 'Profesión eliminada exitosamente' };
    } catch (error) {
      console.error('Error en deleteProfesion:', error);
      throw error;
    }
  }

  async getProfesionesPorCategoria() {
    try {
      const Profesion = this.getModel();
      
      // Retornar array vacío por ahora ya que no tenemos columna categoria
      return [];
    } catch (error) {
      console.error('Error en getProfesionesPorCategoria:', error);
      throw error;
    }
  }

  async getEstadisticasProfesiones() {
    try {
      const Profesion = this.getModel();
      
      const total = await Profesion.count();
      
      return {
        total,
        activas: total, // Por ahora todos están activos
        inactivas: 0,
        porCategoria: [],
        porNivelEducativo: []
      };
    } catch (error) {
      console.error('Error en getEstadisticasProfesiones:', error);
      throw error;
    }
  }
}

export default new ProfesionService();
