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
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Región geográfica del departamento'
  }
}, {
  sequelize,
  modelName: 'Departamentos',
  tableName: 'departamentos',
  timestamps: true
});

export default Departamentos;
