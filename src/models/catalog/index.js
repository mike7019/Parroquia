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
import DifuntosFamilia from './DifuntosFamilia.js';
import Persona from './Persona.js';

// ⚠️  ASOCIACIONES COMENTADAS TEMPORALMENTE PARA EVITAR CONFLICTOS
// Las asociaciones se configurarán en un archivo separado o en el momento de uso
// para evitar problemas de carga circular y duplicación

/*
// Definir asociaciones básicas (solo las esenciales)
console.log('⚠️  Configurando asociaciones para Departamentos...');
try {
    if (Departamentos && Municipios && !Departamentos.associations?.municipios) {
        Departamentos.hasMany(Municipios, {
            foreignKey: 'id_departamento',
            as: 'municipios'
        });
    }
} catch (error) {
    console.log('⚠️  Error configurando asociaciones para Departamentos:', error.message);
}

try {
    if (Municipios && Departamentos && !Municipios.associations?.departamento) {
        Municipios.belongsTo(Departamentos, {
            foreignKey: 'id_departamento',
            as: 'departamento'
        });
    }
} catch (error) {
    console.log('⚠️  Error configurando asociaciones para Municipios:', error.message);
}

// Asociaciones básicas Familias-Persona
try {
    if (Familias && Persona && !Familias.associations?.personas) {
        Familias.hasMany(Persona, {
            foreignKey: 'id_familia_familias',
            as: 'personas'
        });
    }
} catch (error) {
    console.log('⚠️  Error configurando asociaciones para Familias:', error.message);
}

try {
    if (Persona && Familias && !Persona.associations?.familia) {
        Persona.belongsTo(Familias, {
            foreignKey: 'id_familia_familias',
            as: 'familia'
        });
    }
} catch (error) {
    console.log('⚠️  Error configurando asociaciones para Persona:', error.message);
}
*/

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
    ComunidadCultural,
    DifuntosFamilia,
    Persona
};
