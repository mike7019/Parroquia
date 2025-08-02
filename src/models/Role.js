import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'nombre'
  }
}, {
  tableName: 'roles',
  timestamps: false
});

export default Role;
