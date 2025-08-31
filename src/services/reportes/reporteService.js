/**
 * Servicio coordinador de reportes
 * Integra ExcelService y PDFService con lógica de negocio
 */

import ExcelService from './excelService.js';
import PDFService from './pdfService.js';
import { REPORTE_CONFIG } from '../../config/reportes.js';

class ReporteService {
  constructor() {
    this.excelService = new ExcelService();
    this.pdfService = new PDFService();
    this.cache = new Map();
    this.config = REPORTE_CONFIG;
  }

  /**
   * Genera reporte de familias en Excel
   * @param {Array} familias - Datos de familias
   * @param {Object} filtros - Filtros aplicados
   * @param {Object} opciones - Opciones del reporte
   * @returns {Promise<{buffer: Buffer, filename: string, mimeType: string}>}
   */
  async generarReporteFamiliasExcel(familias, filtros = {}, opciones = {}) {
    console.log('🔄 Iniciando generación de reporte de familias (Excel)...');
    
    try {
      // Validar datos
      this.excelService.validarDatos(familias);
      
      // Verificar cache si está habilitado
      const cacheKey = this.generarCacheKey('familias_excel', filtros, familias.length);
      if (this.config.cache.enabled && this.cache.has(cacheKey)) {
        console.log('📦 Reporte encontrado en cache');
        return this.cache.get(cacheKey);
      }

      // Generar reporte
      const buffer = await this.excelService.generarReporteFamilias(familias, filtros, opciones);
      const filename = this.generarNombreArchivo('Reporte_Familias', 'xlsx', filtros);
      
      const resultado = {
        buffer,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: buffer.length,
        registros: familias.length,
        generadoEn: new Date().toISOString()
      };

      // Guardar en cache
      if (this.config.cache.enabled) {
        this.guardarEnCache(cacheKey, resultado);
      }

      console.log(`✅ Reporte Excel generado: ${filename} (${Math.round(buffer.length / 1024)}KB)`);
      return resultado;
      
    } catch (error) {
      console.error('❌ Error generando reporte Excel:', error.message);
      throw new Error(`Error generando reporte de familias: ${error.message}`);
    }
  }

  /**
   * Genera reporte de difuntos en PDF
   * @param {Array} difuntos - Datos de difuntos
   * @param {Object} filtros - Filtros aplicados
   * @param {Object} opciones - Opciones del reporte
   * @returns {Promise<{buffer: Buffer, filename: string, mimeType: string}>}
   */
  async generarReporteDifuntosPDF(difuntos, filtros = {}, opciones = {}) {
    console.log('🔄 Iniciando generación de reporte de difuntos (PDF)...');
    
    try {
      // Validar datos
      this.pdfService.validarDatos(difuntos);
      
      // Verificar cache
      const cacheKey = this.generarCacheKey('difuntos_pdf', filtros, difuntos.length);
      if (this.config.cache.enabled && this.cache.has(cacheKey)) {
        console.log('📦 Reporte encontrado en cache');
        return this.cache.get(cacheKey);
      }

      // Determinar tipo de reporte (normal o ceremonial)
      const esCeremonial = opciones.ceremonial || filtros.mes_aniversario;
      let buffer;
      
      if (esCeremonial) {
        const fechaAniversario = filtros.fecha_aniversario || 
                                filtros.mes_aniversario || 
                                new Date().toLocaleDateString('es-ES');
        buffer = await this.pdfService.generarReporteCeremonial(difuntos, fechaAniversario, opciones);
      } else {
        buffer = await this.pdfService.generarReporteDifuntos(difuntos, filtros, opciones);
      }
      
      const filename = this.generarNombreArchivo(
        esCeremonial ? 'Reporte_Ceremonial_Difuntos' : 'Reporte_Difuntos', 
        'pdf', 
        filtros
      );
      
      const resultado = {
        buffer,
        filename,
        mimeType: 'application/pdf',
        size: buffer.length,
        registros: difuntos.length,
        tipo: esCeremonial ? 'ceremonial' : 'standard',
        generadoEn: new Date().toISOString()
      };

      // Guardar en cache
      if (this.config.cache.enabled) {
        this.guardarEnCache(cacheKey, resultado);
      }

      console.log(`✅ Reporte PDF generado: ${filename} (${Math.round(buffer.length / 1024)}KB)`);
      return resultado;
      
    } catch (error) {
      console.error('❌ Error generando reporte PDF:', error.message);
      throw new Error(`Error generando reporte de difuntos: ${error.message}`);
    }
  }

