import { describe, test, expect, jest, afterEach } from '@jest/globals';
import ExcelJS from 'exceljs';
import familiasConsolidadoService from '../../src/services/consolidados/familiasConsolidadoService.js';

/**
 * Pruebas del reporte Excel de familias con selección de columnas
 * independiente por hoja (Información General / Miembros de Familias /
 * Difuntos). No tocan base de datos: las hojas se construyen directamente
 * con datos sintéticos, y generarReporteExcelFamilias se prueba mockeando
 * consultarFamilias (el único método de la clase que sí hace una consulta real).
 */

const familiaEjemplo = {
  id_familia: 1,
  codigo_familia: 'FAM-001',
  apellido_familiar: 'Gómez Pérez',
  direccion_familia: 'Calle 1 # 2-3',
  telefono: '3001234567',
  parroquia_nombre: 'San José',
  municipio_nombre: 'Yolombó',
  departamento_nombre: 'Antioquia',
  sector_nombre: 'Centro',
  vereda_nombre: 'El Rubí',
  corregimiento_nombre: null,
  centro_poblado_nombre: null,
  tipo_vivienda: 'Casa',
  sistema_acueducto: 'Acueducto Municipal',
  dispocision_basura: 'Recolección Pública',
  tipos_agua_residuales: 'Alcantarillado Público',
  miembros_familia: [
    {
      nombre_completo: 'Juan Gómez',
      tipo_identificacio: 'CC',
      numero_identificacion: '12345678',
      parentesco: 'Padre',
      sexo: 'Masculino',
      edad: 40,
      fecha_nacimiento: '1985-01-01',
      telefono_personal: '3009999999',
      email_personal: 'juan@example.com',
      situacion_civil: 'Casado(a)',
      estudios: 'Educación Secundaria',
      profesion: 'Agricultor',
      comunidad_cultural: 'Mestizo',
      destrezas: [{ nombre: 'Carpintería' }],
      liderazgos: [{ nombre: 'Comunitario' }],
      tallas: { camisa_blusa: 'M', pantalon: '32', calzado: '40' },
      todas_las_celebraciones: [{ motivo: 'Cumpleaños', dia: '1', mes: '1' }],
      enfermedades: [],
      necesidades_enfermo: ''
    }
  ],
  difuntos_familia: [
    {
      nombre_difunto: 'María Pérez',
      parentesco: 'Madre',
      sexo: 'Femenino',
      fecha_fallecimiento: '2020-05-10',
      causa_fallecimiento: 'Causas naturales'
    }
  ]
};

function headerKeysOf(worksheet) {
  return worksheet.columns.map(c => c.key);
}

describe('crearHojaInfoGeneral (columnas independientes)', () => {
  test('con selección propia, solo incluye esas columnas', async () => {
    const wb = new ExcelJS.Workbook();
    await familiasConsolidadoService.crearHojaInfoGeneral(wb, [familiaEjemplo], ['apellido', 'municipio']);
    const hoja = wb.getWorksheet('Información General');
    expect(headerKeysOf(hoja)).toEqual(['apellido', 'municipio']);
    expect(hoja.getRow(2).getCell(1).value).toBe('Gómez Pérez');
  });

  test('sin selección, incluye todas las columnas disponibles', async () => {
    const wb = new ExcelJS.Workbook();
    await familiasConsolidadoService.crearHojaInfoGeneral(wb, [familiaEjemplo], null);
    const hoja = wb.getWorksheet('Información General');
    expect(headerKeysOf(hoja).length).toBeGreaterThan(2);
    expect(headerKeysOf(hoja)).toContain('apellido');
    expect(headerKeysOf(hoja)).toContain('num_miembros');
  });
});

describe('crearHojaMiembrosFamilias (columnas independientes)', () => {
  test('con selección propia, solo incluye esas columnas, sin afectar otras hojas', async () => {
    const wb = new ExcelJS.Workbook();
    await familiasConsolidadoService.crearHojaMiembrosFamilias(wb, [familiaEjemplo], ['nombre', 'parentesco', 'sexo']);
    const hoja = wb.getWorksheet('Miembros de Familias');
    expect(headerKeysOf(hoja)).toEqual(['nombre', 'parentesco', 'sexo']);
    expect(hoja.getRow(2).getCell(1).value).toBe('Juan Gómez');
  });

  test('una key que no existe en esta hoja hace que caiga al set completo (no queda vacía)', async () => {
    const wb = new ExcelJS.Workbook();
    // 'apellido' es una key de Información General, no de Miembros de Familias
    await familiasConsolidadoService.crearHojaMiembrosFamilias(wb, [familiaEjemplo], ['apellido']);
    const hoja = wb.getWorksheet('Miembros de Familias');
    expect(headerKeysOf(hoja).length).toBeGreaterThan(1);
  });
});

