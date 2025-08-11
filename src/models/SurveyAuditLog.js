import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const SurveyAuditLog = sequelize.define('SurveyAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  surveyId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'survey_id',
    references: {
      model: 'encuestas',
      key: 'id_encuesta'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'usuarios',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['stage_save', 'member_add', 'member_update', 'member_delete', 'complete', 'cancel', 'auto_save']]
    }
  },
  stageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'stage_id'
  },
  oldData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'old_data'
  },
  newData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'new_data'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'survey_audit_log',
  timestamps: false, // We use custom timestamp field
  indexes: [
    {
      fields: ['survey_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['action']
    }
  ]
});

// Define associations
SurveyAuditLog.associate = (models) => {
  // Belongs to Survey
  SurveyAuditLog.belongsTo(models.Survey, {
    foreignKey: 'surveyId',
    as: 'survey'
  });
  
  // Belongs to User
  SurveyAuditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

export default SurveyAuditLog;
