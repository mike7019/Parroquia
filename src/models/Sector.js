import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  families: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número total de familias en el sector'
  },
  completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número de encuestas completadas'
  },
  pending: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    comment: 'Número de encuestas pendientes'
  },
  coordinator: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID del coordinador del sector'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  lastUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_update',
    comment: 'Última actualización de estadísticas'
  },
  // Campos adicionales para compatibilidad
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Código único del sector'
  },
  // Ubicación geográfica
  municipioId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'municipio_id',
    references: {
      model: 'municipios',
      key: 'id_municipio'  // ✅ CORREGIDO: era 'id'
    }
  },
  veredaId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'vereda_id',
    references: {
      model: 'veredas',
      key: 'id_vereda'
    }
  }
}, {
  tableName: 'sectors',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['status']
    },
    {
      fields: ['coordinator']
    },
    {
      fields: ['municipio_id']
    },
    {
      fields: ['vereda_id']
    }
  ]
});

// Métodos de instancia
Sector.prototype.getCompletionRate = function() {
  if (this.families === 0) return 0;
  return Math.round((this.completed / this.families) * 100);
};

Sector.prototype.getInProgress = function() {
  return this.families - this.completed - this.pending;
};

Sector.prototype.updateStats = async function() {
  // Este método se implementará para actualizar las estadísticas
  // basándose en las encuestas del sector
  this.lastUpdate = new Date();
  return this.save();
};

// Métodos estáticos
Sector.getTotalStats = async function() {
  const sectors = await this.findAll({
    where: { status: 'active' }
  });
  
  return {
    totalSectors: sectors.length,
    activeSectors: sectors.filter(s => s.status === 'active').length,
    totalFamilies: sectors.reduce((sum, s) => sum + s.families, 0),
    completedSurveys: sectors.reduce((sum, s) => sum + s.completed, 0)
  };
};

export default Sector;
