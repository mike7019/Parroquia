import TipoAguasResiduales from '../../models/catalog/TipoAguasResiduales.js';
import { Op } from 'sequelize';

class AguasResidualesService {
  /**
   * Create a new tipo de aguas residuales
   */
  async createTipoAguasResiduales(data) {
    try {
      const { nombre, descripcion } = data;

      // Check if tipo already exists
      const existingTipo = await TipoAguasResiduales.findOne({
        where: { nombre: { [Op.iLike]: nombre.trim() } }
      });

      if (existingTipo) {
        throw new Error('Tipo de aguas residuales already exists');
      }

      const tipoAguasResiduales = await TipoAguasResiduales.create({
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null
      });

      return tipoAguasResiduales;
    } catch (error) {
      throw new Error(`Error creating tipo de aguas residuales: ${error.message}`);
    }
  }

  /**
   * Get all tipos de aguas residuales
   */
  async getAllTiposAguasResiduales(options = {}) {
    try {
      const {
        sortBy = 'id_tipo_aguas_residuales',
        sortOrder = 'ASC'
      } = options;

      const tiposAguasResiduales = await TipoAguasResiduales.findAll({
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      return {
        status: 'success',
        data: tiposAguasResiduales,
        total: tiposAguasResiduales.length,
        message: `Se encontraron ${tiposAguasResiduales.length} tipos de aguas residuales`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener tipos de aguas residuales: ${error.message}`
      };
    }
  }

  /**
   * Get tipo de aguas residuales by ID
   */
  async getTipoAguasResidualesById(id) {
    try {
      const tipoAguasResiduales = await TipoAguasResiduales.findByPk(id);
      
      if (!tipoAguasResiduales) {
        throw new Error('Tipo de aguas residuales not found');
      }

      return tipoAguasResiduales;
    } catch (error) {
      throw new Error(`Error fetching tipo de aguas residuales: ${error.message}`);
    }
  }

  /**
   * Update tipo de aguas residuales
   */
  async updateTipoAguasResiduales(id, updateData) {
    try {
      const tipoAguasResiduales = await TipoAguasResiduales.findByPk(id);
      
      if (!tipoAguasResiduales) {
        throw new Error('Tipo de aguas residuales not found');
      }

      const { nombre, descripcion } = updateData;

      // Check if nombre already exists (excluding current record)
      if (nombre) {
        const existingTipo = await TipoAguasResiduales.findOne({
          where: { 
            nombre: { [Op.iLike]: nombre.trim() },
            id_tipo_aguas_residuales: { [Op.ne]: id }
          }
        });

        if (existingTipo) {
          throw new Error('Tipo de aguas residuales with this name already exists');
        }
      }

      const updateFields = {};
      if (nombre !== undefined) updateFields.nombre = nombre.trim();
      if (descripcion !== undefined) updateFields.descripcion = descripcion?.trim() || null;

      await tipoAguasResiduales.update(updateFields);

      return tipoAguasResiduales;
    } catch (error) {
      throw new Error(`Error updating tipo de aguas residuales: ${error.message}`);
    }
  }

  /**
   * Delete tipo de aguas residuales
   */
  async deleteTipoAguasResiduales(id) {
    try {
      const tipoAguasResiduales = await TipoAguasResiduales.findByPk(id);
      
      if (!tipoAguasResiduales) {
        throw new Error('Tipo de aguas residuales not found');
      }

      // TODO: Check if tipo has associated familias when associations are defined
      // const familiasCount = await tipoAguasResiduales.countFamilias();
      // if (familiasCount > 0) {
      //   throw new Error('Cannot delete tipo de aguas residuales: it has associated familias');
      // }

      await tipoAguasResiduales.destroy();
      return { message: 'Tipo de aguas residuales deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting tipo de aguas residuales: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const totalTipos = await TipoAguasResiduales.count();
      
      return {
        totalTipos,
        // TODO: Add more statistics when familia associations are available
        // activeTipos: await TipoAguasResiduales.count({ where: { active: true } }),
        // mostUsedTipo: // Query for most used tipo by families
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }
}

export default new AguasResidualesService();
