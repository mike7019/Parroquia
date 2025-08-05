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
    codigo: {
      type: DataTypes.STRING(1),
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: 'El código del sexo es requerido'
        },
        notEmpty: {
          msg: 'El código del sexo no puede estar vacío'
        },
        len: {
          args: [1, 1],
          msg: 'El código debe tener exactamente 1 carácter'
        },
        isIn: {
          args: [['M', 'F', 'O']],
          msg: 'El código debe ser M (Masculino), F (Femenino) u O (Otro)'
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
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        unique: true,
        fields: ['codigo']
      }
    ]
  });

  return Sexo;
};
