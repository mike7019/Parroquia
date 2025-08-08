import { Municipios, Departamentos } from '../../models/catalog/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class MunicipioService {
  /**
   * Find or create a municipio (prevents duplicates)
   */
  async findOrCreateMunicipio(municipioData) {
    try {
      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await Departamentos.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      const [municipio, created] = await Municipios.findOrCreate({
        where: {
          [Op.or]: [
            { nombre_municipio: municipioData.nombre_municipio },
            { codigo_dane: municipioData.codigo_dane }
          ]
        },
        defaults: municipioData
      });

      return {
        municipio: await this.getMunicipioById(municipio.id_municipio),
        created
      };
    } catch (error) {
      throw new Error(`Error finding or creating municipio: ${error.message}`);
    }
  }

  /**
   * Create a new municipio
   */
  async createMunicipio(municipioData) {
    try {
      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await Departamentos.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      const municipio = await Municipios.create(municipioData);

      // Devolver el municipio con su departamento
      return await this.getMunicipioById(municipio.id_municipio);
    } catch (error) {
      throw new Error(`Error creating municipio: ${error.message}`);
    }
  }

  /**
   * Get all municipios with pagination and search
   */
  async getAllMunicipios(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'nombre_municipio',
        sortOrder = 'ASC',
        id_departamento = null
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre_municipio: { [Op.iLike]: `%${search}%` } },
          { codigo_dane: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (id_departamento) {
        where.id_departamento = id_departamento;
      }

      const offset = (page - 1) * limit;

      const result = await Municipios.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return {
        municipios: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching municipios: ${error.message}`);
    }
  }

  /**
   * Get municipio by ID
   */
  async getMunicipioById(id) {
    try {
      const municipio = await Municipios.findByPk(id, {
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      return municipio;
    } catch (error) {
      throw new Error(`Error fetching municipio: ${error.message}`);
    }
  }

  /**
   * Get municipio by codigo DANE
   */
  async getMunicipioByCodigoDane(codigo_dane) {
    try {
      const municipio = await Municipios.findOne({
        where: { codigo_dane },
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      if (!municipio) {
        throw new Error('Municipio not found with the provided codigo DANE');
      }

      return municipio;
    } catch (error) {
      throw new Error(`Error fetching municipio by codigo DANE: ${error.message}`);
    }
  }

  /**
   * Update municipio
   */
  async updateMunicipio(id, updateData) {
    try {
      const municipio = await Municipios.findByPk(id);

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      await municipio.update(updateData);

      // Devolver el municipio actualizado con su departamento
      return await this.getMunicipioById(id);
    } catch (error) {
      throw new Error(`Error updating municipio: ${error.message}`);
    }
  }

  /**
   * Delete municipio
   */
  async deleteMunicipio(id) {
    try {
      const municipio = await Municipios.findByPk(id);

      if (!municipio) {
        throw new Error('Municipio not found');
      }

      await municipio.destroy();
      
      return { message: 'Municipio deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting municipio: ${error.message}`);
    }
  }

  /**
   * Bulk create municipios
   */
  async bulkCreateMunicipios(municipiosData) {
    try {
      const municipios = municipiosData.map(item => {
        if (typeof item === 'string') {
          return { nombre_municipio: item };
        }
        return {
          nombre_municipio: item.nombre,
          codigo_dane: item.codigo_dane,
          id_departamento: item.id_departamento,
          departamento: item.departamento // Campo legacy
        };
      });

      const result = await Municipios.bulkCreate(municipios, {
        ignoreDuplicates: true,
        returning: true
      });

      return result;
    } catch (error) {
      throw new Error(`Error bulk creating municipios: ${error.message}`);
    }
  }

  /**
   * Get municipios by departamento
   */
  async getMunicipiosByDepartamento(id_departamento) {
    try {
      const municipios = await Municipios.findAll({
        where: { id_departamento },
        order: [['nombre_municipio', 'ASC']],
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return municipios;
    } catch (error) {
      throw new Error(`Error fetching municipios by departamento: ${error.message}`);
    }
  }

  /**
   * Search municipios by codigo DANE pattern
   */
  async searchMunicipiosByCodigoDane(pattern) {
    try {
      const municipios = await Municipios.findAll({
        where: {
          codigo_dane: { [Op.like]: `${pattern}%` }
        },
        order: [['codigo_dane', 'ASC']],
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return municipios;
    } catch (error) {
      throw new Error(`Error searching municipios by codigo DANE: ${error.message}`);
    }
  }

  /**
   * Get all available departamentos
   */
  async getAllDepartamentos() {
    try {
      const departamentos = await Departamentos.findAll({
        order: [['nombre', 'ASC']]
      });

      return departamentos;
    } catch (error) {
      throw new Error(`Error fetching departamentos: ${error.message}`);
    }
  }
}

export default new MunicipioService();


