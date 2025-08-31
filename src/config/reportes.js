/**
 * Configuración para el sistema de reportes
 * Definiciones de límites, formatos y configuraciones de performance
 */

export const REPORTE_CONFIG = {
  // Configuración para reportes Excel
  excel: {
    maxFilas: 50000,              // Límite de seguridad para evitar archivos demasiado grandes
    streamingThreshold: 10000,     // Usar streaming si > 10K filas para mejor perfor
    // mance
    autoFiltros: true,            // Filtros automáticos siempre activos
    compression: true,            // Comprimir archivos grandes
    estilos: {
      header: {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4F81BD' }
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        height: 25
      },
      alternateRow: {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F9F9F9' }
        }
      }
    }
  },

  // Configuración para reportes PDF
  pdf: {
    maxFilas: 1000,               // Límite para PDFs (más restrictivo por performance)
    paginacion: 50,               // Filas por página
    calidad: 'alta',              // Calidad del output
    margenes: {                   // Márgenes estándar en puntos
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    },
    fuentes: {
      titulo: { size: 20, color: '#2F5597' },
      subtitulo: { size: 14, color: '#666666' },
      header: { size: 10, color: '#FFFFFF' },
      contenido: { size: 9, color: '#000000' }
    },
    colores: {
      primary: '#4F81BD',
      secondary: '#2F5597',
      alternateRow: '#F9F9F9',
      border: '#DDDDDD'
    }
  },

  // Configuración de cache
  cache: {
    enabled: true,                // Cache de reportes frecuentes
    ttl: 300,                    // 5 minutos de vida útil
    maxSize: 100                 // Máximo 100 reportes en cache
  },

  // Metadatos por defecto
  metadatos: {
    creator: 'Sistema Parroquial',
    company: 'Parroquia Management System',
    version: '1.0.0'
  },

  // Tipos de reportes disponibles
  tipos: {
    FAMILIAS_EXCEL: 'familias_excel',
    DIFUNTOS_PDF: 'difuntos_pdf',
    ESTADISTICAS_EXCEL: 'estadisticas_excel',
    CEREMONIAL_PDF: 'ceremonial_pdf',
    CONSOLIDADO_EXCEL: 'consolidado_excel'
  },

  // Configuración de formatos de fecha
  formatos: {
    fecha: 'DD/MM/YYYY',
    fechaHora: 'DD/MM/YYYY HH:mm:ss',
    nombreArchivo: 'YYYY-MM-DD_HH-mm-ss'
  }
};

export default REPORTE_CONFIG;
