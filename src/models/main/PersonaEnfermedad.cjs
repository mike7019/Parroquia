'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonaEnfermedad extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      PersonaEnfermedad.belongsTo(models.Persona, {
        foreignKey: 'id_persona',
        as: 'persona'
      });

      PersonaEnfermedad.belongsTo(models.Enfermedad, {
        foreignKey: 'id_enfermedad',
        as: 'enfermedad'
      });
    }
  }

  PersonaEnfermedad.init({
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
        }
      }
    },
    id_enfermedad: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de enfermedad es requerido'
        }
      }
    },
    fecha_diagnostico: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PersonaEnfermedad',
    tableName: 'persona_enfermedad',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_persona', 'id_enfermedad'],
        name: 'unique_persona_enfermedad'
      },
      {
        fields: ['fecha_diagnostico']
      }
    ]
  });

  return PersonaEnfermedad;
};
