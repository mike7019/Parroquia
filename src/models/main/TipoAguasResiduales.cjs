'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoAguasResiduales extends Model {
    static associate(models) {
      // Relación muchos a muchos con Familia a través de FamiliaTipoAguasResiduales
      TipoAguasResiduales.hasMany(models.FamiliaTipoAguasResiduales, {
        foreignKey: 'id_tipo_aguas_residuales',
        as: 'familiasTipoAguasResiduales'
      });
    }
  }

  TipoAguasResiduales.init({
    id_tipo_aguas_residuales: {
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
    modelName: 'TipoAguasResiduales',
    tableName: 'tipos_aguas_residuales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TipoAguasResiduales;
};
