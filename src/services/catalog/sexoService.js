// import { Sexo } from '../../models/index.js'; // TEMPORALMENTE DESACTIVADO
import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Obtener el modelo Sexo desde Sequelize una vez que se cargue
const getSexoModel = () => sequelize.models.Sexo;

class SexoService {
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
   * Get all sexos with pagination and search
   */
  async getAllSexos(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'id_sexo',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where.nombre = { [Op.iLike]: `%${search}%` };
      }

      const offset = (page - 1) * limit;

      const result = await getSexoModel().findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        sexos: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching sexos: ${error.message}`);
    }
  }
}

export default new SexoService();
