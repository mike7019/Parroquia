// Temporarily disabled English models - using only User for auth
import { Usuario } from '../models/index.js';
// import { Survey, FamilyMember, Family, User } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

class SurveyService {
  /**
   * Create a new survey
   */
  async createSurvey(userId, surveyData) {
    try {
      const surveyId = uuidv4();
      
      const survey = await Survey.create({
        id: surveyId,
        userId,
        sector: surveyData.sector,
        familyHead: surveyData.familyHead,
        address: surveyData.address,
        phone: surveyData.phone,
        email: surveyData.email,
        familySize: surveyData.familySize,
        housingType: surveyData.housingType,
        observations: surveyData.observations,
        status: 'draft',
        currentStage: 1,
        totalStages: 4,
        progress: 0,
        stagesData: [],
        familyMembers: [],
        lastSavedStage: 1,
        version: 1
      });

      return survey;
    } catch (error) {
      throw new Error(`Error creating survey: ${error.message}`);
    }
  }

  /**
   * Get survey by ID with full details
   */
  async getSurveyById(surveyId, includeRelations = true) {
    try {
      const include = [];
      
      if (includeRelations) {
        include.push(
          {
            model: User,
            as: 'surveyor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          },
          {
            model: Family,
            as: 'family',
            required: false
          }
        );
      }

      const survey = await Survey.findByPk(surveyId, {
        include
      });

      if (!survey) {
        throw new Error('Survey not found');
      }

      return survey;
    } catch (error) {
      throw new Error(`Error fetching survey: ${error.message}`);
    }
  }

  /**
   * Save survey stage data incrementally
   */
  async saveStageData(surveyId, stageNumber, stageData, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Check if user has permission to edit this survey
      const user = await Usuario.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Allow if user is owner OR admin
      if (survey.userId !== userId && user.role !== 'Administrador') {
        throw new Error('Unauthorized to edit this survey');
      }

      // Update stages data
      let stagesData = survey.stagesData || [];
      
      // Ensure stages array has enough elements
      while (stagesData.length < stageNumber) {
        stagesData.push({});
      }
      
      // Update specific stage data
      stagesData[stageNumber - 1] = {
        ...stagesData[stageNumber - 1],
        ...stageData,
        savedAt: new Date(),
        stageNumber
      };

      // Calculate progress
      const completedStages = stagesData.filter(stage => 
        stage && Object.keys(stage).length > 2 // More than just savedAt and stageNumber
      ).length;
      const progress = Math.round((completedStages / survey.totalStages) * 100);

      // Update survey
      await survey.update({
        stagesData,
        currentStage: Math.max(survey.currentStage, stageNumber),
        lastSavedStage: stageNumber,
        progress,
        lastAutoSave: new Date(),
        version: survey.version + 1,
        status: progress === 100 ? 'completed' : 'in_progress'
      });

      // Log the change for audit
      await this.logSurveyChange(surveyId, userId, 'stage_save', stageNumber, null, stageData);

      return survey;
    } catch (error) {
      throw new Error(`Error saving stage data: ${error.message}`);
    }
  }

