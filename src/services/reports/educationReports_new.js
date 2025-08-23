import { Op } from 'sequelize';
import { 
  Familias, 
  Municipios, 
  Veredas, 
  Parroquia,
  Estudio
} from '../../models/index.js';

/**
 * Servicio para reportes de educación - Versión simplificada
 */
class EducationReports {

  /**
   * Reporte: Familias con necesidades educativas
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getFamiliasConNecesidadesEducativas(filters = {}) {
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
      title: 'Reporte de Familias con Necesidades Educativas',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamilia: familia.apellido_familia || '',
        numeroIntegrantes: familia.numero_integrantes || 0,
        telefono: familia.telefono || familia.celular || '',
        direccion: familia.direccion || '',
        observaciones: 'Evaluación educativa pendiente'
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Estadísticas educativas
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getEstadisticasEducativas(filters = {}) {
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

    return {
      title: 'Estadísticas Educativas',
      data: {
        resumen: {
          totalFamilias,
          totalIntegrantes,
          familiasEvaluadas: 0,
          necesidadesIdentificadas: 0
        },
        recomendaciones: [
          'Evaluar nivel educativo por integrante',
          'Identificar necesidades de alfabetización',
          'Coordinar con instituciones educativas'
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
}

export default new EducationReports();
