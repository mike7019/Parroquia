import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Parroquia = sequelize.define('Parroquia', {
  id_parroquia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    },
    comment: 'ID del municipio al que pertenece la parroquia'
  }
}, {
  sequelize,
  modelName: 'Parroquia',
  tableName: 'parroquia',
  timestamps: false, // Desactivar timestamps
  indexes: [
    {
      name: 'idx_parroquia_municipio',
      fields: ['id_municipio']
    },
    {
      name: 'idx_parroquia_nombre',
      fields: ['nombre']
    }
  ]
});

// Definir asociaciones
Parroquia.associate = function(models) {
  // Una parroquia pertenece a un municipio
  Parroquia.belongsTo(models.Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
  });
  
  // Una parroquia puede tener muchos sectores
  Parroquia.hasMany(models.Sector, {
    foreignKey: 'id_parroquia',
    as: 'sectores'
  });
};

export default Parroquia;
