'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonaCelebracion extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Relación con Persona
      PersonaCelebracion.belongsTo(models.Persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });
    }
  }

  PersonaCelebracion.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_persona: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de persona es requerido'
        },
        isInt: {
          msg: 'El ID de persona debe ser un número entero'
        }
      }
    },
    motivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El motivo de la celebración es requerido'
        },
        notEmpty: {
          msg: 'El motivo no puede estar vacío'
        },
        len: {
          args: [1, 100],
          msg: 'El motivo debe tener entre 1 y 100 caracteres'
        }
      }
    },
    dia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'El día debe ser un número entero'
        },
        min: {
          args: [1],
          msg: 'El día debe ser mayor o igual a 1'
        },
        max: {
          args: [31],
          msg: 'El día debe ser menor o igual a 31'
        }
      }
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'El mes debe ser un número entero'
        },
        min: {
          args: [1],
          msg: 'El mes debe ser mayor o igual a 1'
        },
        max: {
          args: [12],
          msg: 'El mes debe ser menor o igual a 12'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'PersonaCelebracion',
    tableName: 'persona_celebracion',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['id_persona', 'motivo', 'dia', 'mes'],
        name: 'unique_persona_celebracion'
      },
      {
        fields: ['id_persona'],
        name: 'idx_persona_celebracion_persona'
      },
      {
        fields: ['mes'],
        name: 'idx_persona_celebracion_mes'
      },
      {
        fields: ['motivo'],
        name: 'idx_persona_celebracion_motivo'
      }
    ]
  });

  return PersonaCelebracion;
};
