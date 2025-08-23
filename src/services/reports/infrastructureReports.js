import { Op } from 'sequelize';
import { 
  Familias, 
  Municipios, 
  Veredas, 
  Parroquia 
} from '../../models/index.js';

/**
 * Servicio para reportes de infraestructura
 */
class InfrastructureReports {

  /**
   * Reporte: Tipos de vivienda
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getTiposVivienda(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);
    
    // Añadir filtro por tipo de vivienda si se especifica
    if (filters.tipoVivienda) {
      whereConditions.tipo_vivienda = { [Op.iLike]: `%${filters.tipoVivienda}%` };
    }

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' }
      ],
      order: [['tipo_vivienda', 'ASC'], ['nombre_familia', 'ASC']]
    });

    // Agrupar por tipo de vivienda
    const agrupado = familias.reduce((acc, familia) => {
      const tipo = familia.tipo_vivienda || 'Sin especificar';
      if (!acc[tipo]) {
        acc[tipo] = [];
      }
      acc[tipo].push(familia);
      return acc;
    }, {});

    return {
      title: 'Reporte de Tipos de Vivienda en la Parroquia',
      data: familias.map(familia => ({
        tipoVivienda: familia.tipo_vivienda || 'Sin especificar',
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamiliar: familia.nombre_familia,
        direccion: familia.direccion_familia,
        telefono: familia.numero_contacto
      })),
      summary: Object.keys(agrupado).map(tipo => ({
        tipoVivienda: tipo,
        cantidadFamilias: agrupado[tipo].length,
        porcentaje: ((agrupado[tipo].length / familias.length) * 100).toFixed(2)
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Tratamiento de basuras
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getTratamientoBasuras(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);
    
    // Filtrar por tipo de disposición de basura si se especifica
    if (filters.tipoBasura) {
      // Buscar en la tabla relacionada tipos_disposicion_basura
      whereConditions.id_tipos_disposicion_basura = filters.tipoBasura;
    }

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' },
        // Incluir la relación con tipos de disposición de basura si existe
        {
          model: 'TiposDisposicionBasura', // Ajustar según el modelo real
          as: 'tipoDisposicionBasura',
          required: false
        }
      ],
      order: [['nombre_familia', 'ASC']]
    });

    return {
      title: 'Reporte de Tratamiento de Basuras',
      data: familias.map(familia => ({
        tipoTratamiento: familia.tipoDisposicionBasura?.nombre || 'Sin especificar',
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamiliar: familia.nombre_familia,
        direccion: familia.direccion_familia,
        telefono: familia.numero_contacto
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Acceso hídrico (sistemas de acueducto)
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getAccesoHidrico(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);
    
    // Filtrar por tipo de acueducto si se especifica
    if (filters.tipoAcueducto) {
      whereConditions.id_sistemas_acueducto = filters.tipoAcueducto;
    }

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' },
        // Incluir la relación con sistemas de acueducto si existe
        {
          model: 'SistemasAcueducto', // Ajustar según el modelo real
          as: 'sistemaAcueducto',
          required: false
        }
      ],
      order: [['nombre_familia', 'ASC']]
    });

    return {
      title: 'Reporte de Acceso Hídrico',
      data: familias.map(familia => ({
        tipoAcceso: familia.sistemaAcueducto?.nombre || 'Sin especificar',
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamiliar: familia.nombre_familia,
        direccion: familia.direccion_familia,
        telefono: familia.numero_contacto
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte: Tratamiento de aguas residuales
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte
   */
  async getTratamientoAguasResiduales(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);
    
    // Filtrar por tipo de aguas residuales si se especifica
    if (filters.tipoAguasResiduales) {
      whereConditions.id_tipos_aguas_residuales = filters.tipoAguasResiduales;
    }

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' },
        // Incluir la relación con tipos de aguas residuales si existe
        {
          model: 'TiposAguasResiduales', // Ajustar según el modelo real
          as: 'tipoAguasResiduales',
          required: false
        }
      ],
      order: [['nombre_familia', 'ASC']]
    });

    return {
      title: 'Reporte de Tratamiento de Aguas Residuales',
      data: familias.map(familia => ({
        tipoTratamiento: familia.tipoAguasResiduales?.nombre || 'Sin especificar',
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamiliar: familia.nombre_familia,
        direccion: familia.direccion_familia,
        telefono: familia.numero_contacto
      })),
      total: familias.length,
      filters: filters
    };
  }

  /**
   * Reporte consolidado de infraestructura
   * @param {Object} filters - Filtros de consulta
   * @returns {Object} Datos del reporte consolidado
   */
  async getReporteInfraestructuraConsolidado(filters = {}) {
    const whereConditions = this.buildFamiliaWhereConditions(filters);

    const familias = await Familias.findAll({
      where: whereConditions,
      include: [
        { model: Municipios, as: 'municipio' },
        { model: Veredas, as: 'vereda' },
        { model: Parroquia, as: 'parroquia' }
      ],
      order: [['nombre_familia', 'ASC']]
    });

    // Estadísticas por tipo
    const estadisticas = {
      vivienda: this.getInfraestructureStats(familias, 'tipo_vivienda'),
      agua: this.getInfraestructureStats(familias, 'sistema_agua'),
      basura: this.getInfraestructureStats(familias, 'tipo_basura'),
      aguasResiduales: this.getInfraestructureStats(familias, 'aguas_residuales')
    };

    return {
      title: 'Reporte Consolidado de Infraestructura',
      data: familias.map(familia => ({
        parroquia: familia.parroquia?.nombre || '',
        municipio: familia.municipio?.nombre_municipio || '',
        sector: familia.sector || '',
        apellidoFamiliar: familia.nombre_familia,
        direccion: familia.direccion_familia,
        telefono: familia.numero_contacto,
        tipoVivienda: familia.tipo_vivienda || 'Sin especificar',
        sistemaAgua: familia.sistema_agua || 'Sin especificar',
        tratamientoBasura: familia.tipo_basura || 'Sin especificar',
        aguasResiduales: familia.aguas_residuales || 'Sin especificar'
      })),
      estadisticas: estadisticas,
      total: familias.length,
      filters: filters
    };
  }

  // === MÉTODOS AUXILIARES ===

  /**
   * Construir condiciones WHERE para Familia
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

    if (filters.apellidoFamiliar) {
      conditions.nombre_familia = { [Op.iLike]: `%${filters.apellidoFamiliar}%` };
    }

    return conditions;
  }

  /**
   * Obtener estadísticas de infraestructura por campo
   */
  getInfraestructureStats(familias, campo) {
    const conteo = familias.reduce((acc, familia) => {
      const valor = familia[campo] || 'Sin especificar';
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(conteo).map(tipo => ({
      tipo: tipo,
      cantidad: conteo[tipo],
      porcentaje: ((conteo[tipo] / familias.length) * 100).toFixed(2)
    })).sort((a, b) => b.cantidad - a.cantidad);
  }
}

export default new InfrastructureReports();
