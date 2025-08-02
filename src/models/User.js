import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  correo_electronico: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'correo_electronico',
    validate: {
      isEmail: true
    }
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'contrasena',
    validate: {
      len: [6, 100]
    }
  },
  primer_nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'primer_nombre',
    validate: {
      len: [2, 50]
    }
  },
  segundo_nombre: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'segundo_nombre',
    validate: {
      len: [2, 50]
    }
  },
  primer_apellido: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'primer_apellido',
    validate: {
      len: [2, 50]
    }
  },
  segundo_apellido: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'segundo_apellido',
    validate: {
      len: [2, 50]
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  token_verificacion_email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'token_verificacion_email'
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'email_verificado'
  },
  fecha_verificacion_email: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_verificacion_email'
  },
  token_reset_password: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'token_reset_password'
  },
  expira_token_reset: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expira_token_reset'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: false
});

// Define instance methods
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.contrasena);
};

User.prototype.setPassword = async function(password) {
  this.contrasena = await bcrypt.hash(password, 10);
};

User.prototype.getUserRoles = async function() {
  const roles = await this.getRoles();
  return roles.map(role => role.nombre);
};

User.prototype.hasRole = async function(roleName) {
  const roles = await this.getRoles();
  return roles.some(role => role.nombre === roleName);
};

// Custom toJSON method - only Spanish fields
User.prototype.toJSON = function() {
  const values = { ...this.dataValues };
  
  // Remove sensitive fields
  delete values.contrasena;
  delete values.token_verificacion_email;
  delete values.token_reset_password;
  
  // If roles are included, convert them to simple array of role names
  if (values.roles && Array.isArray(values.roles)) {
    values.roles = values.roles.map(role => role.nombre || role);
  }
  
  return values;
};

// Hash password before creating user
User.beforeCreate(async (user) => {
  if (user.contrasena) {
    user.contrasena = await bcrypt.hash(user.contrasena, 10);
  }
});

// Hash password before updating user
User.beforeUpdate(async (user) => {
  if (user.changed('contrasena')) {
    user.contrasena = await bcrypt.hash(user.contrasena, 10);
  }
});

export default User;
