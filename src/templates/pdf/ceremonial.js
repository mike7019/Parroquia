/**
 * Template para reporte ceremonial de difuntos - PDF
 * Configuraciones específicas para documentos ceremoniales
 */

export const DIFUNTO_PDF_TEMPLATE = {
  // Configuración ceremonial
  ceremonial: {
    titulo: '✝ MEMORIA ETERNA ✝',
    subtitulo: 'Registro de Nuestros Hermanos Fallecidos',
    versiculo: '"Porque para mí el vivir es Cristo, y el morir es ganancia" - Filipenses 1:21',
    despedida: 'Que descansen en paz en los brazos del Señor',
    
    colores: {
      titulo: '#8B4513', // Marrón ceremonial
      subtitulo: '#2F5597', // Azul solemne
      texto: '#000000',
      detalle: '#666666'
    },
    
    fuentes: {
      titulo: { size: 22, font: 'Times-Roman' },
      subtitulo: { size: 16, font: 'Times-Roman' },
      versiculo: { size: 12, font: 'Times-Italic' },
      contenido: { size: 11, font: 'Times-Roman' },
      pie: { size: 10, font: 'Times-Roman' }
    }
  },

  // Configuración estándar
  estandar: {
    titulo: 'REGISTRO DE PERSONAS FALLECIDAS',
    colores: {
      primary: '#4F81BD',
      secondary: '#2F5597',
      texto: '#000000',
      subtitulo: '#666666'
    },
    
    fuentes: {
      titulo: { size: 20, font: 'Helvetica-Bold' },
      subtitulo: { size: 14, font: 'Helvetica' },
      header: { size: 10, font: 'Helvetica-Bold' },
      contenido: { size: 9, font: 'Helvetica' }
    }
  },

  // Estructura de tabla
  tabla: {
    headers: ['Nombre Completo', 'Fecha Fallecimiento', 'Parentesco', 'Familia'],
    anchos: [180, 100, 100, 120],
    alturaFila: 20,
    alturaHeader: 25,
    
    estilos: {
      header: {
        fondo: '#4F81BD',
        texto: '#FFFFFF',
        alineacion: 'left',
        padding: 5
      },
      filaAlternada: {
        fondo: '#F9F9F9'
      },
      borde: {
        color: '#DDDDDD',
        grosor: 0.5
      }
    }
  },

  // Configuración de página
  pagina: {
    tamaño: 'A4',
    orientacion: 'portrait',
    margenes: {
      superior: 50,
      inferior: 50,
      izquierdo: 50,
      derecho: 50
    },
    
    // Límites de contenido
    filasPorPagina: 30,
    espacioHeader: 120,
    espacioPie: 80
  },

  // Elementos ceremoniales adicionales
  elementosCeremoniales: {
    cruz: {
      simbolo: '✝',
      tamaño: 24,
      color: '#8B4513',
      posicion: 'centro'
    },
    
    lineasDecorativas: {
      grosor: 2,
      color: '#8B4513',
      estilo: 'solid'
    },
    
    mensajes: [
      'En memoria de quienes partieron hacia la Casa del Padre',
      'Sus nombres permanecen escritos en nuestros corazones',
      'Descansen en la paz del Señor'
    ]
  },

  // Formateo de datos
  formateo: {
    fecha: {
      formato: 'dd/MM/yyyy',
      textoVacio: 'Fecha no registrada'
    },
    
    nombre: {
      mayusculas: false,
      maxLength: 45,
      textoVacio: 'Nombre no registrado'
    },
    
    parentesco: {
      valores: {
        'padre': 'Padre de familia',
        'madre': 'Madre de familia',
        'hijo': 'Hijo(a)',
        'abuelo': 'Abuelo(a)',
        'hermano': 'Hermano(a)',
        'otro': 'Familiar'
      },
      default: 'Familiar'
    }
  },

  // Pie de página
  piePagina: {
    incluirNumero: true,
    incluirFecha: true,
    incluirTotal: true,
    texto: 'Sistema Parroquial de Gestión',
    
    ceremonial: {
      texto: 'Parroquia - Registro de Memoria Eterna',
      bendicion: 'Que el Señor los tenga en su gloria'
    }
  }
};

export default DIFUNTO_PDF_TEMPLATE;
