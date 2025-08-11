import express from 'express';
import simpleSurveyController from '../controllers/simpleSurveyController.js';

const router = express.Router();

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyHead:
 *                 type: string
 *                 description: Family head name
 *               address:
 *                 type: string
 *                 description: Family address
 *               sector:
 *                 type: string
 *                 description: Sector or area
 *               familySize:
 *                 type: integer
 *                 description: Number of family members
 *               housingType:
 *                 type: string
 *                 description: Type of housing
 *     responses:
 *       201:
 *         description: Survey created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', simpleSurveyController.createSurvey);

export default router;
