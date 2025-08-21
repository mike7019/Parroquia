import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Sector = sequelize.define('Sector', {
  id_sector: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_municipio: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'municipios',
      key: 'id_municipio'
    }
  }
}, {
  sequelize,
  modelName: 'Sector',
  tableName: 'sectores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Sector;
