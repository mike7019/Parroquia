import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

// Obtener el modelo ComunidadCultural desde Sequelize una vez que se cargue
const getComunidadCulturalModel = () => sequelize.models.ComunidadCultural;

class ComunidadCulturalService {
  /**
   * Create a new comunidad cultural
   */
  async createComunidadCultural(data) {
    try {
      const { nombre, descripcion } = data;

      // Verificar si ya existe una comunidad cultural con el mismo nombre
      const existingComunidad = await getComunidadCulturalModel().findOne({
        where: { 
          nombre: {
            [Op.iLike]: nombre.trim()
          }
        }
      });

      if (existingComunidad) {
        throw new ConflictError('Ya existe una comunidad cultural con este nombre');
      }

      const comunidadCultural = await getComunidadCulturalModel().create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        activo: true
      });

      return comunidadCultural;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error creating comunidad cultural: ${error.message}`);
    }
  }

  /**
   * Get all comunidades culturales
   */
  async getAllComunidadesCulturales(options = {}) {
    try {
      const {
        sortBy = 'id_comunidad_cultural',
        sortOrder = 'ASC'
      } = options;

      const comunidadesCulturales = await getComunidadCulturalModel().findAll({
        order: [[sortBy, sortOrder]]
      });

      return {
        status: 'success',
        data: comunidadesCulturales,
        total: comunidadesCulturales.length,
        message: `Se encontraron ${comunidadesCulturales.length} comunidades culturales`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener comunidades culturales: ${error.message}`
      };
    }
  }

  /**
   * Get comunidad cultural by ID
   */
  async getComunidadCulturalById(id) {
    try {
      const comunidadCultural = await getComunidadCulturalModel().findByPk(id);
      
      if (!comunidadCultural) {
        throw new NotFoundError('Comunidad cultural no encontrada');
      }

      return comunidadCultural;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Error fetching comunidad cultural: ${error.message}`);
    }
  }

  /**
   * Update comunidad cultural
   */
  async updateComunidadCultural(id, data) {
    try {
      const comunidadCultural = await this.getComunidadCulturalById(id);
      
      const { nombre, descripcion, activo } = data;

      // Verificar si el nuevo nombre ya existe (excluyendo el registro actual)
      if (nombre && nombre.trim() !== comunidadCultural.nombre) {
        const existingComunidad = await getComunidadCulturalModel().findOne({
          where: { 
            nombre: {
              [Op.iLike]: nombre.trim()
            },
            id_comunidad_cultural: {
              [Op.ne]: id
            }
          }
        });

        if (existingComunidad) {
          throw new ConflictError('Ya existe una comunidad cultural con este nombre');
        }
      }

      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre.trim();
      if (descripcion !== undefined) updateData.descripcion = descripcion?.trim() || null;
      if (activo !== undefined) updateData.activo = activo;

      await comunidadCultural.update(updateData);
      
      return await this.getComunidadCulturalById(id);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Error updating comunidad cultural: ${error.message}`);
    }
  }

  /**
   * Delete comunidad cultural (soft delete)
   */
  async deleteComunidadCultural(id) {
    try {
      const comunidadCultural = await this.getComunidadCulturalById(id);
      
      // TODO: Verificar si tiene registros asociados antes de eliminar
      // Esta verificación se implementaría cuando se definan las relaciones
      
      await comunidadCultural.update({ activo: false });
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error(`Error deleting comunidad cultural: ${error.message}`);
    }
  }

  /**
   * Get communities for select dropdown
   */
  async getComunidadesCulturalesForSelect() {
    try {
      const comunidades = await getComunidadCulturalModel().findAll({
        where: { activo: true },
        attributes: ['id_comunidad_cultural', 'nombre'],
        order: [['nombre', 'ASC']]
      });

      return comunidades.map(comunidad => ({
        value: comunidad.id_comunidad_cultural,
        label: comunidad.nombre
      }));
    } catch (error) {
      throw new Error(`Error fetching comunidades culturales for select: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const total = await getComunidadCulturalModel().count();
      const activas = await getComunidadCulturalModel().count({
        where: { activo: true }
      });
      const inactivas = await getComunidadCulturalModel().count({
        where: { activo: false }
      });

      return {
        total,
        activas,
        inactivas
      };
    } catch (error) {
      throw new Error(`Error fetching stats: ${error.message}`);
    }
  }
}

export default new ComunidadCulturalService();
