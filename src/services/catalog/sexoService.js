import { Sexo } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class SexoService {
  /**
   * Create a new sexo
   */
  async createSexo(sexoData) {
    try {
      const sexo = await Sexo.create({
        sexo: sexoData.sexo
      });

      return sexo;
    } catch (error) {
      throw new Error(`Error creating sexo: ${error.message}`);
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
        where.sexo = { [Op.iLike]: `%${search}%` };
      }

      const offset = (page - 1) * limit;

      const result = await Sexo.findAndCountAll({
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

  /**
   * Get sexo by ID
   */
  async getSexoById(id) {
    try {
      const sexo = await Sexo.findByPk(id);

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
  async updateSexo(id, updateData) {
    try {
      const sexo = await Sexo.findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      await sexo.update({
        sexo: updateData.sexo || sexo.sexo
      });

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
      const sexo = await Sexo.findByPk(id);
      
      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Check if sexo has associated personas
      const personasCount = await Sexo.count({
        include: [{
          association: 'personas',
          required: true
        }],
        where: { id_sexo: id }
      });

      if (personasCount > 0) {
        throw new Error('Cannot delete sexo: it has associated personas');
      }

      await sexo.destroy();
      return { message: 'Sexo deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting sexo: ${error.message}`);
    }
  }

  /**
   * Get sexo statistics
   */
  async getSexoStatistics() {
    try {
      const statistics = await Sexo.findAll({
        attributes: [
          'id_sexo',
          'sexo',
          [sequelize.fn('COUNT', sequelize.col('personas.id')), 'personasCount']
        ],
        include: [
          {
            association: 'personas',
            attributes: [],
            required: false
          }
        ],
        group: ['Sexo.id_sexo', 'Sexo.sexo'],
        raw: true
      });

      const totalSexos = await Sexo.count();
      const totalPersonas = statistics.reduce((sum, s) => sum + parseInt(s.personasCount || 0), 0);

      return {
        totalSexos,
        totalPersonas,
        detailedStats: statistics
      };
    } catch (error) {
      throw new Error(`Error calculating sexo statistics: ${error.message}`);
    }
  }

  /**
   * Search sexos
   */
  async searchSexos(searchTerm) {
    try {
      const sexos = await Sexo.findAll({
        where: {
          sexo: { [Op.iLike]: `%${searchTerm}%` }
        },
        order: [['sexo', 'ASC']],
        limit: 20
      });

      return sexos;
    } catch (error) {
      throw new Error(`Error searching sexos: ${error.message}`);
    }
  }

  /**
   * Get sexo with details including persona count
   */
  async getSexoDetails(id) {
    try {
      const sexo = await Sexo.findByPk(id);

      if (!sexo) {
        throw new Error('Sexo not found');
      }

      // Get persona count
      const personasCount = await Sexo.count({
        include: [{
          association: 'personas',
          required: true
        }],
        where: { id_sexo: id }
      });

      return {
        ...sexo.toJSON(),
        counts: {
          personas: personasCount
        }
      };
    } catch (error) {
      throw new Error(`Error fetching sexo details: ${error.message}`);
    }
  }

  /**
   * Get all sexos for dropdown/select options
   */
  async getSexosForSelect() {
    try {
      const sexos = await Sexo.findAll({
        attributes: ['id_sexo', 'sexo'],
        order: [['sexo', 'ASC']]
      });

      return sexos.map(sexo => ({
        value: sexo.id_sexo,
        label: sexo.sexo,
        id: sexo.id_sexo,
        name: sexo.sexo
      }));
    } catch (error) {
      throw new Error(`Error fetching sexos for select: ${error.message}`);
    }
  }

  /**
   * Validate sexo exists
   */
  async validateSexoExists(id) {
    try {
      const sexo = await Sexo.findByPk(id);
      return !!sexo;
    } catch (error) {
      throw new Error(`Error validating sexo: ${error.message}`);
    }
  }

  /**
   * Get sexo by name
   */
  async getSexoByName(sexoName) {
    try {
      const sexo = await Sexo.findOne({
        where: {
          sexo: { [Op.iLike]: sexoName }
        }
      });

      return sexo;
    } catch (error) {
      throw new Error(`Error fetching sexo by name: ${error.message}`);
    }
  }

  /**
   * Bulk create sexos (for initial setup)
   */
  async bulkCreateSexos(sexosData) {
    try {
      const sexos = await Sexo.bulkCreate(
        sexosData.map(sexo => ({
          sexo: sexo.sexo || sexo.name || sexo
        })),
        {
          ignoreDuplicates: true,
          returning: true
        }
      );

      return sexos;
    } catch (error) {
      throw new Error(`Error bulk creating sexos: ${error.message}`);
    }
  }
}

export default new SexoService();
