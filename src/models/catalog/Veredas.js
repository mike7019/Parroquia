import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Veredas = sequelize.define('Veredas', {
  id_vereda: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  codigo_vereda: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  id_municipio_municipios: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    }
  },
  id_sector_sector: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'sector',
      key: 'id_sector'
    }
  }
}, {
  sequelize,
  modelName: 'Veredas',
  tableName: 'veredas',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Veredas;
