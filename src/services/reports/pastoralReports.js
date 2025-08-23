import { Op } from 'sequelize';
import { 
  Familias, 
  Municipios, 
  Veredas, 
  Parroquia,
  SituacionCivil
} from '../../models/index.js';

/**
 * Servicio para reportes pastorales - Versión simplificada
 */
class PastoralReports {

  /**
   * Reporte: Familias por situación civil
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getPersonasPorEstadoCivil(filters = {}) {
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
      title: 'Reporte de Familias para Actividades Pastorales',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        observaciones: 'Seguimiento pastoral pendiente'
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Familias para seguimiento pastoral
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getFamiliasParaPastoral(filters = {}) {
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
      title: 'Reporte de Familias para Seguimiento Pastoral',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        vereda: familia.vereda?.nombre || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        prioridadVisita: this.determinarPrioridadPastoral(familia.numero_integrantes),
        fechaUltimaVisita: 'Pendiente de registro'
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

  /**
   * Determinar prioridad pastoral basada en tamaño de familia
   */
  determinarPrioridadPastoral(numeroIntegrantes) {
    const num = numeroIntegrantes || 0;
    
    if (num >= 5) return 'Alta';
    if (num >= 3) return 'Media';
    return 'Baja';
  }
}

export default new PastoralReports();