  /**
   * Genera reporte estadístico en Excel
   */
  async generarReporteEstadisticasExcel(datos, tipo = 'general', filtros = {}) {
    console.log(`🔄 Iniciando generación de estadísticas Excel (${tipo})...`);
    
    try {
      const buffer = await this.excelService.generarReporteEstadistico(datos, tipo);
      const filename = this.generarNombreArchivo(`Estadisticas_${tipo}`, 'xlsx', filtros);
      
      return {
        buffer,
        filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: buffer.length,
        tipo: 'estadisticas',
        generadoEn: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error generando estadísticas Excel:', error.message);
      throw new Error(`Error generando estadísticas: ${error.message}`);
    }
  }

  /**
   * Genera reporte estadístico en PDF
   */
  async generarReporteEstadisticasPDF(estadisticas, titulo = 'Estadísticas Generales') {
    console.log('🔄 Iniciando generación de estadísticas PDF...');
    
    try {
      const buffer = await this.pdfService.generarReporteEstadisticas(estadisticas, titulo);
      const filename = this.generarNombreArchivo('Estadisticas_General', 'pdf');
      
      return {
        buffer,
        filename,
        mimeType: 'application/pdf',
        size: buffer.length,
        tipo: 'estadisticas',
        generadoEn: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error generando estadísticas PDF:', error.message);
      throw new Error(`Error generando estadísticas PDF: ${error.message}`);
    }
  }

  /**
   * Obtiene los tipos de reportes disponibles
   */
  getTiposReportesDisponibles() {
    return {
      excel: [
        {
          tipo: this.config.tipos.FAMILIAS_EXCEL,
          nombre: 'Reporte de Familias',
          descripcion: 'Listado completo de familias con datos detallados',
          formato: 'Excel (.xlsx)',
          maxRegistros: this.config.excel.maxFilas
        },
        {
          tipo: this.config.tipos.ESTADISTICAS_EXCEL,
          nombre: 'Estadísticas Generales',
          descripcion: 'Reporte estadístico con gráficos y análisis',
          formato: 'Excel (.xlsx)',
          maxRegistros: this.config.excel.maxFilas
        }
      ],
      pdf: [
        {
          tipo: this.config.tipos.DIFUNTOS_PDF,
          nombre: 'Reporte de Difuntos',
          descripcion: 'Registro oficial de personas fallecidas',
          formato: 'PDF (.pdf)',
          maxRegistros: this.config.pdf.maxFilas
        },
        {
          tipo: this.config.tipos.CEREMONIAL_PDF,
          nombre: 'Reporte Ceremonial',
          descripcion: 'Formato ceremonial para aniversarios y memoriales',
          formato: 'PDF (.pdf)',
          maxRegistros: this.config.pdf.maxFilas
        }
      ]
    };
  }

  /**
   * Genera clave para cache
   */
  generarCacheKey(tipo, filtros, cantidadRegistros) {
    const filtrosString = JSON.stringify(filtros);
    return `${tipo}_${cantidadRegistros}_${Buffer.from(filtrosString).toString('base64').slice(0, 10)}`;
  }

  /**
   * Guarda reporte en cache
   */
  guardarEnCache(key, data) {
    if (this.cache.size >= this.config.cache.maxSize) {
      // Eliminar el más antiguo (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Guardar con timestamp para TTL
    const cacheData = {
      ...data,
      cacheTimestamp: Date.now()
    };
    
    this.cache.set(key, cacheData);
    
    // Programar limpieza por TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, this.config.cache.ttl * 1000);
  }

  /**
   * Genera nombre de archivo único
   */
  generarNombreArchivo(base, extension, filtros = {}) {
    const fecha = new Date();
    const timestamp = fecha.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    let sufijo = '';
    if (filtros.municipio) {
      sufijo += `_${filtros.municipio.replace(/\s+/g, '_')}`;
    }
    if (filtros.sector) {
      sufijo += `_${filtros.sector.replace(/\s+/g, '_')}`;
    }
    
    return `${base}${sufijo}_${timestamp}.${extension}`;
  }

  /**
   * Limpia cache manualmente
   */
  limpiarCache() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache limpiado: ${size} reportes eliminados`);
  }

  /**
   * Obtiene estadísticas del cache
   */
  getEstadisticasCache() {
    return {
      tamaño: this.cache.size,
      maximo: this.config.cache.maxSize,
      ttl: this.config.cache.ttl,
      habilitado: this.config.cache.enabled
    };
  }

  /**
   * Valida parámetros de reporte
   */
  validarParametrosReporte(datos, tipo) {
    if (!datos || !Array.isArray(datos)) {
      throw new Error('Los datos son requeridos y deben ser un array');
    }

    if (datos.length === 0) {
      throw new Error('No hay datos disponibles para generar el reporte');
    }

    const tiposValidos = Object.values(this.config.tipos);
    if (tipo && !tiposValidos.includes(tipo)) {
      throw new Error(`Tipo de reporte no válido: ${tipo}. Tipos disponibles: ${tiposValidos.join(', ')}`);
    }

    return true;
  }

  /**
   * Obtiene información del sistema de reportes
   */
  getInfoSistema() {
    return {
      version: this.config.metadatos.version,
      tiposDisponibles: this.getTiposReportesDisponibles(),
      configuracion: {
        excel: {
          maxFilas: this.config.excel.maxFilas,
          streaming: this.config.excel.streamingThreshold,
          filtrosAutomaticos: this.config.excel.autoFiltros
        },
        pdf: {
          maxFilas: this.config.pdf.maxFilas,
          paginacion: this.config.pdf.paginacion,
          calidad: this.config.pdf.calidad
        },
        cache: this.getEstadisticasCache()
      }
    };
  }
}

export default ReporteService;
