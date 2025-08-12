'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoVivienda extends Model {
    static associate(models) {
      // Relación muchos a muchos con Familia
      TipoVivienda.belongsToMany(models.Familia, {
        through: 'familia_tipo_vivienda',
        foreignKey: 'id_tipo_vivienda',
        otherKey: 'id_familia',
        as: 'familias'
      });
    }
  }

  TipoVivienda.init({
    id_tipo_vivienda: {
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
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'TipoVivienda',
    tableName: 'tipos_vivienda',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return TipoVivienda;
};
