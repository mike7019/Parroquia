import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const UsuarioRole = sequelize.define('UsuarioRole', {
  id_usuarios: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'id_usuarios'
  },
  id_roles: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'id_roles'
  }
}, {
  tableName: 'usuarios_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UsuarioRole;
