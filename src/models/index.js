import sequelize from '../../config/sequelize.js';
import Usuario from './Usuario.js';
import Role from './Role.js';
import UsuarioRole from './UsuarioRole.js';

// Import all catalog models and their associations
import {
  TipoIdentificacion,
  Parroquia,
  Sexo,
  Sector,
  Veredas,
  Municipios,
  Departamentos,
  Familias,
  TipoDisposicionBasura,
  FamiliaDisposicionBasura,
  TipoAguasResiduales,
  TipoVivienda,
  ComunidadCultural,
  DifuntosFamilia
} from './catalog/index.js';

// Import other models individually
import Enfermedad from './catalog/Enfermedad.js';
import Persona from './catalog/Persona.js';
import Parentesco from './catalog/Parentesco.js';
import SituacionCivil from './catalog/SituacionCivil.js';
import Estudio from './catalog/Estudio.js';
import Talla from './catalog/Talla.js';

// Create User alias for compatibility
const User = Usuario;

// Define associations for Usuario and Role models
Usuario.belongsToMany(Role, {
  through: UsuarioRole,
  foreignKey: 'id_usuarios',
  otherKey: 'id_roles',
  as: 'roles'
});

Role.belongsToMany(Usuario, {
  through: UsuarioRole,
  foreignKey: 'id_roles',
  otherKey: 'id_usuarios',
  as: 'usuarios'
});

// Re-export everything
export default {
  sequelize,
  Usuario,
  User,
  Role,
  UsuarioRole,
  Parroquia,
  Veredas,
  Sexo,
  Municipios,
  Departamentos,
  Sector,
  TipoIdentificacion,
  Enfermedad,
  Familias,
  Persona,
  TipoVivienda,
  Parentesco,
  SituacionCivil,
  Estudio,
  Talla,
  DifuntosFamilia,
  TipoDisposicionBasura,
  FamiliaDisposicionBasura,
  TipoAguasResiduales,
  ComunidadCultural
};

export {
  sequelize,
  Usuario,
  User,
  Role,
  UsuarioRole,
  Parroquia,
  Veredas,
  Sexo,
  Municipios,
  Departamentos,
  Sector,
  TipoIdentificacion,
  Enfermedad,
  Familias,
  Persona,
  TipoVivienda,
  Parentesco,
  SituacionCivil,
  Estudio,
  Talla,
  DifuntosFamilia,
  TipoDisposicionBasura,
  FamiliaDisposicionBasura,
  TipoAguasResiduales,
  ComunidadCultural
};
