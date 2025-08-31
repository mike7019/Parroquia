/**
 * Template para reporte de familias - Excel
 * Configuraciones y estilos específicos para reportes de familias
 */

export const FAMILIA_EXCEL_TEMPLATE = {
  // Configuración de columnas
  columnas: [
    { header: 'ID Familia', key: 'id_familia', width: 12, tipo: 'numero' },
    { header: 'Apellido Familiar', key: 'apellido_familiar', width: 20, tipo: 'texto' },
    { header: 'Municipio', key: 'municipio', width: 18, tipo: 'texto' },
    { header: 'Sector', key: 'sector', width: 15, tipo: 'texto' },
    { header: 'Vereda', key: 'vereda', width: 15, tipo: 'texto' },
    { header: 'Dirección', key: 'direccion', width: 25, tipo: 'texto' },
    { header: 'Teléfono', key: 'telefono', width: 15, tipo: 'texto' },
    { header: 'Total Personas', key: 'total_personas', width: 12, tipo: 'numero' },
    { header: 'Personas Vivas', key: 'personas_vivas', width: 12, tipo: 'numero' },
    { header: 'Estado', key: 'estado', width: 12, tipo: 'texto' },
    { header: 'Fecha Registro', key: 'fecha_registro', width: 15, tipo: 'fecha' }
  ],

  // Estilos personalizados
  estilos: {
    titulo: {
      font: { size: 16, bold: true, color: { argb: '2F5597' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    },
    header: {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    },
    filaAlternada: {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9F9F9' }
      }
    },
    numero: {
      numFmt: '#,##0',
      alignment: { horizontal: 'right' }
    },
    fecha: {
      numFmt: 'dd/mm/yyyy',
      alignment: { horizontal: 'center' }
    }
  },

  // Configuración de página
  configuracionPagina: {
    paperSize: 9, // A4
    orientation: 'landscape',
    fitToPage: true,
    printTitlesRow: '1:1',
    margins: {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  },

  // Validaciones de datos
  validaciones: {
    id_familia: { tipo: 'numero', requerido: true },
    apellido_familiar: { tipo: 'texto', maxLength: 100 },
    telefono: { tipo: 'texto', pattern: /^[\d\s\-\+\(\)]*$/ },
    total_personas: { tipo: 'numero', min: 0 },
    estado: { tipo: 'lista', valores: ['Activo', 'Inactivo', 'Pendiente'] }
  },

  // Fórmulas automáticas
  formulas: {
    total_personas: '=COUNTA(H:H)-1', // Ejemplo de fórmula para contar personas
    promedio_personas: '=AVERAGE(H:H)'
  }
};

export default FAMILIA_EXCEL_TEMPLATE;
