'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoDisposicionBasura extends Model {
    static associate(models) {
      // Las relaciones many-to-many con Familia fueron eliminadas
    }
  }

  TipoDisposicionBasura.init({
    id_tipos_disposicion_basura: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    metodo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El método es requerido'
        },
        notEmpty: {
          msg: 'El método no puede estar vacío'
        },
        len: {
          args: [2, 255],
          msg: 'El método debe tener entre 2 y 255 caracteres'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'TipoDisposicionBasura',
    tableName: 'tipos_disposicion_basura',
    timestamps: true
  });

  return TipoDisposicionBasura;
};
