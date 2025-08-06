import TipoIdentificacion from './TipoIdentificacion.js';
import Parroquia from './Parroquia.js';
import Sexo from './Sexo.js';
import Sector from './Sector.js';
import Veredas from './Veredas.js';
import Municipios from './Municipios.js';
import Departamentos from './Departamentos.js';
import Familias from './Familias.js';

// Definir asociaciones
Departamentos.hasMany(Municipios, {
    foreignKey: 'id_departamento',
    as: 'municipios'
});

Municipios.belongsTo(Departamentos, {
    foreignKey: 'id_departamento',
    as: 'departamento'
});

Municipios.hasMany(Veredas, {
    foreignKey: 'id_municipio_municipios',
    as: 'veredas'
});

Veredas.belongsTo(Municipios, {
    foreignKey: 'id_municipio_municipios',
    as: 'municipio'
});

Sector.hasMany(Veredas, {
    foreignKey: 'id_sector_sector',
    as: 'veredasBySector'
});

Veredas.belongsTo(Sector, {
    foreignKey: 'id_sector_sector',
    as: 'sector'
});

export {
    TipoIdentificacion,
    Parroquia,
    Sexo,
    Sector,
    Veredas,
    Municipios,
    Departamentos,
    Familias
};
