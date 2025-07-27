import { Sector } from '../../models/index.js';
import { Op } from 'sequelize';

class SectorService {
  /**
   * Create a new sector
   */
  async createSector(sectorData) {
    try {
      const sector = await Sector.create({
        name: sectorData.name,
        description: sectorData.description,
        families: sectorData.families || 0,
        completed: sectorData.completed || 0,
        pending: sectorData.pending || 0,
        coordinator: sectorData.coordinator || null,
        status: sectorData.status || 'active',
        code: sectorData.code,
        municipioId: sectorData.municipioId,
        veredaId: sectorData.veredaId
      });

      return sector;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Sector name already exists');
      }
      throw new Error(`Error creating sector: ${error.message}`);
    }
  }

  /**
   * Get all sectors with pagination and search
   */
  async getAllSectors(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = null,
        status = null,
        coordinatorId = null,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { code: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (coordinatorId) {
        where.coordinator = coordinatorId;
      }

      const offset = (page - 1) * limit;

      const result = await Sector.findAndCountAll({
        where,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            association: 'coordinatorUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          },
          {
            association: 'municipio',
            attributes: ['id', 'nombre'],
            required: false
          },
          {
            association: 'vereda',
            attributes: ['id_vereda', 'nombre'],
            required: false
          }
        ]
      });

      return {
        sectors: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
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
      const sector = await Sector.findByPk(id, {
        include: [
          {
            association: 'coordinatorUser',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
            required: false
          },
          {
            association: 'municipio',
            attributes: ['id', 'nombre'],
            required: false
          },
          {
            association: 'vereda',
            attributes: ['id_vereda', 'nombre', 'codigo_vereda'],
            required: false
          }
        ]
      });

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

      const updateFields = {};
      
      if (updateData.name !== undefined) updateFields.name = updateData.name;
      if (updateData.description !== undefined) updateFields.description = updateData.description;
      if (updateData.families !== undefined) updateFields.families = updateData.families;
      if (updateData.completed !== undefined) updateFields.completed = updateData.completed;
      if (updateData.pending !== undefined) updateFields.pending = updateData.pending;
      if (updateData.coordinator !== undefined) updateFields.coordinator = updateData.coordinator;
      if (updateData.status !== undefined) updateFields.status = updateData.status;
      if (updateData.code !== undefined) updateFields.code = updateData.code;
      if (updateData.municipioId !== undefined) updateFields.municipioId = updateData.municipioId;
      if (updateData.veredaId !== undefined) updateFields.veredaId = updateData.veredaId;

      updateFields.lastUpdate = new Date();

      await sector.update(updateFields);

      return sector;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Sector name already exists');
      }
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

      // Check if sector has associated surveys or users
      const { Survey, User } = await import('../../models/index.js');
      
      const [surveysCount, usersCount] = await Promise.all([
        Survey.count({ where: { sector: sector.name } }),
        User.count({ where: { sector: sector.name } })
      ]);

      if (surveysCount > 0 || usersCount > 0) {
        throw new Error('Cannot delete sector: it has associated surveys or users');
      }

      await sector.destroy();
      return { message: 'Sector deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting sector: ${error.message}`);
    }
  }

  /**
   * Get sectors by coordinator
   */
  async getSectorsByCoordinator(coordinatorId) {
    try {
      const sectors = await Sector.findAll({
        where: { coordinator: coordinatorId },
        include: [
          {
            association: 'coordinatorUser',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          }
        ],
        order: [['name', 'ASC']]
      });

      return sectors;
    } catch (error) {
      throw new Error(`Error fetching coordinator sectors: ${error.message}`);
    }
  }

  /**
   * Get sector statistics
   */
  async getSectorStatistics(sectorId = null) {
    try {
      const where = sectorId ? { id: sectorId } : {};

      const [
        totalSectors,
        activeSectors,
        inactiveSectors,
        sectorsWithCoordinators,
        totalFamilies,
        totalCompleted,
        totalPending
      ] = await Promise.all([
        Sector.count({ where }),
        Sector.count({ where: { ...where, status: 'active' } }),
        Sector.count({ where: { ...where, status: 'inactive' } }),
        Sector.count({ 
          where: { 
            ...where, 
            coordinator: { [Op.not]: null } 
          } 
        }),
        Sector.sum('families', { where }),
        Sector.sum('completed', { where }),
        Sector.sum('pending', { where })
      ]);

      return {
        totalSectors,
        activeSectors,
        inactiveSectors,
        sectorsWithCoordinators,
        sectorsWithoutCoordinators: totalSectors - sectorsWithCoordinators,
        totalFamilies: totalFamilies || 0,
        totalCompleted: totalCompleted || 0,
        totalPending: totalPending || 0,
        completionRate: totalFamilies > 0 ? Math.round((totalCompleted / totalFamilies) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Error calculating sector statistics: ${error.message}`);
    }
  }

  /**
   * Update sector survey statistics
   */
  async updateSectorSurveyStats(sectorName) {
    try {
      const { Survey } = await import('../../models/index.js');
      
      const sector = await Sector.findOne({ where: { name: sectorName } });
      if (!sector) {
        throw new Error('Sector not found');
      }

      const [totalSurveys, completedSurveys] = await Promise.all([
        Survey.count({ where: { sector: sectorName } }),
        Survey.count({ where: { sector: sectorName, status: 'completed' } })
      ]);

      const pendingSurveys = totalSurveys - completedSurveys;

      await sector.update({
        completed: completedSurveys,
        pending: pendingSurveys,
        lastUpdate: new Date()
      });

      return sector;
    } catch (error) {
      throw new Error(`Error updating sector survey statistics: ${error.message}`);
    }
  }

  /**
   * Search sectors
   */
  async searchSectors(searchTerm, options = {}) {
    try {
      const { limit = 20, status = null } = options;
      
      const where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { code: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      };

      if (status) {
        where.status = status;
      }

      const sectors = await Sector.findAll({
        where,
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        include: [
          {
            association: 'coordinatorUser',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      return sectors;
    } catch (error) {
      throw new Error(`Error searching sectors: ${error.message}`);
    }
  }

  /**
   * Assign coordinator to sector
   */
  async assignCoordinator(sectorId, coordinatorId) {
    try {
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        throw new Error('Sector not found');
      }

      const { User } = await import('../../models/index.js');
      const coordinator = await User.findByPk(coordinatorId);
      if (!coordinator) {
        throw new Error('Coordinator not found');
      }

      if (coordinator.role !== 'coordinator') {
        throw new Error('User is not a coordinator');
      }

      await sector.update({
        coordinator: coordinatorId,
        lastUpdate: new Date()
      });

      return sector;
    } catch (error) {
      throw new Error(`Error assigning coordinator: ${error.message}`);
    }
  }
}

export default new SectorService();
