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
      Familia.belongsTo(models.Municipio, {
        foreignKey: 'id_municipio',
        as: 'municipio'
      });

      Familia.belongsTo(models.Sector, {
        foreignKey: 'id_sector',
        as: 'sectorFamilia'
      });

      Familia.belongsTo(models.Vereda, {
        foreignKey: 'id_vereda_veredas',
        as: 'vereda'
      });

      // Nuevas relaciones muchos a muchos
      Familia.belongsToMany(models.TipoVivienda, {
        through: 'familia_tipo_vivienda',
        foreignKey: 'id_familia',
        otherKey: 'id_tipo_vivienda',
        as: 'tiposVivienda'
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
    apellidoFamiliar: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'apellido_familiar', // Mapeo al campo actualizado
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
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
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
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'estado_encuesta',
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'in_progress', 'completed']]
      }
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
    // Campos eliminados: observaciones y tratamiento_datos se removieron
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
