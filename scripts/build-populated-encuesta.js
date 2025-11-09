import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load models
import models from '../src/models/index.js';
const {
  sequelize,
  Municipios,
  Parroquia,
  Sector,
  Veredas,
  Corregimientos,
  CentrosPoblados,
  TipoVivienda,
  TipoDisposicionBasura,
  TipoAguasResiduales,
  SistemaAcueducto
} = models;

async function build() {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    const municipio = await Municipios.findOne({ order: [['nombre_municipio','ASC']] });
    const municipioObj = municipio ? { id: String(municipio.id_municipio), nombre: municipio.nombre_municipio } : null;

  const parroquia = municipio ? await Parroquia.findOne({ where: { id_municipio: municipio.id_municipio }, order: [['nombre','ASC']] }) : null;
    const parroquiaObj = parroquia ? { id: String(parroquia.id_parroquia), nombre: parroquia.nombre } : null;

    const sector = municipio ? await Sector.findOne({ where: { id_municipio: municipio.id_municipio }, order: [['nombre','ASC']] }) : null;
    const sectorObj = sector ? { id: String(sector.id_sector), nombre: sector.nombre } : null;

    // Algunos modelos usan nombres de FK diferentes (p. ej. id_municipio_municipios)
    const pickFkAndFindOne = async (Model, municipioId) => {
      if (!Model) return null;
      const attrs = Model.rawAttributes || {};
      // buscar key que contenga 'id_municipio'
      const fkKey = Object.keys(attrs).find(k => k.toLowerCase().includes('id_municipio')) || Object.keys(attrs).find(k => k.includes('id_municipio'));
      const where = fkKey ? { [fkKey]: municipioId } : {};
      return await Model.findOne({ where, order: [['nombre','ASC']] });
    };

    const vereda = municipio ? await pickFkAndFindOne(Veredas, municipio.id_municipio) : null;
    const veredaObj = vereda ? { id: String(vereda.id_vereda), nombre: vereda.nombre } : null;

    const corregimiento = municipio ? await pickFkAndFindOne(Corregimientos, municipio.id_municipio) : null;
    const corregimientoObj = corregimiento ? { id: String(corregimiento.id_corregimiento), nombre: corregimiento.nombre } : null;

    const centro = municipio ? await pickFkAndFindOne(CentrosPoblados, municipio.id_municipio) : null;
    const centroObj = centro ? { id: String(centro.id_centro_poblado), nombre: centro.nombre } : null;

    const tiposVivienda = await TipoVivienda.findAll({ order: [['nombre','ASC']] });
    const firstTipoVivienda = tiposVivienda && tiposVivienda.length>0 ? { id: String(tiposVivienda[0].id_tipo_vivienda), nombre: tiposVivienda[0].nombre } : null;

    const disposiciones = await TipoDisposicionBasura.findAll({ order: [['nombre','ASC']] });
    const disposicionArr = disposiciones.map(d => ({ id: d.id_tipo_disposicion_basura || d.id || String(d.id_tipo_disposicion_basura), nombre: d.nombre, seleccionado: false }));

    const aguas = await TipoAguasResiduales.findAll({ order: [['nombre','ASC']] });
    const aguasArr = aguas.map(a => ({ id: a.id_tipo_aguas_residuales || a.id || String(a.id_tipo_aguas_residuales), nombre: a.nombre, seleccionado: false }));

    const sistemas = await SistemaAcueducto.findAll({ order: [['nombre','ASC']] });
    const sistemaObj = sistemas && sistemas.length>0 ? { id: String(sistemas[0].id_sistema_acueducto || sistemas[0].id), nombre: sistemas[0].nombre } : null;

    const output = {
      informacionGeneral: {
        municipio: municipioObj,
        parroquia: parroquiaObj,
        sector: sectorObj,
        vereda: veredaObj,
        corregimiento: corregimientoObj,
        centro_poblado: centroObj,
        fecha: new Date().toISOString(),
        apellido_familiar: '',
        direccion: '',
        telefono: '',
        numero_contrato_epm: ''
      },
      vivienda: {
        tipo_vivienda: firstTipoVivienda,
        disposicion_basuras: disposicionArr
      },
      servicios_agua: {
        sistema_acueducto: sistemaObj,
        aguas_residuales: aguasArr,
        pozo_septico: false,
        letrina: false,
        campo_abierto: false
      },
      observaciones: {
        sustento_familia: '',
        observaciones_encuestador: '',
        autorizacion_datos: false
      },
      familyMembers: [],
      deceasedMembers: [],
      metadata: {
        timestamp: new Date().toISOString(),
        completed: false,
        currentStage: 1
      },
      version: '2.0'
    };

    const outPath = path.join(__dirname, '..', 'output', 'encuesta-populated.json');
    // ensure output dir
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

    console.log('Wrote', outPath);
    await sequelize.close();
  } catch (error) {
    console.error('Error building JSON:', error);
    process.exit(1);
  }
}

build();
