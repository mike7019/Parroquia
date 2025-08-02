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
    id_enfermedad: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
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
          args: [2, 255],
          msg: 'El nombre debe tener entre 2 y 255 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Enfermedad',
    tableName: 'enfermedades',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      }
    ]
  });

  return Enfermedad;
};
