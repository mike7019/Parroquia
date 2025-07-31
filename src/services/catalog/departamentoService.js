import { Departamentos } from '../../models/index.js';
import { Op } from 'sequelize';

class DepartamentoService {
  /**
   * Create a new departamento
   */
  async createDepartamento(departamentoData) {
    try {
      const departamento = await Departamentos.create(departamentoData);
      return departamento;
    } catch (error) {
      throw new Error(`Error creating departamento: ${error.message}`);
    }
  }

  /**
   * Find or create a departamento to avoid duplicates
   */
  async findOrCreateDepartamento(departamentoData) {
    try {
      const [departamento, created] = await Departamentos.findOrCreate({
        where: { 
          [Op.or]: [
            { nombre: departamentoData.nombre },
            { codigo_dane: departamentoData.codigo_dane }
          ]
        },
        defaults: departamentoData
      });

      return { departamento, created };
    } catch (error) {
      throw new Error(`Error finding or creating departamento: ${error.message}`);
    }
  }

  /**
   * Get all departamentos with pagination and search
   */
  async getAllDepartamentos(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        sortBy = 'nombre_municipio',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_dane: { [Op.iLike]: `%${search}%` } },
          { region: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const result = await Departamentos.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            association: 'municipios',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });

      return {
        departamentos: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching departamentos: ${error.message}`);
    }
  }

  /**
   * Get departamento by ID
   */
  async getDepartamentoById(id) {
    try {
      const departamento = await Departamentos.findByPk(id, {
        include: [
          {
            association: 'municipios',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      return departamento;
    } catch (error) {
      throw new Error(`Error fetching departamento: ${error.message}`);
    }
  }

  /**
   * Get departamento by codigo DANE
   */
  async getDepartamentoByCodigoDane(codigo_dane) {
    try {
      const departamento = await Departamentos.findOne({
        where: { codigo_dane },
        include: [
          {
            association: 'municipios',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });

      if (!departamento) {
        throw new Error('Departamento not found with the provided codigo DANE');
      }

      return departamento;
    } catch (error) {
      throw new Error(`Error fetching departamento by codigo DANE: ${error.message}`);
    }
  }

  /**
   * Update departamento
   */
  async updateDepartamento(id, updateData) {
    try {
      const departamento = await Departamentos.findByPk(id);

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      await departamento.update(updateData);

      return departamento;
    } catch (error) {
      throw new Error(`Error updating departamento: ${error.message}`);
    }
  }

  /**
   * Delete departamento
   */
  async deleteDepartamento(id) {
    try {
      const departamento = await Departamentos.findByPk(id);

      if (!departamento) {
        throw new Error('Departamento not found');
      }

      // Verificar si tiene municipios asociados
      const municipiosCount = await departamento.countMunicipios();
      if (municipiosCount > 0) {
        throw new Error('Cannot delete departamento with associated municipios');
      }

      await departamento.destroy();
      
      return { message: 'Departamento deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting departamento: ${error.message}`);
    }
  }

  /**
   * Get departamentos by region
   */
  async getDepartamentosByRegion(region) {
    try {
      const departamentos = await Departamentos.findAll({
        where: { region },
        order: [['nombre_municipio', 'ASC']],
        include: [
          {
            association: 'municipios',
            attributes: ['id_municipio', 'nombre_municipio', 'codigo_dane']
          }
        ]
      });

      return departamentos;
    } catch (error) {
      throw new Error(`Error fetching departamentos by region: ${error.message}`);
    }
  }
}

export default new DepartamentoService();

