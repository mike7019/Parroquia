'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoIdentificacion extends Model {
    static associate(models) {
      // Relaciones con otras tablas si las hay
    }
  }

  TipoIdentificacion.init({
    id_tipo_identificacion: {
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
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      validate: {
        len: {
          args: [1, 10],
          msg: 'El código debe tener entre 1 y 10 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'TipoIdentificacion',
    tableName: 'tipos_identificacion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TipoIdentificacion;
};
