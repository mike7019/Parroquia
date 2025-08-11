import sequelize from '../../config/sequelize.js';

class SimpleSurveyService {
  /**
   * Create a new survey using existing database structure
   */
  async createSurvey(userId, surveyData) {
    try {
      // Create a new entry in the encuestas table
      const [results] = await sequelize.query(`
        INSERT INTO encuestas (
          id_parroquia, 
          id_municipio, 
          fecha, 
          id_sector, 
          id_vereda, 
          observaciones, 
          tratamiento_datos,
          "createdAt",
          "updatedAt"
        ) VALUES (
          1, -- default parroquia
          1, -- default municipio  
          CURRENT_DATE,
          1, -- default sector
          1, -- default vereda
          $1, -- observations from request
          true,
          NOW(),
          NOW()
        ) RETURNING id_encuesta
      `, {
        replacements: [
          `Survey created by user ${userId}: ${surveyData.familyHead} - ${surveyData.address} - ${surveyData.sector}`
        ]
      });

      return {
        id: results[0].id_encuesta,
        message: 'Survey created successfully',
        data: {
          familyHead: surveyData.familyHead,
          address: surveyData.address,
          sector: surveyData.sector
        }
      };
    } catch (error) {
      throw new Error(`Error creating survey: ${error.message}`);
    }
  }
}

export default new SimpleSurveyService();
