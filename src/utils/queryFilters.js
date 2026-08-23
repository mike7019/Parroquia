/**
 * Helpers para parsear filtros de ID recibidos por query string.
 *
 * Problema que resuelven: convertir un valor no numérico con parseInt() da NaN,
 * y si ese NaN se descarta silenciosamente del objeto de filtros, la consulta
 * termina ejecutándose SIN ese filtro y devuelve todos los registros en vez de
 * fallar o filtrar por nombre. Esto pasó en producción con id_municipio cuando
 * se enviaba el nombre del municipio (ej. "Girardota") en vez de su ID numérico.
 */

/**
 * Acepta un ID numérico o un texto (ej. nombre de municipio). Si el valor
 * parsea como entero se devuelve como número; si no, se devuelve como texto
 * recortado para que el llamador pueda filtrar por nombre en su lugar.
 * @param {string|number|undefined} value
 * @returns {number|string|undefined}
 */
export function parseIdOrNombre(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? String(value).trim() : parsed;
}

/**
 * Error tipado para un filtro de ID inválido, pensado para ser capturado por
 * el controlador y convertido en una respuesta 400 con su propio formato.
 */
export class FiltroInvalidoError extends Error {
  constructor(campo, valorRecibido) {
    super(`El filtro '${campo}' debe ser un número entero válido, se recibió: "${valorRecibido}"`);
    this.name = 'FiltroInvalidoError';
    this.status = 400;
    this.code = 'INVALID_FILTER_VALUE';
    this.field = campo;
  }
}

/**
 * Exige que el valor sea un entero válido (o esté ausente). Lanza
 * FiltroInvalidoError en vez de devolver NaN, para evitar que un filtro
 * inválido se descarte en silencio y la consulta devuelva todo sin filtrar.
 * @param {string|number|undefined} value
 * @param {string} campo - nombre del filtro, para el mensaje de error
 * @returns {number|undefined}
 */
export function parseIdEstricto(value, campo) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new FiltroInvalidoError(campo, value);
  }
  return parsed;
}
