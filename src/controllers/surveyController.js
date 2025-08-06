import surveyService from '../services/surveyService.js';
import { validationResult } from 'express-validator';

class SurveyController {
  /**
   * Create a new survey
   * POST /api/surveys
   */
  async createSurvey(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const survey = await surveyService.createSurvey(userId, req.body);

      res.status(201).json({
        status: 'success',
        message: `Encuesta creada exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Get survey by ID
   * GET /api/surveys/:id
   */
  async getSurvey(req, res) {
    try {
      const { id } = req.params;
      const { include_relations = 'true' } = req.query;
      
      const survey = await surveyService.getSurveyById(
        id, 
        include_relations === 'true'
      );

      // Check if user has permission to view this survey
      if (survey.userId !== req.user.id && req.user.role !== 'Administrador') {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }

      res.json({
        status: 'success',
        data: { survey }
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Survey not found'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Save survey stage data
   * PUT /api/surveys/:id/stages/:stageNumber
   */
  async saveStageData(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id, stageNumber } = req.params;
      const userId = req.user.id;
      const stageData = req.body;

      const survey = await surveyService.saveStageData(
        id, 
        parseInt(stageNumber), 
        stageData, 
        userId
      );

      res.json({
        status: 'success',
        message: 'Stage data saved successfully',
        data: { 
          survey: {
            id: survey.id,
            currentStage: survey.currentStage,
            progress: survey.progress,
            lastSavedStage: survey.lastSavedStage,
            version: survey.version
          }
        }
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Add or update family member
   * POST /api/surveys/:id/members
   * PUT /api/surveys/:id/members/:memberId
   */
  async saveFamilyMember(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const memberData = req.body;

      const familyMember = await surveyService.saveFamilyMember(
        id, 
        memberData, 
        userId
      );

      res.json({
        status: 'success',
        message: 'Miembro de familia agregado exitosamente'
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Delete family member
   * DELETE /api/surveys/:id/members/:memberId
   */
  async deleteFamilyMember(req, res) {
    try {
      const { id, memberId } = req.params;
      const userId = req.user.id;

      await surveyService.deleteFamilyMember(id, memberId, userId);

      res.json({
        status: 'success',
        message: 'Family member deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Complete survey
   * POST /api/surveys/:id/complete
   */
  async completeSurvey(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const survey = await surveyService.completeSurvey(id, userId);

      res.json({
        status: 'success',
        message: 'Survey completed successfully',
        data: { survey }
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      if (error.message.includes('incomplete')) {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Get surveys by current user
   * GET /api/surveys/my
   */
  async getMySurveys(req, res) {
    try {
      const userId = req.user.id;
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        status: req.query.status,
        sector: req.query.sector,
        sortBy: req.query.sort_by || 'createdAt',
        sortOrder: req.query.sort_order || 'DESC'
      };

      const result = await surveyService.getSurveysByUser(userId, options);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Auto-save survey data
   * POST /api/surveys/:id/auto-save
   */
  async autoSave(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const tempData = req.body;

      await surveyService.autoSaveSurvey(id, tempData, userId);

      res.json({
        status: 'success',
        message: 'Data auto-saved successfully'
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Get auto-saved data
   * GET /api/surveys/:id/auto-save
   */
  async getAutoSavedData(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const data = await surveyService.getAutoSavedData(id, userId);

      res.json({
        status: 'success',
        data
      });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Unauthorized')) {
        return res.status(error.message.includes('not found') ? 404 : 403).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Get survey statistics
   * GET /api/surveys/statistics
   */
  async getStatistics(req, res) {
    try {
      let userId = null;
      let sectorName = req.query.sector;

      // For surveyors, only show their own statistics
      if (req.user.role === 'surveyor') {
        userId = req.user.id;
      }

      // For coordinators, show statistics for their sector
      if (req.user.role === 'coordinator' && !sectorName) {
        const { Sector } = await import('../models/index.js');
        const sector = await Sector.findOne({
          where: { coordinator: req.user.id }
        });
        if (sector) {
          sectorName = sector.name;
        }
      }

      const statistics = await surveyService.getSurveyStatistics(userId, sectorName);

      res.json({
        status: 'success',
        data: { statistics }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  /**
   * Cancel survey
   * POST /api/surveys/:id/cancel
   */
  async cancelSurvey(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const survey = await surveyService.getSurveyById(id, false);
      
      if (survey.userId !== userId && req.user.role !== 'Administrador') {
        return res.status(403).json({
          status: 'error',
          message: 'Unauthorized to cancel this survey'
        });
      }

      if (survey.status === 'completed') {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot cancel a completed survey'
        });
      }

      await survey.update({
        status: 'cancelled',
        observations: `${survey.observations || ''}\n\nCancelled: ${reason || 'No reason provided'}`.trim()
      });

      res.json({
        status: 'success',
        message: 'Survey cancelled successfully',
        data: { survey }
      });
    } catch (error) {
      if (error.message === 'Survey not found') {
        return res.status(404).json({
          status: 'error',
          message: 'Survey not found'
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new SurveyController();
