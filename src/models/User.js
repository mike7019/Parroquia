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
  }
}, {
  tableName: 'usuarios',
  timestamps: false, // La nueva tabla no tiene campos createdAt/updatedAt
  
  // Define virtual getters for compatibility with existing code
  getterMethods: {
    email() {
      return this.correo_electronico;
    },
    password() {
      return this.contrasena;
    },
    firstName() {
      return this.primer_nombre;
    },
    secondName() {
      return this.segundo_nombre;
    },
    lastName() {
      return this.primer_apellido;
    },
    secondLastName() {
      return this.segundo_apellido;
    },
    fullName() {
      const nombres = [this.primer_nombre, this.segundo_nombre].filter(Boolean).join(' ');
      const apellidos = [this.primer_apellido, this.segundo_apellido].filter(Boolean).join(' ');
      return `${nombres} ${apellidos}`.trim();
    },
    isActive() {
      return this.activo;
    },
    role() {
      return 'surveyor'; // Default role for compatibility
    },
    status() {
      return this.activo ? 'active' : 'inactive';
    }
  }
});

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

// Define instance methods
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.contrasena);
};

User.prototype.setPassword = async function(password) {
  this.contrasena = await bcrypt.hash(password, 10);
};

// Override toJSON to hide password and add compatibility fields
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.contrasena;
  
  // Add virtual properties for compatibility
  values.email = this.correo_electronico;
  values.firstName = this.primer_nombre;
  values.secondName = this.segundo_nombre;
  values.lastName = this.primer_apellido;
  values.secondLastName = this.segundo_apellido;
  values.isActive = this.activo;
  values.role = 'surveyor';
  values.status = this.activo ? 'active' : 'inactive';
  
  return values;
};

export default User;
