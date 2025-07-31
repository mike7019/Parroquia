import { body, param, query } from 'express-validator';
import { Op } from 'sequelize';

// Survey creation validation
export const createSurveyValidation = [
  body('familyHead')
    .notEmpty()
    .withMessage('Family head name is required')
    .isLength({ max: 200 })
    .withMessage('Family head name must not exceed 200 characters'),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('familySize')
    .isInt({ min: 1, max: 50 })
    .withMessage('Family size must be between 1 and 50'),
  
  body('housingType')
    .notEmpty()
    .withMessage('Housing type is required')
    .isLength({ max: 100 })
    .withMessage('Housing type must not exceed 100 characters'),
  
  body('observations')
    .optional()
    .isString()
    .withMessage('Observations must be a string')
];

// Stage data validation
export const saveStageDataValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format'),
  
  param('stageNumber')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stage number must be between 1 and 10'),
  
  body()
    .isObject()
    .withMessage('Stage data must be an object')
];

// Family member validation
export const saveFamilyMemberValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format'),
  
  body('nombres')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 500 })
    .withMessage('Name must not exceed 500 characters'),
  
  body('fechaNacimiento')
    .isISO8601()
    .toDate()
    .withMessage('Invalid birth date format (YYYY-MM-DD)'),
  
  body('tipoIdentificacion')
    .isIn(['CC', 'TI', 'RC', 'CE', 'PP', 'PEP', 'DIE', 'CCD'])
    .withMessage('Invalid identification type'),
  
  body('numeroIdentificacion')
    .notEmpty()
    .withMessage('Identification number is required')
    .isLength({ max: 50 })
    .withMessage('Identification number must not exceed 50 characters'),
  
  body('sexo')
    .isIn(['M', 'F', 'Otro'])
    .withMessage('Invalid sex value'),
  
  body('situacionCivil')
    .isIn(['Soltero', 'Soltera', 'Casado', 'Casada', 'Divorciado', 'Divorciada', 'Viudo', 'Viuda', 'Unión Libre'])
    .withMessage('Invalid civil status'),
  
  body('parentesco')
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ max: 100 })
    .withMessage('Relationship must not exceed 100 characters'),
  
  body('estudio')
    .notEmpty()
    .withMessage('Education level is required')
    .isLength({ max: 200 })
    .withMessage('Education level must not exceed 200 characters'),
  
  body('comunidadCultural')
    .notEmpty()
    .withMessage('Cultural community is required')
    .isLength({ max: 100 })
    .withMessage('Cultural community must not exceed 100 characters'),
  
  body('telefono')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone must not exceed 20 characters'),
  
  body('correoElectronico')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  
  body('talla')
    .optional()
    .isObject()
    .withMessage('Talla must be an object'),
  
  body('talla.camisa')
    .optional()
    .isString()
    .withMessage('Shirt size must be a string'),
  
  body('talla.pantalon')
    .optional()
    .isString()
    .withMessage('Pants size must be a string'),
  
  body('talla.calzado')
    .optional()
    .isString()
    .withMessage('Shoe size must be a string'),
  
  body('profesionMotivoFechaCelebrar')
    .optional()
    .isObject()
    .withMessage('Profession/motive/date must be an object'),
  
  body('profesionMotivoFechaCelebrar.profesion')
    .optional()
    .isString()
    .withMessage('Profession must be a string'),
  
  body('profesionMotivoFechaCelebrar.motivo')
    .optional()
    .isString()
    .withMessage('Motive must be a string'),
  
  body('profesionMotivoFechaCelebrar.dia')
    .optional()
    .isString()
    .withMessage('Day must be a string'),
  
  body('profesionMotivoFechaCelebrar.mes')
    .optional()
    .isString()
    .withMessage('Month must be a string'),
  
  body('solicitudComunionCasa')
    .optional()
    .isBoolean()
    .withMessage('Home communion request must be a boolean'),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer')
];

// Survey ID validation
export const surveyIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format')
];

// Member ID validation
export const memberIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format'),
  
  param('memberId')
    .isUUID()
    .withMessage('Invalid member ID format')
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  
  query('sort_by')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'familyHead', 'progress'])
    .withMessage('Invalid sort field'),
  
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC')
];

// Auto-save validation
export const autoSaveValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format'),
  
  body()
    .isObject()
    .withMessage('Temp data must be an object')
];

// Cancel survey validation
export const cancelSurveyValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid survey ID format'),
  
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters')
];

// Age validation helper (can be used in frontend)
export const validateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Custom validation for birthdate to ensure reasonable age
export const birthDateValidation = body('fechaNacimiento')
  .custom((value) => {
    const age = validateAge(value);
    if (age < 0 || age > 120) {
      throw new Error('Age must be between 0 and 120 years');
    }
    return true;
  });

// Validation for unique identification number per survey
export const uniqueIdentificationValidation = body('numeroIdentificacion')
  .custom(async (value, { req }) => {
    const { FamilyMember } = await import('../models/index.js');
    const surveyId = req.params.id;
    const memberId = req.body.id;
    
    const existingMember = await FamilyMember.findOne({
      where: {
        surveyId,
        numeroIdentificacion: value,
        active: true,
        ...(memberId && { id: { [Op.ne]: memberId } })
      }
    });
    
    if (existingMember) {
      throw new Error('Identification number already exists in this survey');
    }
    
    return true;
  });

// Complete validation chain for family member (includes custom validations)
export const completeFamilyMemberValidation = [
  ...saveFamilyMemberValidation,
  birthDateValidation,
  uniqueIdentificationValidation
];

// Survey statistics validation
export const statisticsValidation = [
  // No specific validations needed for statistics endpoint
];
