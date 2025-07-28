import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const Familias = sequelize.define('Familias', {
  id_familia: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  // Existing fields from original table
  codigo_familia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  nombre_familia: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  direccion_familia: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  numero_contacto: {
    type: DataTypes.STRING(20),
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
  id_sistemas_acueducto: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_tipos_disposicion_basura: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  id_tipos_aguas_residuales: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
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
  },
  // New fields according to user schema (will be added by migration)
  jefe_familia: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre del jefe de familia'
  },
  numero_miembros: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Número de miembros en la familia',
    validate: {
      min: 0
    }
  },
  estado_encuesta: {
    type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada', 'revisada'),
    allowNull: true,
    defaultValue: 'pendiente',
    comment: 'Estado actual de la encuesta familiar'
  },
  fecha_encuesta: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de realización de la encuesta'
  },
  encuestador: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nombre del encuestador'
  }
}, {
  sequelize,
  modelName: 'Familias',
  tableName: 'familias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_familias_estado_encuesta',
      fields: ['estado_encuesta']
    },
    {
      name: 'idx_familias_vereda',
      fields: ['id_vereda']
    },
    {
      name: 'idx_familias_municipio',
      fields: ['id_municipio']
    },
    {
      name: 'idx_familias_codigo',
      fields: ['codigo_familia']
    }
  ]
});

// Métodos de instancia
Familias.prototype.toSafeJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

// Métodos estáticos
Familias.findActiveByVereda = function(veredaId) {
  return this.findAll({
    include: [{
      association: 'veredas',
      where: { id_vereda: veredaId },
      through: { where: { activa: true } }
    }],
    where: { activa: true }
  });
};

Familias.countByEstadoEncuesta = function(estado = null) {
  const where = {};
  if (estado) {
    where.estado_encuesta = estado;
  }
  return this.count({ where });
};

Familias.findByCodigoFamilia = function(codigo) {
  return this.findOne({
    where: { 
      codigo_familia: codigo
    }
  });
};

export default Familias;
