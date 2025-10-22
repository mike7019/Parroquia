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
    defaultValue: 1,
    validate: {
      min: 1
    }
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
  },
  id_corregimiento: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'corregimientos',
      key: 'id_corregimiento'
    }
  },
  id_centro_poblado: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'centros_poblados',
      key: 'id_centro_poblado'
    }
  },
  comunionEnCasa: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Solicita Comunión en casa?'
  },
  numero_contrato_epm: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Número de contrato con EPM (Empresas Públicas)'
  },
  id_tipo_vivienda: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'tipos_vivienda',
      key: 'id_tipo_vivienda'
    }
  },
  fecha_encuesta: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha en que se realizó la encuesta/registro'
  },
  id_parroquia: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'parroquia',
      key: 'id_parroquia'
    }
  },
  
  // CAMPOS BOOLEANOS DE SERVICIOS DE AGUA
  pozo_septico: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Indica si la familia tiene pozo séptico'
  },
  letrina: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Indica si la familia tiene letrina'
  },
  campo_abierto: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Indica si la familia usa campo abierto para aguas residuales'
  },
  
  // CAMPOS BOOLEANOS DE DISPOSICIÓN DE BASURAS
  disposicion_recolector: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Usa servicio de recolección de basuras'
  },
  disposicion_quemada: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Quema las basuras'
  },
  disposicion_enterrada: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Entierra las basuras'
  },
  disposicion_recicla: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Recicla las basuras'
  },
  disposicion_aire_libre: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Deja las basuras al aire libre'
  }
}, {
  tableName: 'familias',
  timestamps: false,
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
      fields: ['id_corregimiento']
    },
    {
      fields: ['id_centro_poblado']
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
  
  if (models.Corregimientos) {
    Familias.belongsTo(models.Corregimientos, {
      foreignKey: 'id_corregimiento',
      as: 'corregimiento'
    });
  }
  
  if (models.CentrosPoblados) {
    Familias.belongsTo(models.CentrosPoblados, {
      foreignKey: 'id_centro_poblado',
      as: 'centro_poblado'
    });
  }
  
  if (models.Sector) {
    Familias.belongsTo(models.Sector, {
      foreignKey: 'id_sector',
      as: 'sector_info'
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
