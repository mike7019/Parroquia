import { Veredas } from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class VeredaService {
  /**
   * Create a new vereda
   */
  async createVereda(veredaData) {
    try {
      const vereda = await Veredas.create({
        nombre: veredaData.nombre,
        codigo_vereda: veredaData.codigo_vereda,
        id_municipio: veredaData.id_municipio
      });

      return vereda;
    } catch (error) {
      throw new Error(`Error creating vereda: ${error.message}`);
    }
  }

  /**
   * Get all veredas with pagination and search
   */
  async getAllVeredas(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
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
        where.id_municipio = municipioId;
      }

      const offset = (page - 1) * limit;

      const result = await Veredas.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            association: 'municipio',
            attributes: ['id', 'nombre'],
            required: false
          },
          {
            association: 'personas',
            attributes: ['id', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'],
            required: false
          },
          {
            association: 'familias',
            attributes: ['id_familia'],
            required: false
          },
          {
            association: 'sectores',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });

      return {
        veredas: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
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
      const vereda = await Veredas.findByPk(id, {
        include: [
          {
            association: 'municipio',
            attributes: ['id', 'nombre', 'codigo_municipio'],
            required: false
          },
          {
            association: 'personas',
            attributes: ['id', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido'],
            required: false
          },
          {
            association: 'familias',
            attributes: ['id_familia', 'jefe_familia'],
            required: false
          },
          {
            association: 'sectores',
            attributes: ['id', 'name', 'description'],
            required: false
          }
        ]
      });

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
      
      if (updateData.nombre !== undefined) updateFields.nombre = updateData.nombre;
      if (updateData.codigo_vereda !== undefined) updateFields.codigo_vereda = updateData.codigo_vereda;
      if (updateData.id_municipio !== undefined) updateFields.id_municipio = updateData.id_municipio;

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

      // Check if vereda has associated records
      const vereda_with_associations = await Veredas.findByPk(id, {
        include: [
          { association: 'personas', required: false },
          { association: 'familias', required: false },
          { association: 'sectores', required: false }
        ]
      });

      const hasAssociations = 
        (vereda_with_associations.personas && vereda_with_associations.personas.length > 0) ||
        (vereda_with_associations.familias && vereda_with_associations.familias.length > 0) ||
        (vereda_with_associations.sectores && vereda_with_associations.sectores.length > 0);

      if (hasAssociations) {
        throw new Error('Cannot delete vereda: it has associated personas, familias, or sectores');
      }

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
        where: { id_municipio: municipioId },
        include: [
          {
            association: 'municipio',
            attributes: ['id', 'nombre'],
            required: false
          }
        ],
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

      const statistics = await Veredas.findAll({
        where,
        attributes: [
          'id_vereda',
          'nombre',
          'codigo_vereda',
          [sequelize.fn('COUNT', sequelize.col('personas.id')), 'personasCount'],
          [sequelize.fn('COUNT', sequelize.col('familias.id_familia')), 'familiasCount'],
          [sequelize.fn('COUNT', sequelize.col('sectores.id')), 'sectoresCount']
        ],
        include: [
          {
            association: 'personas',
            attributes: [],
            required: false
          },
          {
            association: 'familias',
            attributes: [],
            required: false
          },
          {
            association: 'sectores',
            attributes: [],
            required: false
          },
          {
            association: 'municipio',
            attributes: ['nombre'],
            required: false
          }
        ],
        group: [
          'Veredas.id_vereda', 
          'Veredas.nombre', 
          'Veredas.codigo_vereda',
          'municipio.id',
          'municipio.nombre'
        ],
        raw: true
      });

      if (veredaId) {
        return statistics[0] || null;
      }

      const summary = {
        totalVeredas: statistics.length,
        totalPersonas: statistics.reduce((sum, v) => sum + parseInt(v.personasCount || 0), 0),
        totalFamilias: statistics.reduce((sum, v) => sum + parseInt(v.familiasCount || 0), 0),
        totalSectores: statistics.reduce((sum, v) => sum + parseInt(v.sectoresCount || 0), 0),
        detailedStats: statistics
      };

      return summary;
    } catch (error) {
      throw new Error(`Error calculating vereda statistics: ${error.message}`);
    }
  }

  /**
   * Search veredas
   */
  async searchVeredas(searchTerm, options = {}) {
    try {
      const { limit = 20, municipioId = null } = options;
      
      const where = {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchTerm}%` } },
          { codigo_vereda: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      if (municipioId) {
        where.id_municipio = municipioId;
      }

      const veredas = await Veredas.findAll({
        where,
        order: [['nombre', 'ASC']],
        limit: parseInt(limit),
        include: [
          {
            association: 'municipio',
            attributes: ['id', 'nombre'],
            required: false
          }
        ]
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
      const vereda = await Veredas.findByPk(id, {
        include: [
          {
            association: 'municipio',
            attributes: ['id', 'nombre', 'codigo_municipio'],
            required: false
          }
        ]
      });

      if (!vereda) {
        throw new Error('Vereda not found');
      }

      // Get counts separately for better performance
      const [personasCount, familiasCount, sectoresCount] = await Promise.all([
        Veredas.count({
          include: [{
            association: 'personas',
            required: true
          }],
          where: { id_vereda: id }
        }),
        Veredas.count({
          include: [{
            association: 'familias',
            required: true
          }],
          where: { id_vereda: id }
        }),
        Veredas.count({
          include: [{
            association: 'sectores',
            required: true
          }],
          where: { id_vereda: id }
        })
      ]);

      return {
        ...vereda.toJSON(),
        counts: {
          personas: personasCount,
          familias: familiasCount,
          sectores: sectoresCount
        }
      };
    } catch (error) {
      throw new Error(`Error fetching vereda details: ${error.message}`);
    }
  }
}

export default new VeredaService();
