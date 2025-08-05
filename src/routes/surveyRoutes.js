import express from 'express';
import surveyController from '../controllers/surveyController.js';
import authMiddleware from '../middlewares/auth.js';
const { authenticateToken, requireRole } = authMiddleware;
import {
  createSurveyValidation,
  saveStageDataValidation,
  completeFamilyMemberValidation,
  surveyIdValidation,
  memberIdValidation,
  paginationValidation,
  autoSaveValidation,
  cancelSurveyValidation,
  statisticsValidation
} from '../validators/surveyValidators.js';

const router = express.Router();

// All survey routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Create a new survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSurveyRequest'
 *           example:
 *             sector: "La Esperanza"
 *             familyHead: "María González Pérez"
 *             address: "Calle 15 #23-45, Barrio Centro"
 *             phone: "3001234567"
 *             email: "maria.gonzalez@email.com"
 *             familySize: 4
 *             housingType: "Casa propia"
 *             observations: "Familia muy colaborativa"
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Survey created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     survey:
 *                       $ref: '#/components/schemas/Survey'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  requireRole(['admin', 'coordinator', 'surveyor']),
  createSurveyValidation,
  surveyController.createSurvey
);

/**
 * @swagger
 * /api/surveys/my:
 *   get:
 *     summary: Get surveys created by current user
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by sector
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, familyHead, sector, progress]
 *         description: Sort field
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Surveys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     surveys:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Survey'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/my',
  paginationValidation,
  surveyController.getMySurveys
);

/**
 * @swagger
 * /api/surveys/statistics:
 *   get:
 *     summary: Get survey statistics
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *         description: Filter by sector (admin only)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/statistics',
  statisticsValidation,
  surveyController.getStatistics
);

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Get survey by ID
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *       - in: query
 *         name: include_relations
 *         schema:
 *           type: boolean
 *         description: Include related data
 *     responses:
 *       200:
 *         description: Survey retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     survey:
 *                       $ref: '#/components/schemas/Survey'
 *       404:
 *         description: Survey not found
 *       403:
 *         description: Access denied
 */
router.get('/:id',
  surveyIdValidation,
  surveyController.getSurvey
);

/**
 * @swagger
 * /api/surveys/{id}/stages/{stageNumber}:
 *   put:
 *     summary: Save survey stage data
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *       - in: path
 *         name: stageNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Stage number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StageDataInput'
 *           example:
 *             stageData:
 *               generalInfo:
 *                 interviewDate: "2025-07-20"
 *                 interviewerNotes: "Familia muy colaborativa"
 *               economicData:
 *                 monthlyIncome: 1500000
 *                 employmentStatus: "empleado"
 *                 occupation: "comerciante"
 *             currentStage: 2
 *             isComplete: true
 *     responses:
 *       200:
 *         description: Stage data saved successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized to edit this survey
 *       404:
 *         description: Survey not found
 */
router.put('/:id/stages/:stageNumber',
  saveStageDataValidation,
  surveyController.saveStageData
);

/**
 * @swagger
 * /api/surveys/{id}/members:
 *   post:
 *     summary: Add family member to survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamilyMemberInput'
 *           example:
 *             nombres: "Carlos"
 *             apellidos: "González"
 *             tipoIdentificacion: "CC"
 *             numeroIdentificacion: "12345678"
 *             fechaNacimiento: "1990-05-15"
 *             sexo: "M"
 *             situacionCivil: "Soltero"
 *             parentesco: "Hijo"
 *             estudio: "Secundaria completa"
 *             comunidadCultural: "Ninguna"
 *             ocupacion: "Estudiante"
 *             telefono: "3001234567"
 *             email: "carlos.gonzalez@email.com"
 *             talla:
 *               camisa: "M"
 *               pantalon: "32"
 *               calzado: "42"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Family member saved successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized to edit this survey
 *       404:
 *         description: Survey not found
 */
router.post('/:id/members',
  completeFamilyMemberValidation,
  surveyController.saveFamilyMember
);

/**
 * @swagger
 * /api/surveys/{id}/members/{memberId}:
 *   put:
 *     summary: Update family member
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FamilyMemberInput'
 *           example:
 *             nombres: "Ana"
 *             apellidos: "González"
 *             tipoIdentificacion: "CC"
 *             numeroIdentificacion: "87654321"
 *             fechaNacimiento: "1985-08-20"
 *             sexo: "F"
 *             situacionCivil: "Casada"
 *             parentesco: "Esposa"
 *             estudio: "Universidad completa"
 *             comunidadCultural: "Ninguna"
 *             ocupacion: "Profesora"
 *             telefono: "3009876543"
 *             email: "ana.gonzalez@email.com"
 *             talla:
 *               camisa: "S"
 *               pantalon: "28"
 *               calzado: "38"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Family member updated successfully
 */
router.put('/:id/members/:memberId',
  memberIdValidation,
  completeFamilyMemberValidation,
  surveyController.saveFamilyMember
);

/**
 * @swagger
 * /api/surveys/{id}/members/{memberId}:
 *   delete:
 *     summary: Delete family member
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Family member deleted successfully
 */
router.delete('/:id/members/:memberId',
  memberIdValidation,
  surveyController.deleteFamilyMember
);

/**
 * @swagger
 * /api/surveys/{id}/complete:
 *   post:
 *     summary: Complete survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Survey completed successfully
 *       400:
 *         description: Survey incomplete or validation error
 *       403:
 *         description: Unauthorized to complete this survey
 *       404:
 *         description: Survey not found
 */
router.post('/:id/complete',
  surveyIdValidation,
  surveyController.completeSurvey
);

/**
 * @swagger
 * /api/surveys/{id}/cancel:
 *   post:
 *     summary: Cancel survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *           example:
 *             reason: "La familia se mudó de la zona"
 *     responses:
 *       200:
 *         description: Survey cancelled successfully
 *       400:
 *         description: Cannot cancel completed survey
 *       403:
 *         description: Unauthorized to cancel this survey
 *       404:
 *         description: Survey not found
 */
router.post('/:id/cancel',
  cancelSurveyValidation,
  surveyController.cancelSurvey
);

/**
 * @swagger
 * /api/surveys/{id}/auto-save:
 *   post:
 *     summary: Auto-save survey data
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Temporary data to save
 *           example:
 *             tempData:
 *               basicInfo:
 *                 familyHead: "María González"
 *                 address: "Calle 15 #23-45"
 *                 phone: "3001234567"
 *               currentStep: 2
 *               lastModified: "2025-07-20T10:30:00.000Z"
 *               isDraft: true
 *     responses:
 *       200:
 *         description: Data auto-saved successfully
 *   get:
 *     summary: Get auto-saved data
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Auto-saved data retrieved successfully
 */
router.post('/:id/auto-save',
  autoSaveValidation,
  surveyController.autoSave
);

router.get('/:id/auto-save',
  surveyIdValidation,
  surveyController.getAutoSavedData
);

export default router;
