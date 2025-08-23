import { Op } from 'sequelize';
import { 
  Familias, 
  Municipios, 
  Veredas, 
  Parroquia 
} from '../../models/index.js';

/**
 * Servicio para reportes de ayuda social y necesidades - Versión simplificada
 */
class SocialReports {

  /**
   * Reporte: Familias con necesidades de vestuario
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getAyudasVestuario(filters = {}) {
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
      title: 'Reporte de Familias con Necesidades de Vestuario',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        observaciones: 'Evaluación pendiente de necesidades específicas'
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Familias con necesidades de transporte
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getAyudasTransporte(filters = {}) {
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
      title: 'Reporte de Familias con Necesidades de Transporte',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        vereda: familia.vereda?.nombre || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        distanciaAproxCabecera: 'Pendiente de medición',
        necesidadTransporte: 'Evaluación pendiente'
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Familias con necesidades alimentarias
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getAyudasAlimentarias(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' }
      ],
      order: [['numero_integrantes', 'DESC']]
    });

    return {
      title: 'Reporte de Familias con Necesidades Alimentarias',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        prioridadAyuda: this.determinarPrioridadAlimentaria(familia.numero_integrantes),
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        observaciones: 'Evaluación socioeconómica pendiente'
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Estadísticas de ayudas sociales
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getEstadisticasAyudas(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Parroquia, as: 'parroquia' }
      ]
    });

    const totalFamilias = familias.length;
    const totalIntegrantes = familias.reduce((sum, f) => sum + (f.numero_integrantes || 0), 0);

    // Categorización por necesidades estimadas
    const familiasGrandes = familias.filter(f => (f.numero_integrantes || 0) >= 5).length;
    const familiasPequenas = familias.filter(f => (f.numero_integrantes || 0) <= 2).length;

    return {
      title: 'Estadísticas de Ayudas Sociales',
      data: {
        resumen: {
          totalFamilias,
          totalIntegrantes,
          familiasConMayorNecesidad: familiasGrandes,
          familiasConMenorNecesidad: familiasPequenas
        },
        distribucionPorTamano: {
          grandes: familiasGrandes,
          medianas: totalFamilias - familiasGrandes - familiasPequenas,
          pequenas: familiasPequenas
        },
        recomendaciones: [
          'Priorizar familias numerosas para ayudas alimentarias',
          'Evaluar necesidades específicas de vestuario por edades',
          'Considerar distancia geográfica para ayudas de transporte'
        ]
      },
      total: totalFamilias,
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
   * Determinar prioridad de ayuda alimentaria basada en número de integrantes
   */
  determinarPrioridadAlimentaria(numeroIntegrantes) {
    const num = numeroIntegrantes || 0;
    
    if (num >= 6) return 'Alta';
    if (num >= 4) return 'Media';
    if (num >= 2) return 'Baja';
    return 'Muy Baja';
  }
}

export default new SocialReports();
