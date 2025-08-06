import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Departamentos = sequelize.define('Departamentos', {
  id_departamento: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo_dane: {
    type: DataTypes.STRING(2),
    allowNull: false,
    comment: 'Código DANE del departamento (2 dígitos)'
  }
}, {
  sequelize,
  modelName: 'Departamentos',
  tableName: 'departamentos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Departamentos;
