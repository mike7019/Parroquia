'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Sexo extends Model {
    static associate(models) {
      // Relación uno a muchos con Persona
      Sexo.hasMany(models.Persona, {
        foreignKey: 'id_sexo',
        as: 'personas'
      });
    }
  }

  Sexo.init({
    id_sexo: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'El nombre del sexo es requerido'
        },
        notEmpty: {
          msg: 'El nombre del sexo no puede estar vacío'
        },
        len: {
          args: [1, 50],
          msg: 'El nombre debe tener entre 1 y 50 caracteres'
        }
      }
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Sexo',
    tableName: 'sexos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      }
    ]
  });

  return Sexo;
};
