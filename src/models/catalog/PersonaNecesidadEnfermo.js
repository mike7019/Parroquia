import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const PersonaNecesidadEnfermo = sequelize.define('PersonaNecesidadEnfermo', {
  id_persona_necesidad_enfermo: {
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
  id_tipo_necesidad_enfermo: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: { model: 'tipos_necesidad_enfermo', key: 'id_tipo_necesidad_enfermo' }
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
  modelName: 'PersonaNecesidadEnfermo',
  tableName: 'persona_necesidad_enfermo',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['id_persona', 'id_tipo_necesidad_enfermo'] },
    { fields: ['id_persona'] },
    { fields: ['id_tipo_necesidad_enfermo'] }
  ]
});

PersonaNecesidadEnfermo.associate = (models) => {
  PersonaNecesidadEnfermo.belongsTo(models.Persona, { foreignKey: 'id_persona', as: 'persona' });
  PersonaNecesidadEnfermo.belongsTo(models.TipoNecesidadEnfermo, { foreignKey: 'id_tipo_necesidad_enfermo', as: 'tipoNecesidadEnfermo' });
};

export default PersonaNecesidadEnfermo;
