import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const PersonaLiderazgo = sequelize.define('PersonaLiderazgo', {
  id_persona_liderazgo: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  id_persona: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: { model: 'personas', key: 'id_personas' }
  },
  id_tipo_liderazgo: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: { model: 'tipos_liderazgo', key: 'id_tipo_liderazgo' }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: { args: [0, 1000], msg: 'La descripción no puede exceder los 1000 caracteres' }
    }
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'PersonaLiderazgo',
  tableName: 'persona_liderazgo',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['id_persona', 'id_tipo_liderazgo'] },
    { fields: ['id_persona'] },
    { fields: ['id_tipo_liderazgo'] }
  ]
});

PersonaLiderazgo.associate = (models) => {
  PersonaLiderazgo.belongsTo(models.Persona, { foreignKey: 'id_persona', as: 'persona' });
  PersonaLiderazgo.belongsTo(models.TipoLiderazgo, { foreignKey: 'id_tipo_liderazgo', as: 'tipoLiderazgo' });
};

export default PersonaLiderazgo;
