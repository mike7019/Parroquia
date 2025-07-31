import Sector from '../../models/catalog/Sector.js';
import { Op } from 'sequelize';

class SectorService {
  /**
   * Create a new sector
   */
  async createSector(sectorData) {
    try {
      const sector = await Sector.create(sectorData);
      return sector;
    } catch (error) {
      throw new Error(`Error creating sector: ${error.message}`);
    }
  }

  /**
   * Get all sectors with pagination and filtering
   */
  async getAllSectors(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'id_sector',
        sortOrder = 'ASC'
      } = options;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (search) {
        whereClause.nombre = {
          [Op.iLike]: `%${search}%`
        };
      }

      const { count, rows } = await Sector.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      return {
        sectors: rows,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching sectors: ${error.message}`);
    }
  }

  /**
   * Get sector by ID
   */
  async getSectorById(id) {
    try {
      const sector = await Sector.findByPk(id);
      if (!sector) {
        throw new Error('Sector not found');
      }
      return sector;
    } catch (error) {
      throw new Error(`Error fetching sector: ${error.message}`);
    }
  }

  /**
   * Update sector
   */
  async updateSector(id, updateData) {
    try {
      const sector = await Sector.findByPk(id);
      if (!sector) {
        throw new Error('Sector not found');
      }

      await sector.update(updateData);
      return sector;
    } catch (error) {
      throw new Error(`Error updating sector: ${error.message}`);
    }
  }

  /**
   * Delete sector
   */
  async deleteSector(id) {
    try {
      const sector = await Sector.findByPk(id);
      if (!sector) {
        throw new Error('Sector not found');
      }

      await sector.destroy();
      return true;
    } catch (error) {
      throw new Error(`Error deleting sector: ${error.message}`);
    }
  }

  /**
   * Bulk create sectors
   */
  async bulkCreateSectors(sectorsData) {
    try {
      const sectors = await Sector.bulkCreate(sectorsData, {
        validate: true,
        returning: true
      });
      return sectors;
    } catch (error) {
      throw new Error(`Error bulk creating sectors: ${error.message}`);
    }
  }

  /**
   * Get sectors count
   */
  async getSectorsCount() {
    try {
      const count = await Sector.count();
      return count;
    } catch (error) {
      throw new Error(`Error counting sectors: ${error.message}`);
    }
  }

  /**
   * Check if sector exists by name
   */
  async sectorExistsByName(nombre, excludeId = null) {
    try {
      const whereClause = { nombre };
      
      if (excludeId) {
        whereClause.id_sector = { [Op.ne]: excludeId };
      }

      const sector = await Sector.findOne({ where: whereClause });
      return !!sector;
    } catch (error) {
      throw new Error(`Error checking sector existence: ${error.message}`);
    }
  }
}

export default new SectorService();
