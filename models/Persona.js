'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      // Relación con Familia (una persona pertenece a una familia)
      Persona.belongsTo(models.Familia, {
        foreignKey: 'id_familia_familias',
        as: 'familia'
      });

      // Relación con TipoIdentificacion
      Persona.belongsTo(models.TipoIdentificacion, {
        foreignKey: 'id_tipo_identificacion_tipo_identificacion',
        as: 'tipoIdentificacion'
      });

      // Relación con EstadoCivil
      Persona.belongsTo(models.EstadoCivil, {
        foreignKey: 'id_estado_civil_estado_civil',
        as: 'estadoCivil'
      });

      // Relación con Profesion
      Persona.belongsTo(models.Profesion, {
        foreignKey: 'id_profesion',
        as: 'profesion'
      });

      // Relación muchos a muchos con Enfermedad
      Persona.belongsToMany(models.Enfermedad, {
        through: 'persona_enfermedad',
        foreignKey: 'id_persona',
        otherKey: 'id_enfermedad',
        as: 'enfermedades'
      });

      // Relación muchos a muchos con Destreza
      Persona.belongsToMany(models.Destreza, {
        through: 'persona_destreza',
        foreignKey: 'id_personas_personas',
        otherKey: 'id_destrezas_destrezas',
        as: 'destrezas'
      });
    }
  }

  Persona.init({
    id_personas: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    primer_nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El primer nombre es requerido'
        },
        notEmpty: {
          msg: 'El primer nombre no puede estar vacío'
        },
        len: {
          args: [2, 255],
          msg: 'El primer nombre debe tener entre 2 y 255 caracteres'
        }
      }
    },
    segundo_nombre: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'El segundo nombre no puede exceder 255 caracteres'
        }
      }
    },
    primer_apellido: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El primer apellido es requerido'
        },
        notEmpty: {
          msg: 'El primer apellido no puede estar vacío'
        },
        len: {
          args: [2, 255],
          msg: 'El primer apellido debe tener entre 2 y 255 caracteres'
        }
      }
    },
    segundo_apellido: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'El segundo apellido no puede exceder 255 caracteres'
        }
      }
    },
    id_tipo_identificacion_tipo_identificacion: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    identificacion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'La identificación es requerida'
        },
        notEmpty: {
          msg: 'La identificación no puede estar vacía'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El teléfono es requerido'
        },
        notEmpty: {
          msg: 'El teléfono no puede estar vacío'
        }
      }
    },
    correo_electronico: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'El correo electrónico es requerido'
        },
        isEmail: {
          msg: 'Debe ser un correo electrónico válido'
        }
      }
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La fecha de nacimiento es requerida'
        },
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    sexo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El sexo es requerido'
        },
        notEmpty: {
          msg: 'El sexo no puede estar vacío'
        }
      }
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La dirección es requerida'
        },
        notEmpty: {
          msg: 'La dirección no puede estar vacía'
        }
      }
    },
    id_familia_familias: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_estado_civil_estado_civil: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    // Nuevos campos añadidos
    camisa: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de camisa no puede exceder 10 caracteres'
        }
      }
    },
    blusa: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de blusa no puede exceder 10 caracteres'
        }
      }
    },
    pantalon: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de pantalón no puede exceder 10 caracteres'
        }
      }
    },
    calzado: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de calzado no puede exceder 10 caracteres'
        }
      }
    },
    estudios: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [0, 255],
          msg: 'Los estudios no pueden exceder 255 caracteres'
        }
      }
    },
    en_que_eres_lider: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    necesidad_enfermo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_profesion: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Persona',
    tableName: 'personas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['identificacion']
      },
      {
        unique: true,
        fields: ['correo_electronico']
      },
      {
        fields: ['id_familia_familias']
      },
      {
        fields: ['fecha_nacimiento']
      }
    ]
  });

  return Persona;
};
