'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Profesion extends Model {
    static associate(models) {
      // Relación uno a muchos con Persona
      Profesion.hasMany(models.Persona, {
        foreignKey: 'id_profesion',
        as: 'personas'
      });
    }
  }

  Profesion.init({
    id_profesion: {
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
          msg: 'El nombre de la profesión es requerido'
        },
        notEmpty: {
          msg: 'El nombre de la profesión no puede estar vacío'
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
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'La categoría no puede exceder 100 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Profesion',
    tableName: 'profesiones',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        fields: ['categoria']
      }
    ]
  });

  return Profesion;
};
