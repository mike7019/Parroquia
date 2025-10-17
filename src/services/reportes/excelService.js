/**
 * Servicio para generación de reportes Excel usando ExcelJS
 * Funcionalidades avanzadas: streaming, estilos, filtros automáticos
 */

import ExcelJS from 'exceljs';
import { REPORTE_CONFIG } from '../../config/reportes.js';

class ExcelService {
  constructor() {
    this.config = REPORTE_CONFIG.excel;
  }

  /**
   * Genera reporte de familias en formato Excel
   * @param {Array} familias - Array de datos de familias
   * @param {Object} filtros - Filtros aplicados (para metadata)
   * @param {Object} opciones - Opciones adicionales
   * @returns {Promise<Buffer>} Buffer del archivo Excel
   */
  async generarReporteFamilias(familias, filtros = {}, opciones = {}) {
    console.log(`📊 Generando reporte Excel de ${familias.length} familias...`);

    const workbook = new ExcelJS.Workbook();
    
    // Metadatos del documento
    this.configurarMetadatos(workbook, 'Reporte de Familias', filtros);
    
    // Crear hoja principal
    const worksheet = workbook.addWorksheet('Familias', {
      pageSetup: { 
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        printTitlesRow: '1:1' // Repetir headers en cada página
      }
    });

    // Definir columnas y headers
    const columnas = this.definirColumnasFamilias();
    const headers = columnas.map(col => col.header);
    
    // Agregar headers con estilo
    worksheet.addRow(headers);
    this.aplicarEstiloHeader(worksheet.getRow(1));
    
    // Configurar anchos de columna
    worksheet.columns = columnas.map(col => ({
      width: col.width || 15
    }));

    // Agregar datos con formato
    familias.forEach((familia, index) => {
      const fila = this.mapearDatosFamilia(familia);
      const row = worksheet.addRow(fila);
      
      // Aplicar estilo alternado
      if (index % 2 === 0) {
        this.aplicarEstiloFilaAlternada(row);
      }
    });

    // Aplicar filtros automáticos
    if (this.config.autoFiltros && familias.length > 0) {
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(65 + headers.length - 1)}${familias.length + 1}`
      };
    }

    // Agregar hoja de estadísticas
    await this.agregarHojaEstadisticas(workbook, familias, filtros);

    console.log('✅ Reporte Excel generado exitosamente');
    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera reporte estadístico con gráficos
   */
  async generarReporteEstadistico(datos, tipo = 'familias') {
    console.log(`📈 Generando reporte estadístico de ${tipo}...`);
    
    const workbook = new ExcelJS.Workbook();
    this.configurarMetadatos(workbook, `Estadísticas ${tipo}`, {});

    // Hoja de resumen ejecutivo
    const resumen = workbook.addWorksheet('Resumen Ejecutivo');
    await this.crearResumenEjecutivo(resumen, datos, tipo);

    // Hoja de datos detallados
    const detalle = workbook.addWorksheet('Datos Detallados');
    await this.crearHojaDetalle(detalle, datos, tipo);

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Configura los metadatos del workbook
   */
  configurarMetadatos(workbook, titulo, filtros) {
    const metadata = REPORTE_CONFIG.metadatos;
    const fecha = new Date();
    
    workbook.creator = metadata.creator;
    workbook.title = titulo;
    workbook.subject = `Reporte generado el ${fecha.toLocaleDateString('es-ES')}`;
    workbook.description = this.generarDescripcionFiltros(filtros);
    workbook.company = metadata.company;
    workbook.created = fecha;
    workbook.modified = fecha;
    workbook.lastPrinted = fecha;
  }

  /**
   * Define las columnas para el reporte de familias
   */
  definirColumnasFamilias() {
    return [
      { header: 'ID Familia', key: 'id_familia', width: 12 },
      { header: 'Apellido Familiar', key: 'apellido_familiar', width: 20 },
      { header: 'Municipio', key: 'municipio', width: 18 },
      { header: 'Sector', key: 'sector', width: 15 },
      { header: 'Vereda', key: 'vereda', width: 15 },
      { header: 'Dirección', key: 'direccion_familia', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Tipo Vivienda', key: 'tipo_vivienda', width: 15 },
      { header: 'Total Personas', key: 'total_personas', width: 12 },
      { header: 'Total Padres', key: 'total_padres', width: 12 },
      { header: 'Total Madres', key: 'total_madres', width: 12 },
      { header: 'Estado Encuesta', key: 'estado_encuesta', width: 15 },
      
      // Información del primer padre
      { header: 'Padre - Nombre Completo', key: 'padre_nombre', width: 25 },
      { header: 'Padre - Documento', key: 'padre_documento', width: 15 },
      { header: 'Padre - Teléfono', key: 'padre_telefono', width: 15 },
      { header: 'Padre - Email', key: 'padre_email', width: 25 },
      
      // Información de la primera madre
      { header: 'Madre - Nombre Completo', key: 'madre_nombre', width: 25 },
      { header: 'Madre - Documento', key: 'madre_documento', width: 15 },
      { header: 'Madre - Teléfono', key: 'madre_telefono', width: 15 },
      { header: 'Madre - Email', key: 'madre_email', width: 25 },
      
      // Información adicional
      { header: 'Personas en Familia', key: 'lista_personas', width: 40 },
      { header: 'Fecha Registro', key: 'fecha_registro', width: 15 }
    ];
  }

  /**
   * Mapea los datos de una familia a las columnas definidas
   */
  mapearDatosFamilia(familia) {
    // Extraer información del primer padre y primera madre
    const primerPadre = familia.padres && familia.padres.length > 0 ? familia.padres[0] : null;
    const primeraMadre = familia.madres && familia.madres.length > 0 ? familia.madres[0] : null;
    
    // Crear lista de todas las personas desde familyMembers o todas_personas
    let listaPersonas = 'Sin información';
    if (familia.familyMembers && familia.familyMembers.length > 0) {
      listaPersonas = familia.familyMembers
        .map(p => p.nombres || p.nombre_completo || 'Sin nombre')
        .join(', ');
    } else if (familia.todas_personas && familia.todas_personas.length > 0) {
      listaPersonas = familia.todas_personas
        .map(p => p.nombre_completo || 'Sin nombre')
        .join(', ');
    }
    
    // Obtener ID de familia - puede venir como id_familia o id_encuesta
    const idFamilia = familia.id_familia || familia.id_encuesta || 'N/A';
    
    // Extraer información de la estructura anidada si existe
    const infoGeneral = familia.informacionGeneral || {};
    const vivienda = familia.vivienda || {};
    const metadata = familia.metadata || {};
    
    // Obtener datos con prioridad: estructura anidada > datos directos
    const apellidoFamiliar = infoGeneral.apellido_familiar || familia.apellido_familiar || 'Sin apellido';
    const municipio = infoGeneral.municipio?.nombre || familia.municipio || 'N/A';
    const sector = infoGeneral.sector?.nombre || familia.sector || 'N/A';
    const vereda = infoGeneral.vereda?.nombre || familia.vereda || 'N/A';
    const direccion = infoGeneral.direccion || familia.direccion_familia || 'Sin dirección';
    const telefono = infoGeneral.telefono || familia.telefono || 'Sin teléfono';
    const email = familia.email || 'Sin email';
    const tipoVivienda = vivienda.tipo_vivienda?.nombre || familia.tipo_vivienda || 'No especificado';
    
    // Calcular totales desde metadata o datos directos
    const totalPersonas = metadata.total_miembros || familia.total_personas || 
      (familia.familyMembers ? familia.familyMembers.length : 0);
    const totalPadres = familia.total_padres || 0;
    const totalMadres = familia.total_madres || 0;
    const estadoEncuesta = metadata.completed ? 'Completada' : (familia.estado_encuesta || 'Pendiente');
    
    return [
      idFamilia,
      apellidoFamiliar,
      municipio,
      sector,
      vereda,
      direccion,
      telefono,
      email,
      tipoVivienda,
      totalPersonas,
      totalPadres,
      totalMadres,
      estadoEncuesta,
      
      // Información del primer padre
      primerPadre ? primerPadre.nombre_completo : 'Sin padre registrado',
      primerPadre ? primerPadre.identificacion : 'N/A',
      primerPadre ? primerPadre.telefono : 'N/A',
      primerPadre ? primerPadre.correo_electronico : 'N/A',
      
      // Información de la primera madre
      primeraMadre ? primeraMadre.nombre_completo : 'Sin madre registrada',
      primeraMadre ? primeraMadre.identificacion : 'N/A',
      primeraMadre ? primeraMadre.telefono : 'N/A',
      primeraMadre ? primeraMadre.correo_electronico : 'N/A',
      
      // Información adicional
      listaPersonas,
      familia.createdAt ? new Date(familia.createdAt).toLocaleDateString('es-ES') : 'N/A'
    ];
  }

  /**
   * Cuenta personas vivas (excluye difuntos)
   */
  contarPersonasVivas(personas) {
    if (!personas || !Array.isArray(personas)) return 0;
    return personas.filter(persona => !persona.es_difunto).length;
  }

  /**
   * Aplica estilo al header
   */
  aplicarEstiloHeader(row) {
    const estilo = this.config.estilos.header;
    row.font = estilo.font;
    row.fill = estilo.fill;
    row.alignment = estilo.alignment;
    row.height = estilo.height;
    
    // Bordes para el header
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }

  /**
   * Aplica estilo de fila alternada
   */
  aplicarEstiloFilaAlternada(row) {
    const estilo = this.config.estilos.alternateRow;
    row.fill = estilo.fill;
  }

  /**
   * Agrega hoja de estadísticas al workbook
   */
  async agregarHojaEstadisticas(workbook, familias, filtros) {
    const stats = workbook.addWorksheet('Estadísticas');
    
    // Título de la hoja
    stats.mergeCells('A1:D2');
    const titleCell = stats.getCell('A1');
    titleCell.value = 'ESTADÍSTICAS GENERALES';
    titleCell.font = { size: 16, bold: true, color: { argb: '2F5597' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Estadísticas calculadas
    const estadisticas = this.calcularEstadisticas(familias);
    
    let currentRow = 4;
    Object.entries(estadisticas).forEach(([label, value]) => {
      stats.getCell(`A${currentRow}`).value = label;
      stats.getCell(`B${currentRow}`).value = value;
      stats.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
    });

    // Auto-ajustar columnas
    stats.columns = [
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];
  }

  /**
   * Calcula estadísticas de las familias
   */
  calcularEstadisticas(familias) {
    const totalFamilias = familias.length;
    const totalPersonas = familias.reduce((sum, f) => sum + (f.personas?.length || 0), 0);
    const totalPersonasVivas = familias.reduce((sum, f) => sum + this.contarPersonasVivas(f.personas), 0);
    
    // Estadísticas por municipio
    const municipios = {};
    familias.forEach(familia => {
      const municipio = familia.municipio?.nombre || familia.nombre_municipio || 'Sin municipio';
      municipios[municipio] = (municipios[municipio] || 0) + 1;
    });

    return {
      'Total de Familias:': totalFamilias,
      'Total de Personas:': totalPersonas,
      'Personas Vivas:': totalPersonasVivas,
      'Promedio Personas por Familia:': totalFamilias > 0 ? (totalPersonas / totalFamilias).toFixed(1) : '0',
      'Municipios Diferentes:': Object.keys(municipios).length,
      'Familias con Teléfono:': familias.filter(f => f.telefono && f.telefono !== 'Sin teléfono').length
    };
  }

  /**
   * Crea resumen ejecutivo
   */
  async crearResumenEjecutivo(worksheet, datos, tipo) {
    // Título principal
    worksheet.mergeCells('A1:F2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `RESUMEN EJECUTIVO - ${tipo.toUpperCase()}`;
    titleCell.font = { size: 18, bold: true, color: { argb: '2F5597' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fecha de generación
    worksheet.getCell('A4').value = 'Fecha de generación:';
    worksheet.getCell('B4').value = new Date().toLocaleDateString('es-ES');
    worksheet.getCell('A4').font = { bold: true };

    // Más estadísticas aquí según el tipo de reporte
  }

  /**
   * Crea hoja de detalle
   */
  async crearHojaDetalle(worksheet, datos, tipo) {
    // Implementar según el tipo de datos
    if (tipo === 'familias') {
      return this.generarReporteFamilias(datos);
    }
    // Agregar más tipos según necesidad
  }

  /**
   * Genera descripción de filtros aplicados
   */
  generarDescripcionFiltros(filtros) {
    const descripcion = [];
    
    if (filtros.municipio) {
      descripcion.push(`Municipio: ${filtros.municipio}`);
    }
    if (filtros.sector) {
      descripcion.push(`Sector: ${filtros.sector}`);
    }
    if (filtros.fecha_desde && filtros.fecha_hasta) {
      descripcion.push(`Período: ${filtros.fecha_desde} - ${filtros.fecha_hasta}`);
    }
    
    return descripcion.length > 0 
      ? `Filtros aplicados: ${descripcion.join(', ')}`
      : 'Reporte sin filtros específicos';
  }

  /**
   * Valida los datos antes de generar el reporte
   */
  validarDatos(datos) {
    if (!Array.isArray(datos)) {
      throw new Error('Los datos deben ser un array');
    }
    
    if (datos.length === 0) {
      throw new Error('No hay datos para generar el reporte');
    }
    
    if (datos.length > this.config.maxFilas) {
      throw new Error(`Demasiados registros. Máximo permitido: ${this.config.maxFilas}`);
    }
    
    return true;
  }
}

export default ExcelService;
