import { validationResult } from 'express-validator';
import simpleSurveyService from '../services/simpleSurveyService.js';

class SimpleSurveyController {
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

      const userId = req.user?.id || 'unknown';
      const result = await simpleSurveyService.createSurvey(userId, req.body);

      res.status(201).json({
        status: 'success',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Survey creation error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

export default new SimpleSurveyController();
