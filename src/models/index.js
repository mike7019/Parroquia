import sequelize from '../../config/sequelize.js';
import Usuario from './Usuario.js';
import Role from './Role.js';
import UsuarioRole from './UsuarioRole.js';

// Import all catalog models individually to avoid circular dependencies
import TipoIdentificacion from './catalog/TipoIdentificacion.js';
import Parroquia from './catalog/Parroquia.js';
import Sexo from './catalog/Sexo.js';
import Sector from './catalog/Sector.js';
import Veredas from './catalog/Veredas.js';
import Municipios from './catalog/Municipios.js';
import Departamentos from './catalog/Departamentos.js';
import Familias from './catalog/Familias.js';
import TipoDisposicionBasura from './catalog/TipoDisposicionBasura.js';
import FamiliaDisposicionBasura from './catalog/FamiliaDisposicionBasura.js';
import TipoAguasResiduales from './catalog/TipoAguasResiduales.js';
import TipoVivienda from './catalog/TipoVivienda.js';
import ComunidadCultural from './catalog/ComunidadCultural.js';
import DifuntosFamilia from './catalog/DifuntosFamilia.js';
import Persona from './catalog/Persona.js';

// Import other models individually
import Enfermedad from './catalog/Enfermedad.js';
import Parentesco from './catalog/Parentesco.js';
import SituacionCivil from './catalog/SituacionCivil.js';
import Estudio from './catalog/Estudio.js';
import Talla from './catalog/Talla.js';

// Create User alias for compatibility
const User = Usuario;

try {
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
  
  console.log('✅ Asociaciones Usuario-Role configuradas');
} catch (error) {
  console.log('⚠️  Error configurando asociaciones Usuario-Role:', error.message);
}

console.log('✅ Modelos cargados sin asociaciones conflictivas');

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
