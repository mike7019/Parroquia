/**
 * Servicio para generación de reportes PDF usando PDFKit
 * Diseño profesional para documentos oficiales de la parroquia
 */

import PDFDocument from 'pdfkit';
import { REPORTE_CONFIG } from '../../config/reportes.js';

class PDFService {
  constructor() {
    this.config = REPORTE_CONFIG.pdf;
  }

  /**
   * Genera reporte de difuntos en formato PDF ceremonial
   * @param {Array} difuntos - Array de datos de difuntos
   * @param {Object} filtros - Filtros aplicados
   * @param {Object} opciones - Opciones adicionales
   * @returns {Promise<Buffer>} Buffer del archivo PDF
   */
  async generarReporteDifuntos(difuntos, filtros = {}, opciones = {}) {
    console.log(`📄 Generando reporte PDF de ${difuntos.length} difuntos...`);

    return new Promise((resolve, reject) => {
      try {
        const doc = this.crearDocumento('Registro de Personas Fallecidas');
        const buffers = [];

        // Event listeners para capturar el buffer
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          console.log('✅ Reporte PDF generado exitosamente');
          resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);

        // Generar contenido del documento
        this.generarEncabezado(doc, 'REGISTRO DE PERSONAS FALLECIDAS', filtros);
        this.generarTablaDifuntos(doc, difuntos);
        this.generarPie(doc, difuntos.length);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera reporte ceremonial para aniversarios
   */
  async generarReporteCeremonial(difuntos, fechaAniversario, opciones = {}) {
    console.log(`⛪ Generando reporte ceremonial para ${fechaAniversario}...`);

    return new Promise((resolve, reject) => {
      try {
        const doc = this.crearDocumento('Reporte Ceremonial de Aniversarios');
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Diseño ceremonial especial
        this.generarEncabezadoCeremonial(doc, fechaAniversario);
        this.generarListaCeremonial(doc, difuntos);
        this.generarPieCeremonial(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Crea un nuevo documento PDF con configuración estándar
   */
  crearDocumento(titulo) {
    const metadata = REPORTE_CONFIG.metadatos;
    
    return new PDFDocument({
      size: 'A4',
      margin: this.config.margenes.top,
      info: {
        Title: titulo,
        Author: metadata.creator,
        Subject: `Reporte generado el ${new Date().toLocaleDateString('es-ES')}`,
        Creator: metadata.company,
        Producer: `${metadata.company} v${metadata.version}`,
        CreationDate: new Date(),
        ModDate: new Date()
      }
    });
  }

  /**
   * Genera encabezado estándar del documento
   */
  generarEncabezado(doc, titulo, filtros = {}) {
    const y = this.config.margenes.top;
    
    // Título principal
    doc.fontSize(this.config.fuentes.titulo.size)
       .fillColor(this.config.fuentes.titulo.color)
       .text(titulo, this.config.margenes.left, y, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right)
       });

    // Línea decorativa
    const lineY = y + 40;
    doc.lineWidth(2)
       .strokeColor(this.config.colores.primary)
       .moveTo(this.config.margenes.left, lineY)
       .lineTo(doc.page.width - this.config.margenes.right, lineY)
       .stroke();

    // Información de generación
    const infoY = lineY + 20;
    doc.fontSize(this.config.fuentes.subtitulo.size)
       .fillColor(this.config.fuentes.subtitulo.color)
       .text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, 
             this.config.margenes.left, infoY, { align: 'right' });

    // Información de filtros si existen
    if (Object.keys(filtros).length > 0) {
      const filtrosTexto = this.generarTextoFiltros(filtros);
      doc.text(`Filtros aplicados: ${filtrosTexto}`, 
               this.config.margenes.left, infoY + 15, { align: 'right' });
    }

    return infoY + 40; // Retorna la posición Y donde continuar
  }

  /**
   * Genera tabla de difuntos
   */
  generarTablaDifuntos(doc, difuntos) {
    let currentY = 150; // Posición inicial después del encabezado
    
    // Headers de la tabla
    const headers = ['Nombre Completo', 'Fecha Fallecimiento', 'Parentesco', 'Familia'];
    const columnWidths = [180, 100, 100, 120];
    const tableWidth = columnWidths.reduce((a, b) => a + b);
    const startX = (doc.page.width - tableWidth) / 2;

    // Dibujar header de la tabla
    doc.fontSize(this.config.fuentes.header.size)
       .fillColor(this.config.fuentes.header.color);
    
    doc.rect(startX, currentY, tableWidth, 25)
       .fill(this.config.colores.primary);

    let xPosition = startX;
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 5, currentY + 7, {
        width: columnWidths[index] - 10,
        align: 'left'
      });
      xPosition += columnWidths[index];
    });

    currentY += 25;
    doc.fillColor(this.config.fuentes.contenido.color);

    // Datos de la tabla con paginación
    let filasPorPagina = 0;
    const maxFilasPorPagina = this.config.paginacion;

    difuntos.forEach((difunto, index) => {
      // Nueva página si es necesario
      if (filasPorPagina >= maxFilasPorPagina) {
        doc.addPage();
        currentY = this.config.margenes.top;
        filasPorPagina = 0;
        
        // Repetir header en nueva página
        this.dibujarHeaderTabla(doc, headers, columnWidths, startX, currentY);
        currentY += 25;
      }

      const fillColor = index % 2 === 0 ? this.config.colores.alternateRow : '#FFFFFF';
      
      // Fondo de la fila
      doc.rect(startX, currentY, tableWidth, 20)
         .fill(fillColor);

      // Datos de la fila
      const rowData = [
        difunto.nombre_completo || 'N/A',
        difunto.fecha_aniversario 
          ? new Date(difunto.fecha_aniversario).toLocaleDateString('es-ES') 
          : 'N/A',
        difunto.parentesco_inferido || 'Familiar',
        difunto.apellido_familiar || 'N/A'
      ];

      xPosition = startX;
      rowData.forEach((data, colIndex) => {
        doc.fontSize(this.config.fuentes.contenido.size)
           .fillColor(this.config.fuentes.contenido.color)
           .text(data, xPosition + 5, currentY + 5, {
             width: columnWidths[colIndex] - 10,
             height: 20,
             ellipsis: true
           });
        xPosition += columnWidths[colIndex];
      });

      // Bordes de la celda
      doc.strokeColor(this.config.colores.border)
         .lineWidth(0.5)
         .rect(startX, currentY, tableWidth, 20)
         .stroke();

      currentY += 20;
      filasPorPagina++;
    });
  }

  /**
   * Dibuja header de tabla (reutilizable para nuevas páginas)
   */
  dibujarHeaderTabla(doc, headers, columnWidths, startX, y) {
    const tableWidth = columnWidths.reduce((a, b) => a + b);
    
    doc.fontSize(this.config.fuentes.header.size)
       .fillColor(this.config.fuentes.header.color);
    
    doc.rect(startX, y, tableWidth, 25)
       .fill(this.config.colores.primary);

    let xPosition = startX;
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 5, y + 7, {
        width: columnWidths[index] - 10,
        align: 'left'
      });
      xPosition += columnWidths[index];
    });
  }

  /**
   * Genera encabezado ceremonial especial
   */
  generarEncabezadoCeremonial(doc, fechaAniversario) {
    const y = this.config.margenes.top;
    
    // Título ceremonial
    doc.fontSize(22)
       .fillColor('#8B4513')
       .text('✝ MEMORIA ETERNA ✝', this.config.margenes.left, y, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right)
       });

    // Subtítulo con fecha
    doc.fontSize(16)
       .fillColor('#2F5597')
       .text(`Aniversario del ${fechaAniversario}`, this.config.margenes.left, y + 40, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right)
       });

    // Versículo o mensaje ceremonial
    doc.fontSize(12)
       .fillColor('#666666')
       .text('"Porque para mí el vivir es Cristo, y el morir es ganancia" - Filipenses 1:21', 
             this.config.margenes.left, y + 70, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right),
         style: 'italic'
       });

    return y + 100;
  }

  /**
   * Genera lista ceremonial de difuntos
   */
  generarListaCeremonial(doc, difuntos) {
    let currentY = 200;
    
    doc.fontSize(14)
       .fillColor('#2F5597')
       .text('En memoria de:', this.config.margenes.left, currentY);
    
    currentY += 30;
    
    difuntos.forEach((difunto, index) => {
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = this.config.margenes.top;
      }
      
      const nombre = difunto.nombre_completo || 'Nombre no registrado';
      const familia = difunto.apellido_familiar ? ` (Familia ${difunto.apellido_familiar})` : '';
      
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`• ${nombre}${familia}`, this.config.margenes.left + 20, currentY);
      
      currentY += 20;
    });
  }

  /**
   * Genera pie del documento
   */
  generarPie(doc, totalRegistros) {
    const pageHeight = doc.page.height;
    const pieY = pageHeight - this.config.margenes.bottom - 40;
    
    // Línea separadora
    doc.lineWidth(1)
       .strokeColor(this.config.colores.border)
       .moveTo(this.config.margenes.left, pieY)
       .lineTo(doc.page.width - this.config.margenes.right, pieY)
       .stroke();

    // Información del pie
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Total de registros: ${totalRegistros}`, this.config.margenes.left, pieY + 10)
       .text(`Página ${doc.bufferedPageRange().count}`, doc.page.width - 100, pieY + 10)
       .text(`${REPORTE_CONFIG.metadatos.company} - ${new Date().getFullYear()}`, 
             this.config.margenes.left, pieY + 25, { align: 'center', width: doc.page.width - (this.config.margenes.left + this.config.margenes.right) });
  }

  /**
   * Genera pie ceremonial
   */
  generarPieCeremonial(doc) {
    const pageHeight = doc.page.height;
    const pieY = pageHeight - this.config.margenes.bottom - 60;
    
    doc.fontSize(12)
       .fillColor('#8B4513')
       .text('Que descansen en paz', this.config.margenes.left, pieY, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right)
       });
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`${REPORTE_CONFIG.metadatos.company}`, this.config.margenes.left, pieY + 30, { 
         align: 'center',
         width: doc.page.width - (this.config.margenes.left + this.config.margenes.right)
       });
  }

  /**
   * Genera texto descriptivo de filtros
   */
  generarTextoFiltros(filtros) {
    const descripcion = [];
    
    if (filtros.municipio) {
      descripcion.push(`Municipio: ${filtros.municipio}`);
    }
    if (filtros.fecha_desde && filtros.fecha_hasta) {
      descripcion.push(`Período: ${filtros.fecha_desde} - ${filtros.fecha_hasta}`);
    }
    if (filtros.mes_aniversario) {
      descripcion.push(`Mes: ${filtros.mes_aniversario}`);
    }
    
    return descripcion.length > 0 ? descripcion.join(', ') : 'Ninguno';
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
      throw new Error(`Demasiados registros para PDF. Máximo permitido: ${this.config.maxFilas}`);
    }
    
    return true;
  }

  /**
   * Genera reporte de estadísticas general
   */
  async generarReporteEstadisticas(estadisticas, titulo = 'Estadísticas Generales') {
    return new Promise((resolve, reject) => {
      try {
        const doc = this.crearDocumento(titulo);
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Generar contenido estadístico
        this.generarEncabezado(doc, titulo.toUpperCase());
        this.generarContenidoEstadisticas(doc, estadisticas);
        this.generarPie(doc, Object.keys(estadisticas).length);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera contenido de estadísticas
   */
  generarContenidoEstadisticas(doc, estadisticas) {
    let currentY = 200;
    
    Object.entries(estadisticas).forEach(([label, value]) => {
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = this.config.margenes.top;
      }
      
      doc.fontSize(12)
         .fillColor('#000000')
         .text(`${label}:`, this.config.margenes.left, currentY, { continued: true })
         .fillColor('#2F5597')
         .text(` ${value}`, { align: 'left' });
      
      currentY += 25;
    });
  }
}

export default PDFService;
