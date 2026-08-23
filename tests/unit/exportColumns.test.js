import { describe, test, expect } from '@jest/globals';
import { parseCampos, parseCamposPorHoja, seleccionarColumnas, letraColumnaExcel } from '../../src/utils/exportColumns.js';

describe('parseCampos', () => {
  test('devuelve null si el query no tiene el param solicitado', () => {
    expect(parseCampos({}, 'campos')).toBeNull();
    expect(parseCampos({ otraCosa: 'x' }, 'campos')).toBeNull();
  });

  test('parsea una lista separada por comas al param por defecto ("campos")', () => {
    expect(parseCampos({ campos: 'apellido, direccion ,telefono' })).toEqual(['apellido', 'direccion', 'telefono']);
  });

  test('lee un param distinto al genérico "campos" cuando se indica paramName', () => {
    const query = { campos_difuntos: 'nombre,fecha', campos: 'apellido' };
    expect(parseCampos(query, 'campos_difuntos')).toEqual(['nombre', 'fecha']);
  });

  test('ignora espacios y entradas vacías', () => {
    expect(parseCampos({ campos: ' a ,, b ,' })).toEqual(['a', 'b']);
  });

  test('devuelve null si tras filtrar no queda ningún campo', () => {
    expect(parseCampos({ campos: ' , , ' })).toBeNull();
  });
});

describe('parseCamposPorHoja', () => {
  const HOJAS = {
    informacionGeneral: 'campos_informacion_general',
    miembrosFamilias: 'campos_miembros_familias',
    difuntos: 'campos_difuntos'
  };

  test('cada hoja usa su propio param cuando está presente', () => {
    const query = {
      campos_informacion_general: 'apellido,municipio',
      campos_miembros_familias: 'nombre,sexo',
      campos_difuntos: 'nombre,fecha'
    };
    expect(parseCamposPorHoja(query, HOJAS)).toEqual({
      informacionGeneral: ['apellido', 'municipio'],
      miembrosFamilias: ['nombre', 'sexo'],
      difuntos: ['nombre', 'fecha']
    });
  });

  test('una hoja sin su param específico cae al genérico "campos"', () => {
    const query = {
      campos_informacion_general: 'apellido,municipio',
      campos: 'nombre,sexo' // aplica a miembrosFamilias y difuntos
    };
    expect(parseCamposPorHoja(query, HOJAS)).toEqual({
      informacionGeneral: ['apellido', 'municipio'],
      miembrosFamilias: ['nombre', 'sexo'],
      difuntos: ['nombre', 'sexo']
    });
  });

  test('sin ningún param, todas las hojas quedan en null (todas las columnas)', () => {
    expect(parseCamposPorHoja({}, HOJAS)).toEqual({
      informacionGeneral: null,
      miembrosFamilias: null,
      difuntos: null
    });
  });

  test('el param específico de una hoja tiene prioridad sobre el genérico para esa hoja', () => {
    const query = {
      campos: 'apellido',
      campos_difuntos: 'nombre,fecha'
    };
    const result = parseCamposPorHoja(query, HOJAS);
    expect(result.difuntos).toEqual(['nombre', 'fecha']);
    expect(result.informacionGeneral).toEqual(['apellido']);
    expect(result.miembrosFamilias).toEqual(['apellido']);
  });
});

describe('seleccionarColumnas', () => {
  const columnasDisponibles = [
    { header: 'Apellido', key: 'apellido', width: 20 },
    { header: 'Municipio', key: 'municipio', width: 20 },
    { header: 'Sector', key: 'sector', width: 20 }
  ];

  test('sin selección, devuelve todas las columnas en el orden original', () => {
    expect(seleccionarColumnas(columnasDisponibles, null)).toEqual(columnasDisponibles);
    expect(seleccionarColumnas(columnasDisponibles, [])).toEqual(columnasDisponibles);
  });

  test('filtra solo las columnas seleccionadas, preservando el orden de columnasDisponibles', () => {
    const result = seleccionarColumnas(columnasDisponibles, ['sector', 'apellido']);
    expect(result.map(c => c.key)).toEqual(['apellido', 'sector']);
  });

  test('si ninguna key seleccionada coincide, cae de vuelta al set completo (no deja la hoja vacía)', () => {
    const result = seleccionarColumnas(columnasDisponibles, ['columna_inexistente']);
    expect(result).toEqual(columnasDisponibles);
  });
});

describe('letraColumnaExcel', () => {
  test('convierte números de columna a letras', () => {
    expect(letraColumnaExcel(1)).toBe('A');
    expect(letraColumnaExcel(26)).toBe('Z');
    expect(letraColumnaExcel(27)).toBe('AA');
    expect(letraColumnaExcel(52)).toBe('AZ');
  });
});
