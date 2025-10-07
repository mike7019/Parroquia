import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import bcrypt from 'bcrypt';

const Usuario = sequelize.define('Usuario', {
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
  numero_documento: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    field: 'numero_documento'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'telefono'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'activo'
  },
  fecha_ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_ultimo_acceso'
  },
  intentos_fallidos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'intentos_fallidos'
  },
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'bloqueado_hasta'
  },
  token_recuperacion: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'token_recuperacion'
  },
  token_expiracion: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'token_expiracion'
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'email_verificado'
  },
  token_verificacion_email: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'token_verificacion_email'
  },
  fecha_verificacion_email: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_verificacion_email'
  },
  expira_token_reset: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expira_token_reset'
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refresh_token'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true, // Esto fuerza el uso de snake_case
  scopes: {
    // Default scope excludes deleted users
    defaultScope: {
      where: {
        activo: true
      }
    },
    // Scope to include deleted users
    withDeleted: {
      where: {}
    },
    // Scope to only show deleted users
    deleted: {
      where: {
        activo: false
      }
    }
  }
});

// Define instance methods
Usuario.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.contrasena);
};

Usuario.prototype.setPassword = async function(password) {
  this.contrasena = await bcrypt.hash(password, 10);
};

Usuario.prototype.getUserRoles = async function() {
  const roles = await this.getRoles();
  return roles.map(role => role.nombre);
};

Usuario.prototype.hasRole = async function(roleName) {
  const roles = await this.getRoles();
  return roles.some(role => role.nombre === roleName);
};

// Custom toJSON method - only Spanish fields
Usuario.prototype.toJSON = function() {
  const values = { ...this.dataValues };
  
  // Remove sensitive fields
  delete values.contrasena;
  delete values.token_recuperacion;
  delete values.token_expiracion;
  
  // If roles are included, convert them to simple array of role names
  if (values.roles && Array.isArray(values.roles)) {
    values.roles = values.roles.map(role => role.nombre || role);
  }
  
  return values;
};

// Hash password before creating user
Usuario.beforeCreate(async (user) => {
  if (user.contrasena) {
    user.contrasena = await bcrypt.hash(user.contrasena, 10);
  }
});

// Hash password before updating user
Usuario.beforeUpdate(async (user) => {
  if (user.changed('contrasena')) {
    user.contrasena = await bcrypt.hash(user.contrasena, 10);
  }
});

export default Usuario;