describe('crearHojaDifuntosFamilias (columnas independientes)', () => {
  test('con selección propia, solo incluye esas columnas', async () => {
    const wb = new ExcelJS.Workbook();
    await familiasConsolidadoService.crearHojaDifuntosFamilias(wb, [familiaEjemplo], ['nombre', 'fecha']);
    const hoja = wb.getWorksheet('Difuntos');
    expect(headerKeysOf(hoja)).toEqual(['nombre', 'fecha']);
    expect(hoja.getRow(2).getCell(1).value).toBe('María Pérez');
  });
});

describe('generarReporteExcelFamilias (orquestación completa, consultarFamilias mockeado)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('cada hoja recibe su propia selección cuando se pasa un objeto por hoja', async () => {
    jest.spyOn(familiasConsolidadoService, 'consultarFamilias').mockResolvedValue({ datos: [familiaEjemplo] });

    const workbook = await familiasConsolidadoService.generarReporteExcelFamilias({}, {
      informacionGeneral: ['apellido', 'municipio'],
      miembrosFamilias: ['nombre', 'sexo'],
      difuntos: ['nombre', 'fecha']
    });

    expect(headerKeysOf(workbook.getWorksheet('Información General'))).toEqual(['apellido', 'municipio']);
    expect(headerKeysOf(workbook.getWorksheet('Miembros de Familias'))).toEqual(['nombre', 'sexo']);
    expect(headerKeysOf(workbook.getWorksheet('Difuntos'))).toEqual(['nombre', 'fecha']);
    // La hoja de Estadísticas nunca se filtra
    expect(workbook.getWorksheet('Estadísticas')).toBeDefined();
  });

  test('compatibilidad hacia atrás: un array plano se aplica igual a las 3 hojas', async () => {
    jest.spyOn(familiasConsolidadoService, 'consultarFamilias').mockResolvedValue({ datos: [familiaEjemplo] });

    const workbook = await familiasConsolidadoService.generarReporteExcelFamilias({}, ['apellido', 'municipio']);

    // Información General sí tiene esas keys -> se filtra
    expect(headerKeysOf(workbook.getWorksheet('Información General'))).toEqual(['apellido', 'municipio']);
    // Miembros de Familias y Difuntos no tienen esas keys -> caen al set completo
    expect(headerKeysOf(workbook.getWorksheet('Miembros de Familias')).length).toBeGreaterThan(2);
    expect(headerKeysOf(workbook.getWorksheet('Difuntos')).length).toBeGreaterThan(2);
  });

  test('sin selección (null), las 3 hojas incluyen todas sus columnas', async () => {
    jest.spyOn(familiasConsolidadoService, 'consultarFamilias').mockResolvedValue({ datos: [familiaEjemplo] });

    const workbook = await familiasConsolidadoService.generarReporteExcelFamilias({}, null);

    expect(headerKeysOf(workbook.getWorksheet('Información General')).length).toBeGreaterThan(10);
    expect(headerKeysOf(workbook.getWorksheet('Miembros de Familias')).length).toBeGreaterThan(10);
    expect(headerKeysOf(workbook.getWorksheet('Difuntos')).length).toBeGreaterThan(2);
  });

  test('solo una hoja especificada: las otras 2 quedan sin filtrar (todas sus columnas)', async () => {
    jest.spyOn(familiasConsolidadoService, 'consultarFamilias').mockResolvedValue({ datos: [familiaEjemplo] });

    const workbook = await familiasConsolidadoService.generarReporteExcelFamilias({}, {
      informacionGeneral: ['apellido']
    });

    expect(headerKeysOf(workbook.getWorksheet('Información General'))).toEqual(['apellido']);
    expect(headerKeysOf(workbook.getWorksheet('Miembros de Familias')).length).toBeGreaterThan(2);
    expect(headerKeysOf(workbook.getWorksheet('Difuntos')).length).toBeGreaterThan(2);
  });

  test('propaga los filtros de consulta a consultarFamilias sin modificarlos', async () => {
    const spy = jest.spyOn(familiasConsolidadoService, 'consultarFamilias').mockResolvedValue({ datos: [] });

    await familiasConsolidadoService.generarReporteExcelFamilias({ id_municipio: 1110 }, null);

    expect(spy).toHaveBeenCalledWith({ id_municipio: 1110 });
  });
});
