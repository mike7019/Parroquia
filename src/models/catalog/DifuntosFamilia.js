import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

/**
 * Modelo para difuntos_familia
 */
const DifuntosFamilia = sequelize.define('DifuntosFamilia', {
  id_difunto: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    field: 'id_difunto'
  },
  nombre_completo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'nombre_completo',
    validate: {
      notEmpty: {
        msg: 'El nombre completo es requerido'
      },
      len: {
        args: [2, 255],
        msg: 'El nombre debe tener entre 2 y 255 caracteres'
      }
    }
  },
  fecha_fallecimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_fallecimiento',
    validate: {
      notNull: {
        msg: 'La fecha de fallecimiento es requerida'
      },
      isDate: {
        msg: 'Debe ser una fecha válida'
      }
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'observaciones'
  },
  id_familia_familias: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'id_familia_familias',
    references: {
      model: 'familias',
      key: 'id_familia'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
  }
}, {
  tableName: 'difuntos_familia',
  timestamps: true,
  indexes: [
    {
      name: 'idx_difuntos_familia_familia',
      fields: ['id_familia_familias']
    },
    {
      name: 'idx_difuntos_fecha_fallecimiento',
      fields: ['fecha_fallecimiento']
    }
  ]
});

// Define associations
DifuntosFamilia.associate = function(models) {
  if (models.Familias) {
    DifuntosFamilia.belongsTo(models.Familias, {
      foreignKey: 'id_familia_familias',
      as: 'familia'
    });
  }
};

// Método para buscar difuntos por familia
DifuntosFamilia.findByFamilia = function(familiaId) {
  return this.findAll({
    where: {
      id_familia_familias: familiaId
    },
    order: [['fecha_fallecimiento', 'DESC']]
  });
};

// Método para buscar difuntos por rango de fechas
DifuntosFamilia.findByDateRange = function(fechaInicio, fechaFin) {
  const whereClause = {};
  
  if (fechaInicio && fechaFin) {
    whereClause.fecha_fallecimiento = {
      [sequelize.Sequelize.Op.between]: [fechaInicio, fechaFin]
    };
  } else if (fechaInicio) {
    whereClause.fecha_fallecimiento = {
      [sequelize.Sequelize.Op.gte]: fechaInicio
    };
  } else if (fechaFin) {
    whereClause.fecha_fallecimiento = {
      [sequelize.Sequelize.Op.lte]: fechaFin
    };
  }
  
  return this.findAll({
    where: whereClause,
    order: [['fecha_fallecimiento', 'DESC']]
  });
};

// Método para buscar difuntos por aniversario (mes y día)
DifuntosFamilia.findByAniversario = function(mes, dia = null) {
  const whereClause = {};
  
  if (dia) {
    // Buscar por fecha específica (mes y día)
    whereClause[sequelize.Sequelize.Op.and] = [
      sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), mes),
      sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('day FROM fecha_fallecimiento')), dia)
    ];
  } else {
    // Buscar solo por mes
    whereClause[sequelize.Sequelize.Op.and] = [
      sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('month FROM fecha_fallecimiento')), mes)
    ];
  }
  
  return this.findAll({
    where: whereClause,
    order: [['fecha_fallecimiento', 'DESC']]
  });
};

export default DifuntosFamilia;
