import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Family = sequelize.define('Family', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
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
  sector: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
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
  surveyStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'survey_status',
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'in_progress', 'completed']]
    }
  },
  surveysCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'surveys_count',
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lastSurveyDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'last_survey_date'
  },
  // Campos adicionales
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'Código único de familia'
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales'
  },
  // Información demográfica
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Coordenadas GPS de la vivienda'
  }
}, {
  tableName: 'familias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['family_head']
    },
    {
      fields: ['sector']
    },
    {
      fields: ['survey_status']
    },
    {
      fields: ['active']
    },
    {
      fields: ['code']
    }
  ]
});

// Métodos de instancia
Family.prototype.getCompletionRate = function() {
  if (this.surveysCount === 0) return 0;
  return this.surveyStatus === 'completed' ? 100 : 0;
};

Family.prototype.updateSurveyStatus = async function(newStatus) {
  this.surveyStatus = newStatus;
  if (newStatus === 'completed') {
    this.lastSurveyDate = new Date();
  }
  return this.save();
};

Family.prototype.incrementSurveyCount = async function() {
  this.surveysCount += 1;
  return this.save();
};

// Métodos estáticos
Family.findBySector = function(sector) {
  return this.findAll({
    where: {
      sector: sector,
      active: true
    }
  });
};

Family.getStatsBySector = async function(sector) {
  const families = await this.findBySector(sector);
  const total = families.length;
  const completed = families.filter(f => f.surveyStatus === 'completed').length;
  const inProgress = families.filter(f => f.surveyStatus === 'in_progress').length;
  const pending = families.filter(f => f.surveyStatus === 'pending').length;
  
  return {
    total,
    completed,
    inProgress,
    pending,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export default Family;
