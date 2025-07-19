'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TipoIdentificacion extends Model {
    static associate(models) {
      // Define associations here
      TipoIdentificacion.hasMany(models.Persona, {
        foreignKey: 'id_tipo_identificacion',
        as: 'personas'
      });
    }
  }

  TipoIdentificacion.init({
    id_tipo_identificacion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    tipo_identificacion_pk: {
      type: DataTypes.STRING(25),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'TipoIdentificacion',
    tableName: 'tipo_identificacion',
    timestamps: false
  });

  return TipoIdentificacion;
};
