import sequelize from '../../config/sequelize.js';
import User from './User.js';
// Temporarily disabled English models to use Spanish tables only
// import Survey from './Survey.js';
// import Family from './Family.js';
// import FamilyMember from './FamilyMember.js';
// import SurveyAuditLog from './SurveyAuditLog.js';

// Import catalog models
import Parroquia from './catalog/Parroquia.js';
import Veredas from './catalog/Veredas.js';
import Sexo from './catalog/Sexo.js';
import Municipio from './catalog/Municipio.js';
import Municipios from './catalog/Municipios.js';
import Departamentos from './catalog/Departamentos.js';
import Sector from './catalog/Sector.js';
import TipoIdentificacion from './catalog/TipoIdentificacion.js';
import Persona from './catalog/Persona.js';
import Familias from './catalog/Familias.js';

// Temporarily disabled associations for English models
/*
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
*/

// Catalog model associations
// Asociaciones de Departamentos y Municipios
Departamentos.hasMany(Municipios, {
  foreignKey: 'id_departamento',
  as: 'municipios'
});

Municipios.belongsTo(Departamentos, {
  foreignKey: 'id_departamento',
  as: 'departamentoData'
});

Parroquia.hasMany(Persona, {
  foreignKey: 'id_parroquia',
  as: 'personas'
});

Persona.belongsTo(Parroquia, {
  foreignKey: 'id_parroquia',
  as: 'parroquia'
});

Sexo.hasMany(Persona, {
  foreignKey: 'id_sexo',
  as: 'personas'
});

Persona.belongsTo(Sexo, {
  foreignKey: 'id_sexo',
  as: 'sexo'
});

// Usar el modelo Municipios (más completo) en lugar de Municipio
Municipios.hasMany(Veredas, {
  foreignKey: 'id_municipio_municipios',
  targetKey: 'id_municipio',
  as: 'veredas'
});

Veredas.belongsTo(Municipios, {
  foreignKey: 'id_municipio_municipios',
  targetKey: 'id_municipio',
  as: 'municipio'
});

Veredas.hasMany(Persona, {
  foreignKey: 'id_vereda',
  as: 'personas'
});

Persona.belongsTo(Veredas, {
  foreignKey: 'id_vereda',
  as: 'vereda'
});

// Sector associations
Sector.hasMany(Veredas, {
  foreignKey: 'id_sector_sector',
  targetKey: 'id_sector',
  as: 'veredas'
});

Veredas.belongsTo(Sector, {
  foreignKey: 'id_sector_sector',
  targetKey: 'id_sector',
  as: 'sector'
});

// Relación entre Municipios y Veredas
// Asociaciones many-to-many entre Veredas y Familias
Veredas.belongsToMany(Familias, {
  through: {
    model: 'veredas_has_many_familias',
    unique: false
  },
  foreignKey: 'id_vereda',
  otherKey: 'id_familia',
  as: 'familias',
  timestamps: false
});

Familias.belongsToMany(Veredas, {
  through: {
    model: 'veredas_has_many_familias',
    unique: false
  },
  foreignKey: 'id_familia',
  otherKey: 'id_vereda',
  as: 'veredas',
  timestamps: false
});

// Re-export everything including new models
export default {
  sequelize,
  User,
  // Temporarily disabled English models
  // Survey,
  // Family,
  // FamilyMember,
  // SurveyAuditLog,
  Parroquia,
  Veredas,
  Sexo,
  Municipio,
  Municipios,
  Departamentos,
  Sector,
  Persona,
  Familias
};

export {
  sequelize,
  User,
  // Temporarily disabled English models
  // Survey,
  // Family,
  // FamilyMember,
  // SurveyAuditLog,
  Parroquia,
  Veredas,
  Sexo,
  Municipio,
  Municipios,
  Departamentos,
  Sector,
  TipoIdentificacion,
  Persona,
  Familias
};
