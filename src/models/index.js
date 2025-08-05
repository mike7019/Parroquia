import sequelize from '../../config/sequelize.js';
import User from './Usuario.js';
import Role from './Role.js';
import UsuarioRole from './UsuarioRole.js';
// import Parroquia from './catalog/Parroquia.js'; // ELIMINADO - duplicado
import Veredas from './catalog/Veredas.js';
// import Sexo from './catalog/Sexo.js'; // ELIMINADO - duplicado
// import Municipio from './catalog/Municipio.js'; // ELIMINADO - duplicado
import Municipios from './catalog/Municipios.js';
import Departamentos from './catalog/Departamentos.js';
// import Sector from './catalog/Sector.js'; // ELIMINADO - duplicado
import TipoIdentificacion from './catalog/TipoIdentificacion.js';
// import Persona from './catalog/Persona.js'; // ELIMINADO - duplicado
import Familias from './catalog/Familias.js';

// Catalog model associations
// Asociaciones de Departamentos y Municipios
Departamentos.hasMany(Municipios, {
  foreignKey: 'id_departamento',
  as: 'municipios'
});

Municipios.belongsTo(Departamentos, {
  foreignKey: 'id_departamento',
  as: 'departamentoData'
});

// Asociaciones comentadas - los modelos están duplicados en main/
/*
Parroquia.hasMany(Persona, {
  foreignKey: 'id_parroquia',
  as: 'personas'
});

Persona.belongsTo(Parroquia, {
  foreignKey: 'id_parroquia',
  as: 'parroquia'
});

Sexo.hasMany(Persona, {
  foreignKey: 'id_sexo',
  as: 'personas'
});

Persona.belongsTo(Sexo, {
  foreignKey: 'id_sexo',
  as: 'sexo'
});
*/

// Usar el modelo Municipios (más completo) en lugar de Municipio
Municipios.hasMany(Veredas, {
  foreignKey: 'id_municipio_municipios',
  targetKey: 'id_municipio',
  as: 'veredas'
});

Veredas.belongsTo(Municipios, {
  foreignKey: 'id_municipio_municipios',
  targetKey: 'id_municipio',
  as: 'municipio'
});

// Asociaciones comentadas - modelos duplicados en main/
/*
Veredas.hasMany(Persona, {
  foreignKey: 'id_vereda',
  as: 'personas'
});

Persona.belongsTo(Veredas, {
  foreignKey: 'id_vereda',
  as: 'vereda'
});

// Sector associations
Sector.hasMany(Veredas, {
  foreignKey: 'id_sector_sector',
  targetKey: 'id_sector',
  as: 'veredas'
});

Veredas.belongsTo(Sector, {
  foreignKey: 'id_sector_sector',
  targetKey: 'id_sector',
  as: 'sector'
});
*/

// Relación entre Municipios y Veredas
// Asociaciones many-to-many entre Veredas y Familias
Veredas.belongsToMany(Familias, {
  through: {
    model: 'veredas_has_many_familias',
    unique: false
  },
  foreignKey: 'id_vereda',
  otherKey: 'id_familia',
  as: 'familias',
  timestamps: false
});

Familias.belongsToMany(Veredas, {
  through: {
    model: 'veredas_has_many_familias',
    unique: false
  },
  foreignKey: 'id_familia',
  otherKey: 'id_vereda',
  as: 'veredas',
  timestamps: false
});

// Re-export everything including new models
export default {
  sequelize,
  User,
  // Parroquia, // ELIMINADO - duplicado
  Veredas,
  // Sexo, // ELIMINADO - duplicado
  // Municipio, // ELIMINADO - duplicado
  Municipios,
  Departamentos,
  // Sector, // ELIMINADO - duplicado
  // Persona, // ELIMINADO - duplicado
  Familias
};

// Define associations between User and Role
User.belongsToMany(Role, {
  through: UsuarioRole,
  foreignKey: 'id_usuarios',
  otherKey: 'id_roles',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UsuarioRole,
  foreignKey: 'id_roles',
  otherKey: 'id_usuarios',
  as: 'usuarios'
});

export {
  sequelize,
  User,
  Role,
  UsuarioRole,
  Veredas,
  Municipios,
  Departamentos,
  TipoIdentificacion,
  Familias
};
