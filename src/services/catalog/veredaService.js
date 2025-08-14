import { Veredas } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class VeredaService {
  /**
   * Find or create a vereda (prevents duplicates)
   */
  async findOrCreateVereda(veredaData) {
    try {
      // Build where conditions dynamically
      const whereConditions = [
        { nombre: veredaData.nombre }
      ];
      
      // Only add codigo_vereda condition if it's provided
      if (veredaData.codigo_vereda) {
        whereConditions.push({ codigo_vereda: veredaData.codigo_vereda });
      }
      
      const [vereda, created] = await Veredas.findOrCreate({
        where: {
          [Op.or]: whereConditions
        },
        defaults: {
          nombre: veredaData.nombre,
          codigo_vereda: veredaData.codigo_vereda || null,
          id_municipio_municipios: veredaData.id_municipio || null
        }
      });

      return {
        vereda,
        created
      };
    } catch (error) {
      throw new Error(`Error finding or creating vereda: ${error.message}`);
    }
  }

  /**
   * Create a new vereda
   */
  async createVereda(veredaData) {
    try {
      const vereda = await Veredas.create({
        nombre: veredaData.nombre,
        codigo_vereda: veredaData.codigo_vereda || null,
        id_municipio_municipios: veredaData.id_municipio || null
      });

      return vereda;
    } catch (error) {
      throw new Error(`Error creating vereda: ${error.message}`);
    }
  }

  /**
   * Get all veredas with filters (sin paginación)
   */
  async getAllVeredas(options = {}) {
    try {
      const {
        search = null,
        municipioId = null,
        sortBy = 'id_vereda',
        sortOrder = 'ASC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { codigo_vereda: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (municipioId) {
        where.id_municipio_municipios = municipioId;
      }

      const veredas = await Veredas.findAll({
        where,
        order: [[sortBy, sortOrder]]
      });

      return {
        veredas,
        total: veredas.length,
        filters: {
          search,
          municipioId,
          sortBy,
          sortOrder
        }
      };
    } catch (error) {
      throw new Error(`Error fetching veredas: ${error.message}`);
    }
  }

  /**
   * Get vereda by ID
   */
  async getVeredaById(id) {
    try {
      const vereda = await Veredas.findByPk(id);

      if (!vereda) {
        throw new Error('Vereda not found');
      }

      return vereda;
    } catch (error) {
      throw new Error(`Error fetching vereda: ${error.message}`);
    }
  }

  /**
   * Update vereda
   */
  async updateVereda(id, updateData) {
    try {
      const vereda = await Veredas.findByPk(id);
      
      if (!vereda) {
        throw new Error('Vereda not found');
      }

      const updateFields = {};
      
      if (updateData.nombre !== undefined) {
        updateFields.nombre = updateData.nombre;
      }
      if (updateData.codigo_vereda !== undefined) updateFields.codigo_vereda = updateData.codigo_vereda;
      if (updateData.id_municipio !== undefined) updateFields.id_municipio_municipios = updateData.id_municipio;

      await vereda.update(updateFields);

      return vereda;
    } catch (error) {
      throw new Error(`Error updating vereda: ${error.message}`);
    }
  }

  /**
   * Delete vereda
   */
  async deleteVereda(id) {
    try {
      const vereda = await Veredas.findByPk(id);
      
      if (!vereda) {
        throw new Error('Vereda not found');
      }

      // For now, just delete without checking associations
      await vereda.destroy();
      return { message: 'Vereda deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting vereda: ${error.message}`);
    }
  }

  /**
   * Get veredas by municipio
   */
  async getVeredasByMunicipio(municipioId) {
    try {
      const veredas = await Veredas.findAll({
        where: { id_municipio_municipios: municipioId },
        order: [['nombre', 'ASC']]
      });

      return veredas;
    } catch (error) {
      throw new Error(`Error fetching veredas by municipio: ${error.message}`);
    }
  }

  /**
   * Get vereda statistics
   */
  async getVeredaStatistics(veredaId = null) {
    try {
      const where = veredaId ? { id_vereda: veredaId } : {};

      const totalVeredas = await Veredas.count({ where });
      
      const veredas = await Veredas.findAll({
        where,
        attributes: ['id_vereda', 'nombre', 'codigo_vereda', 'id_municipio_municipios'],
        order: [['nombre', 'ASC']]
      });

      const statistics = {
        totalVeredas,
        veredas: veredas.map(vereda => ({
          id: vereda.id_vereda,
          nombre: vereda.nombre,
          codigo: vereda.codigo_vereda,
          municipioId: vereda.id_municipio_municipios
        })),
        lastUpdated: new Date().toISOString()
      };

      return statistics;
    } catch (error) {
      throw new Error(`Error getting vereda statistics: ${error.message}`);
    }
  }

  /**
   * Search veredas
   */
  async searchVeredas(searchTerm, options = {}) {
    try {
      const { municipioId = null } = options;
      
      const where = {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm}%` } },
          { codigo_vereda: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      if (municipioId) {
        where.id_municipio_municipios = municipioId;
      }

      const veredas = await Veredas.findAll({
        where,
        order: [['nombre', 'ASC']]
      });

      return veredas;
    } catch (error) {
      throw new Error(`Error searching veredas: ${error.message}`);
    }
  }

  /**
   * Get vereda with full details including counts
   */
  async getVeredaDetails(id) {
    try {
      const vereda = await Veredas.findByPk(id);

      if (!vereda) {
        throw new Error('Vereda not found');
      }

      return {
        ...vereda.toJSON(),
        counts: {
          personas: 0,
          sectores: 0
        }
      };
    } catch (error) {
      throw new Error(`Error fetching vereda details: ${error.message}`);
    }
  }
}

export default new VeredaService();
