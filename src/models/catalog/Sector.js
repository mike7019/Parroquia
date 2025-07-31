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
  }
}, {
  sequelize,
  modelName: 'Sector',
  tableName: 'sector',
  timestamps: false
});

export default Sector;
