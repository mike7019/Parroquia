/**
 * Modelo Situación Civil
 * Define los diferentes estados civiles para personas en encuestas familiares
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const SituacionCivil = sequelize.define('SituacionCivil', {
    id_situacion_civil: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_situacion_civil'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'situacion_civil_nombre_unique',
        msg: 'Ya existe una situación civil con este nombre'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre de la situación civil es requerido'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'La descripción no puede exceder 500 caracteres'
        }
      }
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: {
        name: 'situacion_civil_codigo_unique',
        msg: 'Ya existe una situación civil con este código'
      },
      validate: {
        len: {
          args: [0, 10],
          msg: 'El código no puede exceder 10 caracteres'
        }
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'El orden debe ser un número positivo'
        }
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'situaciones_civiles',
    timestamps: true,
    paranoid: true, // Soft delete
    deletedAt: 'fechaEliminacion',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        unique: true,
        fields: ['codigo'],
        where: {
          codigo: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['activo']
      },
      {
        fields: ['orden']
      }
    ],
    scopes: {
      activos: {
        where: {
          activo: true
        }
      },
      inactivos: {
        where: {
          activo: false
        }
      },
      ordenados: {
        order: [['orden', 'ASC'], ['nombre', 'ASC']]
      }
    },
    hooks: {
      beforeValidate: (situacionCivil) => {
        // Limpiar y normalizar el nombre
        if (situacionCivil.nombre) {
          situacionCivil.nombre = situacionCivil.nombre.trim();
        }
        
        // Limpiar y normalizar el código
        if (situacionCivil.codigo) {
          situacionCivil.codigo = situacionCivil.codigo.trim().toUpperCase();
        }
        
        // Limpiar descripción
        if (situacionCivil.descripcion) {
          situacionCivil.descripcion = situacionCivil.descripcion.trim();
        }
      },
      beforeCreate: (situacionCivil) => {
        // Si no se proporciona orden, usar el siguiente disponible
        if (situacionCivil.orden === null || situacionCivil.orden === undefined) {
          return SituacionCivil.max('orden').then(maxOrden => {
            situacionCivil.orden = (maxOrden || 0) + 1;
          });
        }
      }
    }
  });

  // Métodos de instancia
  SituacionCivil.prototype.toJSON = function() {
    const values = { ...this.get() };
    
    // Renombrar el campo para la API
    if (values.id_situacion_civil) {
      values.id = values.id_situacion_civil;
      delete values.id_situacion_civil;
    }
    
    // Ocultar campos internos
    delete values.fechaEliminacion;
    
    return values;
  };

  // Métodos estáticos
  SituacionCivil.findActivos = function(options = {}) {
    return this.scope('activos').findAll({
      order: [['orden', 'ASC'], ['nombre', 'ASC']],
      ...options
    });
  };

  SituacionCivil.findPorCodigo = function(codigo) {
    return this.findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true
      }
    });
  };

  SituacionCivil.buscarPorNombre = function(termino, options = {}) {
    return this.findAll({
      where: {
        nombre: {
          [sequelize.Sequelize.Op.iLike]: `%${termino}%`
        },
        ...options.where
      },
      order: [['nombre', 'ASC']],
      ...options
    });
  };

export default SituacionCivil;
