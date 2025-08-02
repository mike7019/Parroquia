'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FamiliaSistemaAcueducto extends Model {
    static associate(models) {
      // Relaciones con las tablas principales
      FamiliaSistemaAcueducto.belongsTo(models.Familia, {
        foreignKey: 'id_familia',
        as: 'familia'
      });

      FamiliaSistemaAcueducto.belongsTo(models.SistemaAcueducto, {
        foreignKey: 'id_sistema_acueducto',
        as: 'sistemaAcueducto'
      });
    }
  }

  FamiliaSistemaAcueducto.init({
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_familia: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de familia es requerido'
        }
      }
    },
    id_sistema_acueducto: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El ID de sistema de acueducto es requerido'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'FamiliaSistemaAcueducto',
    tableName: 'familia_sistema_acueducto',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['id_familia', 'id_sistema_acueducto'],
        name: 'unique_familia_sistema_acueducto'
      }
    ]
  });

  return FamiliaSistemaAcueducto;
};
