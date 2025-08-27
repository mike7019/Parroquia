import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';

// Función para obtener modelos de forma segura
const getMunicipioModel = () => {
  const model = sequelize.models.Municipio || sequelize.models.Municipios;
  if (!model) {
    throw new Error('Municipio model not found. Make sure models are loaded.');
  }
  return model;
};

const getDepartamentoModel = () => {
  const model = sequelize.models.Departamento || sequelize.models.Departamentos;
  if (!model) {
    throw new Error('Departamento model not found. Make sure models are loaded.');
  }
  return model;
};

class MunicipioService {
  /**
   * Find or create a municipio (prevents duplicates)
   */
  async findOrCreateMunicipio(municipioData) {
    try {
      const MunicipioModel = getMunicipioModel();
      const DepartamentoModel = getDepartamentoModel();

      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await DepartamentoModel.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      // Verificar si existe por nombre o código DANE
      let existingMunicipio = await MunicipioModel.findOne({
        where: { nombre_municipio: municipioData.nombre_municipio }
      });

      if (!existingMunicipio && municipioData.codigo_dane) {
        existingMunicipio = await MunicipioModel.findOne({
          where: { codigo_dane: municipioData.codigo_dane }
        });
      }

      if (existingMunicipio) {
        return {
          municipio: await this.getMunicipioById(existingMunicipio.id_municipio),
          created: false
        };
      }

      const municipio = await MunicipioModel.create(municipioData);
      return {
        municipio: await this.getMunicipioById(municipio.id_municipio),
        created: true
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
      const MunicipioModel = getMunicipioModel();
      const DepartamentoModel = getDepartamentoModel();

      // Validate that the departamento exists
      if (municipioData.id_departamento) {
        const departamento = await DepartamentoModel.findByPk(municipioData.id_departamento);
        if (!departamento) {
          throw new Error(`Departamento with ID ${municipioData.id_departamento} does not exist`);
        }
      }

      const municipio = await MunicipioModel.create(municipioData);

      // Devolver el municipio con su departamento
      return await this.getMunicipioById(municipio.id_municipio);
    } catch (error) {
      throw new Error(`Error creating municipio: ${error.message}`);
    }
  }

  /**
   * Get all municipios with optional filters
   */
  async getAllMunicipios(options = {}) {
    try {
      const MunicipioModel = getMunicipioModel();
      const { search, sortBy = 'nombre_municipio', sortOrder = 'ASC', id_departamento } = options;

      // Construir condiciones de búsqueda
      const whereClause = {};
      if (search) {
        whereClause.nombre_municipio = {
          [Op.iLike]: `%${search}%`
        };
      }
      if (id_departamento) {
        whereClause.id_departamento = id_departamento;
      }

      const municipios = await MunicipioModel.findAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ]
      });

      return {
        status: 'success',
        data: municipios,
        total: municipios.length,
        message: `Se encontraron ${municipios.length} municipios`
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        total: 0,
        message: `Error al obtener municipios: ${error.message}`
      };
    }
  }

  /**
   * Get municipio by ID
   */
  async getMunicipioById(id) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id, {
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
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findOne({
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
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id);

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
      const MunicipioModel = getMunicipioModel();

      const municipio = await MunicipioModel.findByPk(id);

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
   * @param {Array} municipiosData - Array of municipio objects or strings
   * @param {Object} options - Optional parameters
   * @param {number} options.defaultDepartamentoId - Default departamento ID for string entries
   */
  async bulkCreateMunicipios(municipiosData, options = {}) {
    try {
      const MunicipioModel = getMunicipioModel();
      
      if (!Array.isArray(municipiosData) || municipiosData.length === 0) {
        throw new Error('municipiosData debe ser un array no vacío');
      }

      const municipios = municipiosData.map(item => {
        if (typeof item === 'string') {
          return { 
            nombre_municipio: item,
            id_departamento: options.defaultDepartamentoId || null
          };
        }
        
        // Asegurar que hay un nombre válido
        const nombre = item.nombre_municipio || item.nombre;
        if (!nombre) {
          throw new Error('Cada municipio debe tener un nombre válido');
        }
        
        return {
          nombre_municipio: nombre,
          codigo_dane: item.codigo_dane || null,
          id_departamento: item.id_departamento || options.defaultDepartamentoId || null,
          departamento: item.departamento || null // Campo legacy
        };
      });

      // Validar que todos tengan id_departamento si es requerido
      const sinDepartamento = municipios.filter(m => !m.id_departamento);
      if (sinDepartamento.length > 0) {
        throw new Error(`${sinDepartamento.length} municipios no tienen id_departamento asignado. Use options.defaultDepartamentoId para strings simples.`);
      }

      const result = await MunicipioModel.bulkCreate(municipios, {
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
      const MunicipioModel = getMunicipioModel();

      const municipios = await MunicipioModel.findAll({
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
   * Get all available departamentos
   */
  async getAllDepartamentos() {
    try {
      const DepartamentoModel = getDepartamentoModel();

      const departamentos = await DepartamentoModel.findAll({
        order: [['nombre', 'ASC']]
      });

      return departamentos;
    } catch (error) {
      throw new Error(`Error fetching departamentos: ${error.message}`);
    }
  }

  /**
   * Search municipios by codigo DANE pattern
   */
  async searchMunicipiosByCodigoDane(pattern) {
    try {
      const MunicipioModel = getMunicipioModel();

      const municipios = await MunicipioModel.findAll({
        where: {
          codigo_dane: {
            [Op.iLike]: `%${pattern}%`
          }
        },
        include: [
          {
            association: 'departamento',
            attributes: ['id_departamento', 'nombre', 'codigo_dane']
          }
        ],
        order: [['nombre_municipio', 'ASC']]
      });

      return municipios;
    } catch (error) {
      throw new Error(`Error searching municipios by codigo DANE: ${error.message}`);
    }
  }
}

export default new MunicipioService();
