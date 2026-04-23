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
import Corregimientos from './catalog/Corregimientos.js';
import CentrosPoblados from './catalog/CentrosPoblados.js';
import TipoDisposicionBasura from './catalog/TipoDisposicionBasura.js';
// Import FamiliaDisposicionBasura from main (CommonJS) instead of catalog
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const FamiliaDisposicionBasura = require('./main/FamiliaDisposicionBasura.cjs')(sequelize, sequelize.Sequelize.DataTypes);
const FamiliaSistemaAguasResiduales = require('./main/FamiliaSistemaAguasResiduales.cjs')(sequelize, sequelize.Sequelize.DataTypes);
const Destreza = require('./main/Destreza.cjs')(sequelize, sequelize.Sequelize.DataTypes);
const Profesion = require('./main/Profesion.cjs')(sequelize, sequelize.Sequelize.DataTypes);
import TipoAguasResiduales from './catalog/TipoAguasResiduales.js';
import SistemaAcueducto from './catalog/SistemaAcueducto.js';
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
import PersonaCelebracion from './catalog/PersonaCelebracion.js';
import TipoLiderazgo from './catalog/TipoLiderazgo.js';
import PersonaLiderazgo from './catalog/PersonaLiderazgo.js';

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

  // Configuramos las asociaciones críticas para el sistema
  const models = {
    Usuario, User, Role, UsuarioRole, Parroquia, Veredas, Sexo, Municipios, 
    Departamentos, Sector, TipoIdentificacion, Enfermedad, Familias, Persona, 
    TipoVivienda, Parentesco, SituacionCivil, Estudio, Talla, DifuntosFamilia,
    TipoDisposicionBasura, FamiliaDisposicionBasura, TipoAguasResiduales, 
    FamiliaSistemaAguasResiduales, ComunidadCultural, Destreza, Corregimientos, 
    CentrosPoblados, PersonaCelebracion, TipoLiderazgo, PersonaLiderazgo
  };
  // Ejecutar asociaciones de Corregimientos
  if (Corregimientos && typeof Corregimientos.associate === 'function') {
    Corregimientos.associate(models);
    console.log('✅ Asociaciones de Corregimientos configuradas');
  }

  // Ejecutar asociaciones de CentrosPoblados
  if (CentrosPoblados && typeof CentrosPoblados.associate === 'function') {
    CentrosPoblados.associate(models);
    console.log('✅ Asociaciones de CentrosPoblados configuradas');
  }

  // Ejecutar asociaciones de Familias
  if (Familias && typeof Familias.associate === 'function') {
    Familias.associate(models);
    console.log('✅ Asociaciones de Familias configuradas');
  }

  // Ejecutar asociaciones de DifuntosFamilia
  if (DifuntosFamilia && typeof DifuntosFamilia.associate === 'function') {
    DifuntosFamilia.associate(models);
    console.log('✅ Asociaciones de DifuntosFamilia configuradas');
  }

  // Ejecutar asociaciones de FamiliaSistemaAguasResiduales
  if (FamiliaSistemaAguasResiduales && typeof FamiliaSistemaAguasResiduales.associate === 'function') {
    FamiliaSistemaAguasResiduales.associate(models);
    console.log('✅ Asociaciones de FamiliaSistemaAguasResiduales configuradas');
  }

  // Ejecutar asociaciones de FamiliaDisposicionBasura
  if (FamiliaDisposicionBasura && typeof FamiliaDisposicionBasura.associate === 'function') {
    FamiliaDisposicionBasura.associate(models);
    console.log('✅ Asociaciones de FamiliaDisposicionBasura configuradas');
  }

  // Ejecutar asociaciones de Destreza
  if (Destreza && typeof Destreza.associate === 'function') {
    Destreza.associate(models);
    console.log('✅ Asociaciones de Destreza configuradas');
  }

  // Configurar la asociación inversa crítica para las consultas
  if (Familias && DifuntosFamilia) {
    Familias.hasMany(DifuntosFamilia, {
      foreignKey: 'id_familia_familias',
      as: 'difuntos'
    });
    console.log('✅ Asociación Familias -> DifuntosFamilia configurada');
  }

  // Ejecutar asociaciones de otros modelos críticos si existen
  const modelsWithAssociations = [Persona, Municipios, Departamentos, Parroquia, Sector, Veredas];
  
  modelsWithAssociations.forEach(model => {
    if (model && typeof model.associate === 'function') {
      try {
        model.associate(models);
        console.log(`✅ Asociaciones de ${model.name} configuradas`);
      } catch (error) {
        console.log(`⚠️  Error en asociaciones de ${model.name}:`, error.message);
      }
    }
  });

} catch (error) {
  console.log('⚠️  Error configurando asociaciones:', error.message);
}

console.log('✅ Modelos cargados con asociaciones configuradas');

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
  SistemaAcueducto,
  FamiliaSistemaAguasResiduales,
  ComunidadCultural,
  Destreza,
  Profesion,
  Corregimientos,
  CentrosPoblados,
  PersonaCelebracion,
  TipoLiderazgo,
  PersonaLiderazgo
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
  SistemaAcueducto,
  FamiliaSistemaAguasResiduales,
  ComunidadCultural,
  Destreza,
  Profesion,
  Corregimientos,
  CentrosPoblados,
  PersonaCelebracion,
  TipoLiderazgo,
  PersonaLiderazgo
};
