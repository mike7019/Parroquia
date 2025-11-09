import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

/**
 * Modelo PersonaCelebracion
 * Tabla intermedia para almacenar las celebraciones de cada persona
 * Registra fechas importantes (cumpleaños, aniversarios, etc.) por persona
 */
const PersonaCelebracion = sequelize.define('PersonaCelebracion', {
  id_persona_celebracion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'ID único de la celebración'
  },
  id_persona: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'personas',
      key: 'id_persona'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'FK a la tabla personas'
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Motivo de la celebración (Cumpleaños, Aniversario, etc.)'
  },
  dia: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      is: /^(0?[1-9]|[12][0-9]|3[01])$/,
      len: [1, 2]
    },
    comment: 'Día del mes (1-31)'
  },
  mes: {
    type: DataTypes.STRING(2),
    allowNull: false,
    validate: {
      is: /^(0?[1-9]|1[0-2])$/,
      len: [1, 2]
    },
    comment: 'Mes del año (1-12)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'persona_celebracion',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_persona', 'motivo', 'dia', 'mes'],
      name: 'unique_persona_celebracion'
    },
    {
      fields: ['id_persona'],
      name: 'idx_persona_celebracion_persona'
    },
    {
      fields: ['mes'],
      name: 'idx_persona_celebracion_mes'
    },
    {
      fields: ['dia', 'mes'],
      name: 'idx_persona_celebracion_fecha'
    }
  ],
  comment: 'Celebraciones asociadas a cada persona (cumpleaños, aniversarios, etc.)'
});

export default PersonaCelebracion;
