import sequelize from '../../config/sequelize.js';
import Usuario from './Usuario.js';
import Role from './Role.js';
import UsuarioRole from './UsuarioRole.js';
import Parroquia from './catalog/Parroquia.js';
import Veredas from './catalog/Veredas.js';
import Sexo from './catalog/Sexo.js';
import Municipios from './catalog/Municipios.js';
import Departamentos from './catalog/Departamentos.js';
import Sector from './catalog/Sector.js';
import TipoIdentificacion from './catalog/TipoIdentificacion.js';
import Familias from './catalog/Familias.js';

// Catalog model associations
// COMENTADO: Asociaciones movidas a src/models/catalog/index.js para evitar duplicados
/*
// Asociaciones de Departamentos y Municipios
Departamentos.hasMany(Municipios, {
  foreignKey: 'id_departamento',
  as: 'municipios'
});

Municipios.belongsTo(Departamentos, {
  foreignKey: 'id_departamento',
  as: 'departamentoData'
});
*/

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

// COMENTADO: Todas las asociaciones movidas a archivos específicos para evitar duplicados
/*
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
*/

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

// COMENTADO: Asociaciones many-to-many movidas para evitar duplicados
/*
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
*/

// Re-export everything including new models
export default {
  sequelize,
  Usuario,
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

// Define associations between Usuario and Role
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

export {
  sequelize,
  Usuario,
  Role,
  UsuarioRole,
  Parroquia,
  Veredas,
  Sexo,
  Municipios,
  Departamentos,
  Sector,
  TipoIdentificacion,
  Familias
};
