// import { Sexo } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener el modelo Sexo desde Sequelize una vez que se cargue
const getSexoModel = () => sequelize.models.Sexo;

class SexoService {
  /**
   * Create a new sexo
   */
  async createSexo(sexoData) {
    try {
      const { nombre, codigo, descripcion } = sexoData;

      // Check if sexo already exists
      const existingSexo = await getSexoModel().findOne({
        where: { 
          [Op.or]: [
            { nombre: { [Op.iLike]: nombre } },
            { codigo: { [Op.iLike]: codigo } }
          ]
        }
      });

      if (existingSexo) {
        throw new Error('Sexo with this name or code already exists');
      }

      const sexo = await getSexoModel().create({ nombre, codigo, descripcion });
      return sexo;
    } catch (error) {
      throw new Error(`Error creating sexo: ${error.message}`);
    }
  }

  /**
   * Get sexo by ID
   */
  async getSexoById(id) {
    try {
      const sexo = await getSexoModel().findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      return sexo;
    } catch (error) {
      throw new Error(`Error fetching sexo: ${error.message}`);
    }
  }

  /**
   * Update sexo
   */
  async updateSexo(id, sexoData) {
    try {
      const { nombre, codigo, descripcion } = sexoData;

      const sexo = await getSexoModel().findByPk(id);
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Check if another sexo with the same name or code exists
      const existingSexo = await getSexoModel().findOne({
        where: { 
          [Op.or]: [
            { nombre: { [Op.iLike]: nombre } },
            { codigo: { [Op.iLike]: codigo } }
          ],
          id_sexo: { [Op.ne]: id }
        }
      });

      if (existingSexo) {
        throw new Error('Sexo with this name or code already exists');
      }

      await sexo.update({ nombre, codigo, descripcion });
      return sexo;
    } catch (error) {
      throw new Error(`Error updating sexo: ${error.message}`);
    }
  }

  /**
   * Delete sexo
   */
  async deleteSexo(id) {
    try {
      const sexo = await getSexoModel().findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Check if sexo is being used in personas table
      const personaCount = await sequelize.models.Persona?.count({
        where: { id_sexo: id }
      }) || 0;

      if (personaCount > 0) {
        throw new Error('Cannot delete sexo because it is associated with personas');
      }

      await sexo.destroy();
      return { message: 'Sexo deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting sexo: ${error.message}`);
    }
  }

  /**
   * Search sexos
   */
  async searchSexos(query, limit = 20) {
    try {
      if (!query || query.length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      const sexos = await getSexoModel().findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${query}%` } },
            { codigo: { [Op.iLike]: `%${query}%` } }
          ]
        },
        order: [['nombre', 'ASC']],
        limit: parseInt(limit)
      });

      return sexos;
    } catch (error) {
      throw new Error(`Error searching sexos: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    try {
      const totalSexos = await getSexoModel().count();
      
      return {
        totalSexos
      };
    } catch (error) {
      throw new Error(`Error getting statistics: ${error.message}`);
    }
  }

  /**
   * Find or create a sexo to avoid duplicates
   */
  async findOrCreateSexo(sexoData) {
    try {
      const [sexo, created] = await getSexoModel().findOrCreate({
        where: { nombre: sexoData.sexo },
        defaults: { nombre: sexoData.sexo }
      });

      return { sexo, created };
    } catch (error) {
      throw new Error(`Error finding or creating sexo: ${error.message}`);
    }
  }

  /**
   * Get all sexos with search
   */
  async getAllSexos(options = {}) {
    try {
      const {
        search = null,
        sortBy = 'id_sexo',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const sexos = await getSexoModel().findAll({
        where,
        order: [[sortBy, sortOrder]]
      });

      return sexos;
    } catch (error) {
      throw new Error(`Error fetching sexos: ${error.message}`);
    }
  }
}

export default new SexoService();
