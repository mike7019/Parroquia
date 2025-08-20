import sequelize from '../../../config/sequelize.js';
import { Op } from 'sequelize';
// Obtener el modelo Sector desde Sequelize una vez que se cargue
const getSectorModel = () => sequelize.models.Sector;


// Obtener el modelo Sector desde Sequelize
const Sector = sequelize.models.Sector;

class SectorService {
  /**
   * Create a new sector
   */
  async createSector(sectorData) {
    try {
      const sector = await getSectorModel().create(sectorData);
      return sector;
    } catch (error) {
      throw new Error(`Error creating sector: ${error.message}`);
    }
  }

  /**
   * Find or create a sector to avoid duplicates
   */
  async findOrCreateSector(sectorData) {
    try {
      const [sector, created] = await getSectorModel().findOrCreate({
        where: { nombre: sectorData.nombre },
        defaults: sectorData
      });

      return { sector, created };
    } catch (error) {
      throw new Error(`Error finding or creating sector: ${error.message}`);
    }
  }

  /**
   * Get all sectors with filtering
   */
  async getAllSectors(options = {}) {
    try {
      const {
        search,
        sortBy = 'nombre',
        sortOrder = 'ASC'
      } = options;

      const whereClause = {};

      if (search) {
        whereClause.nombre = {
          [Op.iLike]: `%${search}%`
        };
      }

      const sectors = await getSectorModel().findAll({
        where: whereClause,
        order: [[sortBy, sortOrder]]
      });

      return sectors;
    } catch (error) {
      throw new Error(`Error fetching sectors: ${error.message}`);
    }
  }

  /**
   * Get sector by ID
   */
  async getSectorById(id) {
    try {
      const sector = await getSectorModel().findByPk(id);
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
      const sector = await getSectorModel().findByPk(id);
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
      const sector = await getSectorModel().findByPk(id);
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
   * Check if sector exists by name
   */
  async sectorExistsByName(nombre, excludeId = null) {
    try {
      const whereClause = { nombre };
      
      if (excludeId) {
        whereClause.id_sector = { [Op.ne]: excludeId };
      }

      const sector = await getSectorModel().findOne({ where: whereClause });
      return !!sector;
    } catch (error) {
      throw new Error(`Error checking sector existence: ${error.message}`);
    }
  }
}

export default new SectorService();
