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
    phone() {
      return null; // Campo no disponible en la nueva estructura
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
    },
    emailVerified() {
      return false; // Campo no disponible en la nueva estructura
    },
    emailVerificationToken() {
      return null; // Campo no disponible en la nueva estructura
    },
    passwordResetToken() {
      return null; // Campo no disponible en la nueva estructura
    },
    passwordResetExpires() {
      return null; // Campo no disponible en la nueva estructura
    },
    lastLoginAt() {
      return this.ultimo_login;
    },
    refreshToken() {
      return null; // Campo no disponible en la nueva estructura
    }
  },

  // Define virtual setters for compatibility with existing code
  setterMethods: {
    email(value) {
      this.setDataValue('correo_electronico', value);
    },
    password(value) {
      this.setDataValue('contrasena', value);
    },
    firstName(value) {
      this.setDataValue('primer_nombre', value);
    },
    secondName(value) {
      this.setDataValue('segundo_nombre', value);
    },
    lastName(value) {
      this.setDataValue('primer_apellido', value);
    },
    secondLastName(value) {
      this.setDataValue('segundo_apellido', value);
    },
    phone(value) {
      // Campo no disponible en la nueva estructura
    },
    isActive(value) {
      this.setDataValue('activo', value);
    },
    emailVerified(value) {
      // Campo no disponible en la nueva estructura
    },
    emailVerificationToken(value) {
      // Campo no disponible en la nueva estructura
    },
    passwordResetToken(value) {
      // Campo no disponible en la nueva estructura
    },
    passwordResetExpires(value) {
      // Campo no disponible en la nueva estructura
    },
    lastLoginAt(value) {
      // Campo no disponible en la nueva estructura
    },
    refreshToken(value) {
      // Campo no disponible en la nueva estructura
    }
  },

  hooks: {
    // Hash password before creating user
    beforeCreate: async (user) => {
      if (user.contrasena) {
        const saltRounds = 12;
        user.contrasena = await bcrypt.hash(user.contrasena, saltRounds);
      }
    },
    
    // Hash password before updating if it changed
    beforeUpdate: async (user) => {
      if (user.changed('contrasena')) {
        const saltRounds = 12;
        user.contrasena = await bcrypt.hash(user.contrasena, saltRounds);
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.contrasena);
};

// Alias for compatibility
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.contrasena);
};

// Class method to find user by email
User.findByEmail = function(email) {
  return this.findOne({
    where: {
      correo_electronico: email
    }
  });
};

// Override toJSON to hide password
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.contrasena;
  // Add virtual properties for compatibility
  values.email = this.correo_electronico;
  values.firstName = this.primer_nombre;
  values.secondName = this.segundo_nombre;
  values.lastName = this.primer_apellido;
  values.secondLastName = this.segundo_apellido;
  values.phone = null; // Campo no disponible en la nueva estructura
  values.isActive = this.activo;
  values.role = 'surveyor';
  values.status = this.activo ? 'active' : 'inactive';
  values.emailVerified = false; // Campo no disponible en la nueva estructura
  values.emailVerificationToken = null; // Campo no disponible en la nueva estructura
  values.passwordResetToken = null; // Campo no disponible en la nueva estructura
  values.passwordResetExpires = null; // Campo no disponible en la nueva estructura
  values.lastLoginAt = null; // Campo no disponible en la nueva estructura
  values.refreshToken = null; // Campo no disponible en la nueva estructura
  return values;
};

export default User;
