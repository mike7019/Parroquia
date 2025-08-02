'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Departamento extends Model {
    static associate(models) {
      // Define associations here
      
      // Relación con Municipio - un departamento puede tener muchos municipios
      Departamento.hasMany(models.Municipio, {
        foreignKey: 'id_departamento',
        as: 'municipios'
      });
    }
  }

  Departamento.init({
    id_departamento: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    codigo_dane: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Departamento',
    tableName: 'departamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Departamento;
};
