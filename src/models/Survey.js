import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

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
      model: 'users',
      key: 'id'
    }
  },
  familyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'family_id',
    references: {
      model: 'families',
      key: 'id'
    }
  },
  // Información General
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
    allowNull: true,
    validate: {
      len: [10, 20]
    }
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
  // Control de Estado
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  currentStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'current_stage',
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  totalStages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_stages',
    defaultValue: 4,
    validate: {
      min: 1,
      max: 10
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Porcentaje de progreso 0-100'
  },
  // Datos por Etapa (JSON)
  stagesData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'stages_data',
    defaultValue: [],
    comment: 'Array de objetos con datos de cada etapa'
  },
  familyMembers: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'family_members',
    defaultValue: [],
    comment: 'Array de miembros de familia'
  },
  tempData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'temp_data',
    comment: 'Datos temporales para auto-guardado'
  },
  // Timestamps adicionales
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
  // Metadatos
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    },
    comment: 'Control de versiones'
  },
  lastSavedStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'last_saved_stage',
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'surveys',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['sector']
    },
    {
      fields: ['progress']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['family_head']
    }
  ]
});

// Métodos de instancia
Survey.prototype.calculateProgress = function() {
  if (!this.stagesData || this.stagesData.length === 0) {
    return 0;
  }
  
  const validStages = this.stagesData.filter(stage => stage.isValid).length;
  return Math.round((validStages / this.totalStages) * 100);
};

Survey.prototype.canResume = function() {
  return this.status === 'draft' || this.status === 'in_progress';
};

Survey.prototype.isComplete = function() {
  return this.status === 'completed' && this.progress === 100;
};

Survey.prototype.getNextStage = function() {
  if (this.currentStage >= this.totalStages) {
    return null;
  }
  return this.currentStage + 1;
};

// Hooks
Survey.addHook('beforeUpdate', (survey) => {
  if (survey.changed('stagesData')) {
    survey.progress = survey.calculateProgress();
  }
});

Survey.addHook('beforeCreate', (survey) => {
  survey.progress = 0;
  survey.version = 1;
});

export default Survey;
