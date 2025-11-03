'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enfermedad extends Model {
    static associate(models) {
      // Relación muchos a muchos con Persona
      Enfermedad.belongsToMany(models.Persona, {
        through: 'persona_enfermedad',
        foreignKey: 'id_enfermedad',
        otherKey: 'id_persona',
        as: 'personas'
      });
    }
  }

  Enfermedad.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'El nombre de la enfermedad es requerido'
        },
        notEmpty: {
          msg: 'El nombre de la enfermedad no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        isBoolean: {
          msg: 'El campo activo debe ser un valor booleano'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Enfermedad',
    tableName: 'enfermedades',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre'],
        name: 'idx_enfermedades_nombre'
      }
    ]
  });

  return Enfermedad;
};
