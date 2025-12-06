```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

const PersonaHabilidad = sequelize.define('PersonaHabilidad', {
  id_persona_habilidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_persona: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'personas',
      key: 'id_persona'
    }
  },
  id_habilidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'habilidades',
      key: 'id_habilidad'
    }
  },
  nivel: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'persona_habilidad',
  timestamps: true
});

PersonaHabilidad.associate = (models) => {
  PersonaHabilidad.belongsTo(models.Persona, { foreignKey: 'id_persona' });
  PersonaHabilidad.belongsTo(models.Habilidad, { foreignKey: 'id_habilidad' });
};

export default PersonaHabilidad;
```
