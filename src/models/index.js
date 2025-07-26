import sequelize from '../../config/sequelize.js';
import User from './User.js';
import Survey from './Survey.js';
import Sector from './Sector.js';
import Family from './Family.js';
import FamilyMember from './FamilyMember.js';
import SurveyAuditLog from './SurveyAuditLog.js';

// Definir asociaciones para los nuevos modelos
User.hasMany(Survey, {
  foreignKey: 'userId',
  as: 'surveys'
});

Survey.belongsTo(User, {
  foreignKey: 'userId',
  as: 'surveyor'
});

Survey.belongsTo(Family, {
  foreignKey: 'familyId',
  as: 'family'
});

Family.hasMany(Survey, {
  foreignKey: 'familyId',
  as: 'surveys'
});

Survey.hasMany(FamilyMember, {
  foreignKey: 'surveyId',
  as: 'members'
});

FamilyMember.belongsTo(Survey, {
  foreignKey: 'surveyId',
  as: 'survey'
});

Sector.belongsTo(User, {
  foreignKey: 'coordinator',
  as: 'coordinatorUser'
});

User.hasMany(Sector, {
  foreignKey: 'coordinator',
  as: 'coordinatedSectors'
});

// SurveyAuditLog associations
Survey.hasMany(SurveyAuditLog, {
  foreignKey: 'surveyId',
  as: 'auditLogs'
});

SurveyAuditLog.belongsTo(Survey, {
  foreignKey: 'surveyId',
  as: 'survey'
});

User.hasMany(SurveyAuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs'
});

SurveyAuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Re-export everything including new models
export default {
  sequelize,
  User,
  Survey,
  Sector,
  Family,
  FamilyMember,
  SurveyAuditLog
};

export {
  User,
  Survey,
  Sector,
  Family,
  FamilyMember,
  SurveyAuditLog
};
