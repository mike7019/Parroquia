import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Familias = sequelize.define('Familias', {
  id_familia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  apellido_familiar: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  direccion_familia: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  numero_contacto: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tamaño_familia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  tipo_vivienda: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado_encuesta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'in_progress', 'completed']]
    }
  },
  numero_encuestas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  fecha_ultima_encuesta: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  codigo_familia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tutor_responsable: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    }
  },
  id_vereda: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'veredas',
      key: 'id_vereda'
    }
  },
  id_sector: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'sectores',
      key: 'id_sector'
    }
  }
}, {
  tableName: 'familias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['id_municipio']
    },
    {
      fields: ['id_vereda']
    },
    {
      fields: ['id_sector']
    },
    {
      fields: ['estado_encuesta']
    }
  ]
});

// Define associations
Familias.associate = function(models) {
  if (models.Municipios) {
    Familias.belongsTo(models.Municipios, {
      foreignKey: 'id_municipio',
      as: 'municipio'
    });
  }
  
  if (models.Veredas) {
    Familias.belongsTo(models.Veredas, {
      foreignKey: 'id_vereda',
      as: 'vereda'
    });
  }
  
  if (models.Sector) {
    Familias.belongsTo(models.Sector, {
      foreignKey: 'id_sector',
      as: 'sector'
    });
  }
  
  if (models.Persona) {
    Familias.hasMany(models.Persona, {
      foreignKey: 'id_familia_familias',
      as: 'personas'
    });
  }
};

// Static methods for querying
Familias.findBySector = function(sectorId) {
  return this.findAll({
    where: {
      id_sector: sectorId
    }
  });
};

Familias.findByVereda = function(veredaId) {
  return this.findAll({
    where: {
      id_vereda: veredaId
    }
  });
};

Familias.findByEstado = function(estado) {
  return this.findAll({
    where: {
      estado_encuesta: estado
    }
  });
};

export default Familias;
