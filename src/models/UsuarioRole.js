import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const UsuarioRole = sequelize.define('UsuarioRole', {
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    field: 'usuario_id'
  },
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    field: 'rol_id'
  }
}, {
  tableName: 'usuarios_roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UsuarioRole;