  /**
   * Save family member data
   */
  async saveFamilyMember(surveyId, memberData, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Check if user has permission to edit this survey
      const user = await Usuario.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Allow if user is owner OR admin
      if (survey.userId !== userId && user.role !== 'Administrador') {
        throw new Error('Unauthorized to edit this survey');
      }

      const memberId = memberData.id || uuidv4();
      
      // Create or update family member
      const [familyMember, created] = await FamilyMember.upsert({
        id: memberId,
        surveyId,
        nombres: memberData.nombres,
        fechaNacimiento: memberData.fechaNacimiento,
        tipoIdentificacion: memberData.tipoIdentificacion,
        numeroIdentificacion: memberData.numeroIdentificacion,
        sexo: memberData.sexo,
        situacionCivil: memberData.situacionCivil,
        parentesco: memberData.parentesco,
        talla: memberData.talla || { camisa: '', pantalon: '', calzado: '' },
        estudio: memberData.estudio,
        comunidadCultural: memberData.comunidadCultural,
        telefono: memberData.telefono,
        enQueEresLider: memberData.enQueEresLider,
        habilidadDestreza: memberData.habilidadDestreza,
        correoElectronico: memberData.correoElectronico,
        enfermedad: memberData.enfermedad,
        necesidadesEnfermo: memberData.necesidadesEnfermo,
        solicitudComunionCasa: memberData.solicitudComunionCasa || false,
        profesionMotivoFechaCelebrar: memberData.profesionMotivoFechaCelebrar || {
          profesion: '', motivo: '', dia: '', mes: ''
        },
        order: memberData.order,
        active: true
      });

      // Update family members cache in survey
      const allMembers = await FamilyMember.findAll({
        where: { surveyId, active: true },
        order: [['order', 'ASC'], ['created_at', 'ASC']]
      });

      await survey.update({
        familyMembers: allMembers.map(member => member.toJSON()),
        lastAutoSave: new Date(),
        version: survey.version + 1
      });

      // Log the change
      await this.logSurveyChange(
        surveyId, 
        userId, 
        created ? 'member_add' : 'member_update', 
        null, 
        null, 
        memberData
      );

      return familyMember;
    } catch (error) {
      throw new Error(`Error saving family member: ${error.message}`);
    }
  }

  /**
   * Delete a family member
   */
  async deleteFamilyMember(surveyId, memberId, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Check if user has permission to edit this survey
      const user = await Usuario.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Allow if user is owner OR admin
      if (survey.userId !== userId && user.role !== 'Administrador') {
        throw new Error('Unauthorized to edit this survey');
      }

      const member = await FamilyMember.findOne({
        where: { id: memberId, surveyId }
      });

      if (!member) {
        throw new Error('Family member not found');
      }

      // Soft delete
      await member.update({ active: false });

      // Update family members cache in survey
      const allMembers = await FamilyMember.findAll({
        where: { surveyId, active: true },
        order: [['order', 'ASC'], ['created_at', 'ASC']]
      });

      await survey.update({
        familyMembers: allMembers.map(member => member.toJSON()),
        lastAutoSave: new Date(),
        version: survey.version + 1
      });

      // Log the change
      await this.logSurveyChange(surveyId, userId, 'member_delete', null, member.toJSON(), null);

      return true;
    } catch (error) {
      throw new Error(`Error deleting family member: ${error.message}`);
    }
  }

  /**
   * Complete survey
   */
  async completeSurvey(surveyId, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      if (survey.userId !== userId) {
        throw new Error('Unauthorized to complete this survey');
      }

      // Validate that all required stages are complete
      const requiredStages = survey.totalStages;
      const completedStages = (survey.stagesData || []).filter(stage => 
        stage && Object.keys(stage).length > 2
      ).length;

      if (completedStages < requiredStages) {
        throw new Error(`Survey incomplete. ${completedStages}/${requiredStages} stages completed.`);
      }

      // Create or link to Family record
      let familyRecord = null;
      if (!survey.familyId) {
        familyRecord = await Family.create({
          id: uuidv4(),
          familyHead: survey.familyHead,
          sector: survey.sector,
          address: survey.address,
          phone: survey.phone,
          email: survey.email,
          familySize: survey.familySize,
          housingType: survey.housingType,
          surveyStatus: 'completed',
          surveysCount: 1,
          lastSurveyDate: new Date(),
          active: true
        });
      }

      // Update survey status
      await survey.update({
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        familyId: familyRecord ? familyRecord.id : survey.familyId,
        version: survey.version + 1
      });

      // Update user's completed surveys count
      const user = await Usuario.findByPk(userId);
      if (user) {
        await user.update({
          surveysCompleted: (user.surveysCompleted || 0) + 1
        });
      }

      // Log completion
      await this.logSurveyChange(surveyId, userId, 'complete', null, null, {
        completedAt: new Date(),
        familyId: survey.familyId
      });

      return survey;
    } catch (error) {
      throw new Error(`Error completing survey: ${error.message}`);
    }
  }

  /**
   * Get surveys by user with pagination and filters
   */
  async getSurveysByUser(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        sector = null,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const where = { userId };
      
      if (status) {
        where.status = status;
      }
      
      if (sector) {
        where.sector = { [Op.iLike]: `%${sector}%` };
      }

      const offset = (page - 1) * limit;

      // Map sort fields to database columns if needed
      const sortField = sortBy === 'createdAt' ? 'created_at' :
                       sortBy === 'updatedAt' ? 'updated_at' : sortBy;

      const result = await Survey.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'surveyor',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [[sortField, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        surveys: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.count / limit),
          totalCount: result.count,
          hasNext: page * limit < result.count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching user surveys: ${error.message}`);
    }
  }

  /**
   * Log survey changes for audit
   */
  async logSurveyChange(surveyId, userId, action, stageId = null, oldData = null, newData = null) {
    try {
      const { SurveyAuditLog } = await import('../models/index.js');
      
      await SurveyAuditLog.create({
        id: uuidv4(),
        surveyId,
        userId,
        action,
        stageId,
        oldData,
        newData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging survey change:', error);
      // Don't throw error as this is audit logging
    }
  }

  /**
   * Auto-save survey data periodically
   */
  async autoSaveSurvey(surveyId, tempData, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      // Check if user has permission to edit this survey
      const user = await Usuario.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Allow if user is owner OR admin
      if (survey.userId !== userId && user.role !== 'Administrador') {
        throw new Error('Unauthorized to edit this survey');
      }

      await survey.update({
        tempData,
        lastAutoSave: new Date(),
        version: survey.version + 1
      });

      return true;
    } catch (error) {
      throw new Error(`Error auto-saving survey: ${error.message}`);
    }
  }

  /**
   * Restore auto-saved data
   */
  async getAutoSavedData(surveyId, userId) {
    try {
      const survey = await Survey.findByPk(surveyId);
      if (!survey) {
        throw new Error('Survey not found');
      }

      if (survey.userId !== userId) {
        throw new Error('Unauthorized to access this survey');
      }

      return {
        tempData: survey.tempData,
        lastAutoSave: survey.lastAutoSave,
        version: survey.version
      };
    } catch (error) {
      throw new Error(`Error retrieving auto-saved data: ${error.message}`);
    }
  }

  /**
   * Get survey statistics
   */
  async getSurveyStatistics(userId = null, sectorName = null) {
    try {
      const where = {};
      
      if (userId) {
        where.userId = userId;
      }
      
      if (sectorName) {
        where.sector = sectorName;
      }

      const [
        total,
        draft,
        inProgress,
        completed,
        cancelled
      ] = await Promise.all([
        Survey.count({ where }),
        Survey.count({ where: { ...where, status: 'draft' } }),
        Survey.count({ where: { ...where, status: 'in_progress' } }),
        Survey.count({ where: { ...where, status: 'completed' } }),
        Survey.count({ where: { ...where, status: 'cancelled' } })
      ]);

      return {
        total,
        byStatus: {
          draft,
          inProgress,
          completed,
          cancelled
        },
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    } catch (error) {
      throw new Error(`Error calculating survey statistics: ${error.message}`);
    }
  }
}

export default new SurveyService();
