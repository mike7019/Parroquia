import { DataTypes } from 'sequelize';
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
    type: DataTypes.UUID,
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

export default Survey;