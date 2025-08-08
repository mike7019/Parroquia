'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EstadoCivil extends Model {
    static associate(models) {
      // Relaciones con otras tablas si las hay
    }
  }

  EstadoCivil.init({
    id_estado_civil: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre es requerido'
        },
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
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
    modelName: 'EstadoCivil',
    tableName: 'estados_civiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return EstadoCivil;
};
