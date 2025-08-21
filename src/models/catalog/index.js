import TipoIdentificacion from './TipoIdentificacion.js';
import Parroquia from './Parroquia.js';
import Sexo from './Sexo.js';
import Sector from './Sector.js';
import Veredas from './Veredas.js';
import Municipios from './Municipios.js';
import Departamentos from './Departamentos.js';
import Familias from './Familias.js';
import TipoDisposicionBasura from './TipoDisposicionBasura.js';
import FamiliaDisposicionBasura from './FamiliaDisposicionBasura.js';
import TipoAguasResiduales from './TipoAguasResiduales.js';
import TipoVivienda from './TipoVivienda.js';
import ComunidadCultural from './ComunidadCultural.js';

// Definir asociaciones
Departamentos.hasMany(Municipios, {
    foreignKey: 'id_departamento',
    as: 'municipios'
});

Municipios.belongsTo(Departamentos, {
    foreignKey: 'id_departamento',
    as: 'departamento'
});

// Asociación entre Municipios y Parroquias
Municipios.hasMany(Parroquia, {
    foreignKey: 'id_municipio',
    as: 'parroquias'
});

Parroquia.belongsTo(Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
});

Municipios.hasMany(Veredas, {
    foreignKey: 'id_municipio_municipios',
    as: 'veredas'
});

Veredas.belongsTo(Municipios, {
    foreignKey: 'id_municipio_municipios',
    as: 'municipio'
});

// Asociaciones entre Municipios y Sectores
Municipios.hasMany(Sector, {
    foreignKey: 'id_municipio',
    as: 'sectores'
});

Sector.belongsTo(Municipios, {
    foreignKey: 'id_municipio',
    as: 'municipio'
});

// COMENTADO: Asociaciones con Sector que causan problemas porque id_sector no existe en BD
/*
Sector.hasMany(Veredas, {
    foreignKey: 'id_sector',
    as: 'veredasBySector'
});

Veredas.belongsTo(Sector, {
    foreignKey: 'id_sector',
    as: 'sector'
});
*/

// Asociaciones para Disposición de Basura
TipoDisposicionBasura.hasMany(FamiliaDisposicionBasura, {
    foreignKey: 'id_tipo_disposicion_basura',
    as: 'FamiliaDisposicionBasuras'
});

FamiliaDisposicionBasura.belongsTo(TipoDisposicionBasura, {
    foreignKey: 'id_tipo_disposicion_basura',
    as: 'TipoDisposicionBasura'
});

Familias.hasMany(FamiliaDisposicionBasura, {
    foreignKey: 'id_familia',
    as: 'DisposicionBasuras'
});

FamiliaDisposicionBasura.belongsTo(Familias, {
    foreignKey: 'id_familia',
    as: 'Familia'
});

export {
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
    ComunidadCultural
};
