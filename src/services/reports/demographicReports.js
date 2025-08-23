import { Op } from 'sequelize';
import { 
  Familias, 
  Municipios, 
  Veredas, 
  Parroquia,
  Sexo,
  SituacionCivil
} from '../../models/index.js';

/**
 * Servicio para reportes demográficos - Versión simplificada basada en Familias
 */
class DemographicReports {

  /**
   * Reporte: Beneficiarios - Todos los inscritos
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getBeneficiarios(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' }
      ],
      order: [['apellido_familia', 'ASC']]
    });

    return {
      title: 'Reporte de Beneficiarios',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        integrantes: familia.numero_integrantes || 0
      })),
      total: familias.length,
      totalIntegrantes: familias.reduce((sum, f) => sum + (f.numero_integrantes || 0), 0),
      filters: filters
    };
  }

  /**
   * Reporte: Familias vinculadas
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getFamiliasVinculadas(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);
    
    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' }
      ],
      order: [['apellido_familia', 'ASC']]
    });

    return {
      title: 'Reporte de Familias Vinculadas',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        vereda: familia.vereda?.nombre || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        fechaVinculacion: familia.createdAt
      })),
      total: familias.length,
      filters: filters
    };
  }

  // === MÉTODOS AUXILIARES ===

  /**
   * Construir condiciones WHERE para Familias
   */
  buildFamiliaWhereConditions(filters) {
    const conditions = {};

    if (filters.parroquiaId) {
      conditions.id_parroquia = filters.parroquiaId;
    }

    if (filters.municipioId) {
      conditions.id_municipio = filters.municipioId;
    }

    if (filters.veredaId) {
      conditions.id_vereda = filters.veredaId;
    }

    if (filters.sector) {
      conditions.sector = { [Op.iLike]: `%${filters.sector}%` };
    }

    if (filters.apellido) {
      conditions.apellido_familia = { [Op.iLike]: `%${filters.apellido}%` };
    }

    return conditions;
  }
}

export default new DemographicReports();
