'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Municipio extends Model {
    static associate(models) {
      // Define associations here
      
      // Relación con Departamento - un municipio pertenece a un departamento
      Municipio.belongsTo(models.Departamento, {
        foreignKey: 'id_departamento',
        as: 'departamento'
      });

      // Relación con Parroquia - un municipio puede tener muchas parroquias
      Municipio.hasMany(models.Parroquia, {
        foreignKey: 'id_municipio',
        as: 'parroquias'
      });

      // Relación con Sector - un municipio puede tener muchos sectores
      Municipio.hasMany(models.Sector, {
        foreignKey: 'id_municipio',
        as: 'sectores'
      });

      // Relación con Vereda - un municipio puede tener muchas veredas
      Municipio.hasMany(models.Vereda, {
        foreignKey: 'id_municipio_municipios',
        as: 'veredas'
      });

      // Relación con Familia - un municipio puede tener muchas familias
      Municipio.hasMany(models.Familia, {
        foreignKey: 'id_municipio',
        as: 'familias'
      });
    }
  }

  Municipio.init({
    id_municipio: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nombre_municipio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    codigo_dane: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    id_departamento: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'departamentos',
        key: 'id_departamento'
      }
    }
  }, {
    sequelize,
    modelName: 'Municipio',
    tableName: 'municipios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Municipio;
};
