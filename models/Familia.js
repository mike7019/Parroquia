'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Familia extends Model {
    static associate(models) {
      // Relaciones existentes pueden mantenerse
      Familia.hasMany(models.Persona, {
        foreignKey: 'id_familia',
        as: 'personas'
      });

      // Nuevas relaciones para el sistema de encuestas
      Familia.belongsTo(models.Municipios, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Familia.belongsTo(models.Veredas, {
        foreignKey: 'id_vereda',
        as: 'vereda'
      });
    }
  }

  Familia.init({
    id_familia: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    // Campos actualizados según documentación
    familyHead: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'nombre_familia', // Mapeo al campo existente
      validate: {
        notEmpty: true,
        len: [2, 200]
      }
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'direccion_familia', // Mapeo al campo existente
      validate: {
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'numero_contacto', // Mapeo al campo existente
      validate: {
        len: [10, 20]
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    familySize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tamaño_familia',
      validate: {
        min: 1,
        max: 50
      }
    },
    housingType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'tipo_vivienda',
      validate: {
        notEmpty: true
      }
    },
    surveyStatus: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      allowNull: false,
      field: 'estado_encuesta',
      defaultValue: 'pending'
    },
    surveysCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'numero_encuestas',
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    lastSurveyDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_ultima_encuesta'
    },
    // Campos existentes mantenidos
    codigo_familia: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tutor_responsable: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Relaciones geográficas
    id_municipio: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_vereda: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    id_sector: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Familia',
    tableName: 'familias',
    timestamps: false
  });

  return Familia;
};
