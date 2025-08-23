import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Persona = sequelize.define('Persona', {
  id_personas: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  primer_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  segundo_nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  primer_apellido: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  segundo_apellido: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  id_tipo_identificacion_tipo_identificacion: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'tipos_identificacion',
      key: 'id_tipo_identificacion'
    }
  },
  identificacion: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  correo_electronico: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_familia_familias: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'familias',
      key: 'id_familia'
    }
  },
  id_estado_civil_estado_civil: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  estudios: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  en_que_eres_lider: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  necesidad_enfermo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_profesion: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_sexo: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'sexos',
      key: 'id_sexo'
    }
  },
  talla_camisa: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  talla_pantalon: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  talla_zapato: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  id_familia: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_parroquia: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'parroquias',
      key: 'id_parroquia'
    }
  }
}, {
  sequelize,
  modelName: 'Persona',
  tableName: 'personas',
  timestamps: true, // La tabla SÍ tiene createdAt y updatedAt (confirmado por MCP)
  indexes: [
    {
      fields: ['id_familia_familias']
    },
    {
      fields: ['id_sexo']
    },
    {
      fields: ['identificacion']
    }
  ]
});

// Define associations
Persona.associate = function(models) {
  if (models.Familias) {
    Persona.belongsTo(models.Familias, {
      foreignKey: 'id_familia_familias',
      as: 'familia'
    });
  }
  
  if (models.Sexo) {
    Persona.belongsTo(models.Sexo, {
      foreignKey: 'id_sexo',
      as: 'sexo'
    });
  }
  
  if (models.TipoIdentificacion) {
    Persona.belongsTo(models.TipoIdentificacion, {
      foreignKey: 'id_tipo_identificacion_tipo_identificacion',
      as: 'tipo_identificacion'
    });
  }
  
  if (models.Municipios) {
    Persona.belongsTo(models.Municipios, {
      foreignKey: 'id_municipio',
      as: 'municipio'
    });
  }
  
  if (models.Veredas) {
    Persona.belongsTo(models.Veredas, {
      foreignKey: 'id_vereda',
      as: 'vereda'
    });
  }
  
  if (models.Sector) {
    Persona.belongsTo(models.Sector, {
      foreignKey: 'id_sector',
      as: 'sector'
    });
  }
  
  if (models.Parroquia) {
    Persona.belongsTo(models.Parroquia, {
      foreignKey: 'id_parroquia',
      as: 'parroquia'
    });
  }
};

export default Persona;
