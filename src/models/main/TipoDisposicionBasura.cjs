'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoDisposicionBasura extends Model {
    static associate(models) {
      // Las relaciones many-to-many con Familia fueron eliminadas
    }
  }

  TipoDisposicionBasura.init({
    id_tipo_disposicion_basura: {
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
    modelName: 'TipoDisposicionBasura',
    tableName: 'tipos_disposicion_basura',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TipoDisposicionBasura;
};
