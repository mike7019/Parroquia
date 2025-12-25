'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    static associate(models) {
      // Relación con Familia (una persona pertenece a una familia)
      if (models.Familia) {
        Persona.belongsTo(models.Familia, {
          foreignKey: 'id_familia_familias',
          as: 'familia'
        });
      }

      // Relación con TipoIdentificacion - solo si existe
      if (models.TipoIdentificacion) {
        Persona.belongsTo(models.TipoIdentificacion, {
          foreignKey: 'id_tipo_identificacion_tipo_identificacion',
          as: 'tipoIdentificacion'
        });
      }

      // Relación con Profesion
      if (models.Profesion) {
        Persona.belongsTo(models.Profesion, {
          foreignKey: 'id_profesion',
          as: 'profesion'
        });
      }

      // Relación con Sexo
      if (models.Sexo) {
        Persona.belongsTo(models.Sexo, {
          foreignKey: 'id_sexo',
          as: 'sexoPersona'
        });
      }

      // Relación muchos a muchos con Enfermedad
      if (models.Enfermedad) {
        Persona.belongsToMany(models.Enfermedad, {
          through: 'persona_enfermedad',
          foreignKey: 'id_persona',
          otherKey: 'id_enfermedad',
          as: 'enfermedades'
        });
      }

      // Relación muchos a muchos con Destreza
      if (models.Destreza) {
        Persona.belongsToMany(models.Destreza, {
          through: 'persona_destreza',  
          foreignKey: 'id_personas_personas',
          otherKey: 'id_destrezas_destrezas',
          as: 'destrezas'
        });
      }

      // Relación con Parentesco
      if (models.Parentesco) {
        Persona.belongsTo(models.Parentesco, {
          foreignKey: 'id_parentesco',
          as: 'parentesco'
        });
      }

      // Relación con ComunidadCultural
      if (models.ComunidadCultural) {
        Persona.belongsTo(models.ComunidadCultural, {
          foreignKey: 'id_comunidad_cultural',
          as: 'comunidadCultural'
        });
      }

      // Relación con Estudio (NivelEducativo)
      if (models.Estudio) {
        Persona.belongsTo(models.Estudio, {
          foreignKey: 'id_nivel_educativo',
          as: 'nivelEducativo'
        });
      }
    }

    // Método para obtener información completa del sexo
    async getSexoInfo() {
      if (!this.sexoRelacion) {
        await this.reload({ include: [{ model: this.sequelize.models.Sexo, as: 'sexoRelacion' }] });
      }
      return this.sexoRelacion;
    }

    // Método para verificar si es masculino
    esMasculino() {
      const sexoNombre = this.sexoRelacion?.nombre?.toLowerCase();
      return sexoNombre === 'masculino' || sexoNombre === 'hombre';
    }

    // Método para verificar si es femenino
    esFemenino() {
      const sexoNombre = this.sexoRelacion?.nombre?.toLowerCase();
      return sexoNombre === 'femenino' || sexoNombre === 'mujer';
    }

    // Método para obtener el nombre del sexo
    getSexoNombre() {
      return this.sexoRelacion?.nombre || null;
    }

    // Método para obtener el código del sexo (DEPRECADO - ahora devuelve nombre)
    getSexoCodigo() {
      // Por compatibilidad, devolver una versión abreviada del nombre
      const nombre = this.sexoRelacion?.nombre?.toLowerCase();
      if (nombre === 'masculino' || nombre === 'hombre') return 'M';
      if (nombre === 'femenino' || nombre === 'mujer') return 'F';
      return nombre?.charAt(0)?.toUpperCase() || null;
    }
  }

  Persona.init({
    id_personas: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre completo es requerido'
        },
        notEmpty: {
          msg: 'El nombre completo no puede estar vacío'
        },
        len: {
          args: [2, 255],
          msg: 'El nombre completo debe tener entre 2 y 255 caracteres'
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
        },
        len: {
          args: [1, 15],
          msg: 'El número de identificación debe tener máximo 15 dígitos'
        },
        isNumericOrValidFormat: {
          validator: function(value) {
            // Permitir identificaciones especiales para casos de fallecidos o temporales
            if (value.startsWith('FALLECIDO_') || value.startsWith('TEMP_')) {
              return true;
            }
            // Para identificaciones normales, validar que solo contenga dígitos y no exceda 15 caracteres
            const cleanValue = value.replace(/\D/g, ''); // Remover caracteres no numéricos
            return cleanValue.length <= 15 && cleanValue.length >= 1;
          },
          msg: 'El número de identificación debe contener máximo 15 dígitos numéricos'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'El teléfono no puede exceder 20 caracteres'
        }
      }
    },
    correo_electronico: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
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
    solicitud_comunion_casa: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    id_profesion: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_sexo: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    talla_camisa: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de camisa no puede exceder 10 caracteres'
        }
      }
    },
    talla_pantalon: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de pantalón no puede exceder 10 caracteres'
        }
      }
    },
    talla_zapato: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [0, 10],
          msg: 'La talla de zapato no puede exceder 10 caracteres'
        }
      }
    },
    id_parentesco: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'parentescos',
        key: 'id_parentesco'
      }
    },
    id_comunidad_cultural: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'comunidades_culturales',
        key: 'id_comunidad_cultural'
      }
    },
    id_nivel_educativo: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'niveles_educativos',
        key: 'id_niveles_educativos'
      }
    },
    motivo_celebrar: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El motivo de celebración no puede exceder 100 caracteres'
        }
      }
    },
    dia_celebrar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'El día debe ser entre 1 y 31'
        },
        max: {
          args: 31,
          msg: 'El día debe ser entre 1 y 31'
        }
      }
    },
    mes_celebrar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'El mes debe ser entre 1 y 12'
        },
        max: {
          args: 12,
          msg: 'El mes debe ser entre 1 y 12'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Persona',
    tableName: 'personas',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['identificacion']
      },
      {
        fields: ['id_familia_familias']
      },
      {
        fields: ['fecha_nacimiento']
      },
      {
        fields: ['id_sexo']
      },
      {
        fields: ['id_parentesco']
      },
      {
        fields: ['id_comunidad_cultural']
      },
      {
        fields: ['id_nivel_educativo']
      },
      {
        fields: ['mes_celebrar', 'dia_celebrar']
      }
    ]
  });

  return Persona;
};
