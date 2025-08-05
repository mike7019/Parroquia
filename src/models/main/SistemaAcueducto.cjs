'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SistemaAcueducto extends Model {
    static associate(models) {
      // Las relaciones many-to-many con Familia fueron eliminadas
    }
  }

  SistemaAcueducto.init({
    id_sistemas_acueducto: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    proveedor: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El proveedor es requerido'
        },
        notEmpty: {
          msg: 'El proveedor no puede estar vacío'
        }
      }
    },
    metodo_abastecimiento: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El método de abastecimiento es requerido'
        },
        notEmpty: {
          msg: 'El método de abastecimiento no puede estar vacío'
        }
      }
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La descripción es requerida'
        },
        notEmpty: {
          msg: 'La descripción no puede estar vacía'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'SistemaAcueducto',
    tableName: 'sistemas_acueducto',
    timestamps: true
  });

  return SistemaAcueducto;
};
