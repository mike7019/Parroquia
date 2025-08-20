import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import logger from '../../utils/logger.js';

// Obtener el modelo Estudio desde Sequelize una vez que se cargue
const getEstudioModel = () => sequelize.models.Estudio;

class EstudioService {
  
  /**
   * Obtener todos los estudios
   */
  async getAllEstudios(search = null, sortBy = 'nombre', sortOrder = 'ASC') {
    try {
      const whereClause = {};

      // Agregar filtro de búsqueda si se proporciona
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const estudios = await getEstudioModel().findAll({
        where: whereClause,
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      return estudios;
    } catch (error) {
      logger.error('Error getting estudios:', error);
      throw error;
    }
  }

  /**
   * Obtener un estudio por ID
   */
  async getEstudioById(id) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      return estudio;
    } catch (error) {
      logger.error(`Error getting estudio by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo estudio
   */
  async createEstudio(estudioData) {
    try {
      // Verificar si ya existe un estudio con el mismo nombre
      const existingEstudio = await getEstudioModel().findOne({
        where: { nombre: estudioData.nombre }
      });

      if (existingEstudio) {
        const error = new Error('Ya existe un estudio con ese nombre');
        error.statusCode = 409;
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const nuevoEstudio = await getEstudioModel().create(estudioData);
      
      logger.info('Estudio creado exitosamente', {
        id: nuevoEstudio.id_estudio,
        nombre: nuevoEstudio.nombre
      });

      return nuevoEstudio;
    } catch (error) {
      logger.error('Error creating estudio:', error);
      throw error;
    }
  }

  /**
   * Actualizar un estudio
   */
  async updateEstudio(id, estudioData) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay otro estudio con el mismo nombre (excluyendo el actual)
      if (estudioData.nombre && estudioData.nombre !== estudio.nombre) {
        const existingEstudio = await getEstudioModel().findOne({
          where: { 
            nombre: estudioData.nombre,
            id_estudio: { [Op.ne]: id }
          }
        });

        if (existingEstudio) {
          const error = new Error('Ya existe un estudio con ese nombre');
          error.statusCode = 409;
          error.code = 'DUPLICATE_NAME';
          throw error;
        }
      }

      await estudio.update(estudioData);
      
      logger.info('Estudio actualizado exitosamente', {
        id: estudio.id_estudio,
        nombre: estudio.nombre
      });

      return estudio;
    } catch (error) {
      logger.error(`Error updating estudio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un estudio
   */
  async deleteEstudio(id) {
    try {
      const estudio = await getEstudioModel().findByPk(id);
      
      if (!estudio) {
        const error = new Error('Estudio no encontrado');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
      }

      // Verificar si hay personas usando este estudio
      // Esta verificación se puede implementar cuando se establezcan las relaciones
      /*
      const personasUsando = await sequelize.models.Persona.count({
        where: { id_estudio: id }
      });

      if (personasUsando > 0) {
        const error = new Error(`No se puede eliminar el estudio porque ${personasUsando} persona(s) lo están usando`);
        error.statusCode = 409;
        error.code = 'ESTUDIO_IN_USE';
        throw error;
      }
      */

      await estudio.destroy();
      
      logger.info('Estudio eliminado exitosamente', {
        id: id,
        nombre: estudio.nombre
      });

      return { message: 'Estudio eliminado exitosamente' };
    } catch (error) {
      logger.error(`Error deleting estudio ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estudios por nivel (si existe campo nivel)
   */
  async getEstudiosPorNivel(nivel) {
    try {
      const estudios = await getEstudioModel().findAll({
        where: { nivel: nivel },
        order: [['nombre', 'ASC']]
      });

      return estudios;
    } catch (error) {
      logger.error(`Error getting estudios por nivel ${nivel}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de estudios
   */
  async getEstadisticas() {
    try {
      const totalEstudios = await getEstudioModel().count();
      
      // Obtener distribución por nivel si existe el campo
      const estadisticas = {
        totalEstudios
      };

      return estadisticas;
    } catch (error) {
      logger.error('Error getting estadisticas estudios:', error);
      throw error;
    }
  }

  /**
   * Buscar estudios por nombre exacto
   */
  async findByNombre(nombre) {
    try {
      const estudio = await getEstudioModel().findOne({
        where: { nombre: { [Op.iLike]: nombre } }
      });

      return estudio;
    } catch (error) {
      logger.error(`Error finding estudio by nombre ${nombre}:`, error);
      throw error;
    }
  }
}

export default new EstudioService();
