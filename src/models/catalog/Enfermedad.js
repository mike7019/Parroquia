import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Enfermedad = sequelize.define('Enfermedad', {
  id_enfermedad: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Enfermedad',
  tableName: 'enfermedades',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

export default Enfermedad;
