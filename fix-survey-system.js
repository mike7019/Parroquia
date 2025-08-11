#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing Survey System...');

// 1. Fix Survey model to use correct table references
const surveyModelPath = path.join(__dirname, 'src', 'models', 'Survey.js');
if (fs.existsSync(surveyModelPath)) {
  let surveyContent = fs.readFileSync(surveyModelPath, 'utf8');
  
  // Fix references to match actual database tables
  surveyContent = surveyContent.replace(
    /model: 'users'/g,
    "model: 'usuarios'"
  );
  
  surveyContent = surveyContent.replace(
    /model: 'families'/g,
    "model: 'familias'"
  );
  
  fs.writeFileSync(surveyModelPath, surveyContent);
  console.log('✅ Fixed Survey model table references');
}

// 2. Fix Family model to use correct table
const familyModelPath = path.join(__dirname, 'src', 'models', 'Family.js');
if (fs.existsSync(familyModelPath)) {
  let familyContent = fs.readFileSync(familyModelPath, 'utf8');
  
  // Change tableName to use existing familias table
  familyContent = familyContent.replace(
    /tableName: 'families'/g,
    "tableName: 'familias'"
  );
  
  fs.writeFileSync(familyModelPath, familyContent);
  console.log('✅ Fixed Family model table reference');
}

// 3. Fix FamilyMember model to use correct table
const familyMemberModelPath = path.join(__dirname, 'src', 'models', 'FamilyMember.js');
if (fs.existsSync(familyMemberModelPath)) {
  let memberContent = fs.readFileSync(familyMemberModelPath, 'utf8');
  
  // Fix references
  memberContent = memberContent.replace(
    /model: 'surveys'/g,
    "model: 'encuestas'"
  );
  
  // Check if family_members table exists, if not use personas table
  memberContent = memberContent.replace(
    /tableName: 'family_members'/g,
    "tableName: 'personas'"
  );
  
  fs.writeFileSync(familyMemberModelPath, memberContent);
  console.log('✅ Fixed FamilyMember model table reference');
}

// 4. Fix SurveyService to use correct User model references
const surveyServicePath = path.join(__dirname, 'src', 'services', 'surveyService.js');
if (fs.existsSync(surveyServicePath)) {
  let serviceContent = fs.readFileSync(surveyServicePath, 'utf8');
  
  // Replace Usuario with User (alias)
  serviceContent = serviceContent.replace(
    /await Usuario\.findByPk/g,
    'await User.findByPk'
  );
  
  // Fix role checking
  serviceContent = serviceContent.replace(
    /user\.role !== 'Administrador'/g,
    "user.role !== 'admin'"
  );
  
  fs.writeFileSync(surveyServicePath, serviceContent);
  console.log('✅ Fixed SurveyService user references');
}

// 5. Create a new simplified Survey model that works with existing tables
const simplifiedSurveyModel = `import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

// Simplified Survey model that uses existing tables
const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  familyId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'family_id',
    references: {
      model: 'familias',
      key: 'id_familia'
    }
  },
  // Basic survey info
  sector: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  familyHead: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'family_head',
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  familySize: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'family_size',
    validate: {
      min: 1,
      max: 50
    }
  },
  housingType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'housing_type',
    validate: {
      notEmpty: true
    }
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Survey status
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  currentStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'current_stage',
    defaultValue: 1
  },
  totalStages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_stages',
    defaultValue: 4
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  // Data storage as JSON
  stagesData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'stages_data',
    defaultValue: []
  },
  familyMembers: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'family_members',
    defaultValue: []
  },
  tempData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'temp_data'
  },
  // Additional timestamps
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  lastAutoSave: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_auto_save'
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  lastSavedStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'last_saved_stage',
    defaultValue: 1
  }
}, {
  tableName: 'encuestas', // Use existing table if it exists, or create new
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Survey;`;

fs.writeFileSync(surveyModelPath, simplifiedSurveyModel);
console.log('✅ Created simplified Survey model');

// 6. Update models index to handle missing tables gracefully
const modelsIndexPath = path.join(__dirname, 'src', 'models', 'index.js');
if (fs.existsSync(modelsIndexPath)) {
  let indexContent = fs.readFileSync(modelsIndexPath, 'utf8');
  
  // Add error handling for missing models
  const errorHandledImports = `import sequelize from '../../config/sequelize.js';
import Usuario from './Usuario.js';
import Role from './Role.js';
import UsuarioRole from './UsuarioRole.js';
import Survey from './Survey.js';
import Parroquia from './catalog/Parroquia.js';
import Veredas from './catalog/Veredas.js';
import Sexo from './catalog/Sexo.js';
import Municipios from './catalog/Municipios.js';
import Departamentos from './catalog/Departamentos.js';
import Sector from './catalog/Sector.js';
import TipoIdentificacion from './catalog/TipoIdentificacion.js';
import Enfermedad from './catalog/Enfermedad.js';
import Familias from './catalog/Familias.js';
import TipoVivienda from './catalog/TipoVivienda.js';

// Create User alias for compatibility
const User = Usuario;

// Optional models that may not exist
let Family = null;
let FamilyMember = null;
let SurveyAuditLog = null;

try {
  const { default: FamilyModel } = await import('./Family.js');
  Family = FamilyModel;
} catch (e) {
  console.warn('Family model not available:', e.message);
  // Use Familias as fallback
  Family = Familias;
}

try {
  const { default: FamilyMemberModel } = await import('./FamilyMember.js');
  FamilyMember = FamilyMemberModel;
} catch (e) {
  console.warn('FamilyMember model not available:', e.message);
}

try {
  const { default: SurveyAuditLogModel } = await import('./SurveyAuditLog.js');
  SurveyAuditLog = SurveyAuditLogModel;
} catch (e) {
  console.warn('SurveyAuditLog model not available:', e.message);
}

// Define associations only if models exist
if (Survey && User) {
  User.hasMany(Survey, {
    foreignKey: 'userId',
    as: 'surveys'
  });

  Survey.belongsTo(User, {
    foreignKey: 'userId',
    as: 'surveyor'
  });
}

if (Survey && Family) {
  Survey.belongsTo(Family, {
    foreignKey: 'familyId',
    as: 'family'
  });

  Family.hasMany(Survey, {
    foreignKey: 'familyId',
    as: 'surveys'
  });
}`;

  // Replace the beginning of the file
  indexContent = indexContent.replace(
    /import sequelize[\s\S]*?const User = Usuario;/,
    errorHandledImports
  );
  
  fs.writeFileSync(modelsIndexPath, indexContent);
  console.log('✅ Updated models index with error handling');
}

console.log('🎉 Survey system fixes completed!');
console.log('📝 Summary of changes:');
console.log('  - Fixed Survey model table references');
console.log('  - Updated service to use correct user model');
console.log('  - Added error handling for missing models');
console.log('  - Created simplified Survey model');
console.log('');
console.log('🚀 You can now try starting the server with: npm start');
