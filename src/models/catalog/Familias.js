import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Familias = sequelize.define('Familias', {
  id_familia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  uuid_familia: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    comment: 'UUID único de la familia'
  },
  nombre_familia: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre de la familia'
  },
  direccion_familia: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Dirección de la familia'
  },
  numero_contrato_epm: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Número de contrato EPM'
  },
  tratamiento_datos: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Autorización de tratamiento de datos'
  },
  observaciones: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Observaciones adicionales'
  },
  id_vereda_veredas: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID de la vereda asociada',
    references: {
      model: 'veredas',
      key: 'id_vereda'
    }
  }
}, {
  sequelize,
  modelName: 'Familias',
  tableName: 'familias',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      name: 'idx_familias_uuid',
      fields: ['uuid_familia']
    },
    {
      name: 'idx_familias_vereda',
      fields: ['id_vereda_veredas']
    }
  ]
});

// Define associations
Familias.associate = function(models) {
  if (models.Veredas) {
    Familias.belongsTo(models.Veredas, {
      foreignKey: 'id_vereda_veredas',
      targetKey: 'id_vereda',
      as: 'vereda'
    });
  }
};

// Static methods for querying
Familias.findByUuid = function(uuid) {
  return this.findOne({
    where: {
      uuid_familia: uuid
    }
  });
};

Familias.findByVereda = function(veredaId) {
  return this.findAll({
    where: {
      id_vereda_veredas: veredaId
    }
  });
};

export default Familias;
