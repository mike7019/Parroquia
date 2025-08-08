import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const TipoIdentificacion = sequelize.define('TipoIdentificacion', {
  id_tipo_identificacion: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'TipoIdentificacion',
  tableName: 'tipos_identificacion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default TipoIdentificacion;
