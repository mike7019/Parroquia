/**
 * Utilidades para permitir que los endpoints de consolidado exporten
 * únicamente las columnas seleccionadas por el usuario (query param `campos`),
 * en lugar de siempre incluir el set completo de columnas.
 */

/**
 * Parsea un query param de lista separada por comas (por defecto `campos`) a
 * un array de keys. Devuelve null si no se envió (para poder distinguir "sin
 * selección" = todas las columnas).
 * @param {Object} query - req.query
 * @param {string} [paramName='campos'] - nombre del query param a leer
 * @returns {string[]|null}
 */
export function parseCampos(query, paramName = 'campos') {
  if (!query || !query[paramName]) return null;
  const campos = String(query[paramName])
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
  return campos.length > 0 ? campos : null;
}

/**
 * Parsea la selección de columnas por hoja para reportes Excel con varias
 * pestañas (ej. familias: Información General / Miembros de Familias /
 * Difuntos). Cada entrada de `hojas` mapea el nombre lógico de la hoja al
 * query param que la controla; si ese param específico no vino, cae de
 * vuelta al param genérico `campos` (compatibilidad con clientes que aún
 * mandan una sola lista para todas las hojas).
 * @param {Object} query - req.query
 * @param {Object<string,string>} hojas - ej. { informacionGeneral: 'campos_informacion_general', miembros: 'campos_miembros_familias', difuntos: 'campos_difuntos' }
 * @returns {Object<string,string[]|null>} mismas keys que `hojas`, cada una con su array de campos (o null = todas las columnas)
 */
export function parseCamposPorHoja(query, hojas) {
  const campoGenerico = parseCampos(query, 'campos');
  const resultado = {};
  for (const [nombreHoja, paramName] of Object.entries(hojas)) {
    const especifico = parseCampos(query, paramName);
    resultado[nombreHoja] = especifico ?? campoGenerico;
  }
  return resultado;
}

/**
 * Filtra un array de definiciones de columnas ExcelJS ({ header, key, width })
 * dejando solo las que el usuario seleccionó, preservando el orden original.
 * Si no hay selección, o la selección no coincide con ninguna key válida,
 * devuelve el set completo (comportamiento por defecto, sin romper clientes existentes).
 * @param {{header: string, key: string, width: number}[]} columnasDisponibles
 * @param {string[]|null} camposSeleccionados
 */
export function seleccionarColumnas(columnasDisponibles, camposSeleccionados) {
  if (!Array.isArray(camposSeleccionados) || camposSeleccionados.length === 0) {
    return columnasDisponibles;
  }
  const seleccionadas = columnasDisponibles.filter(c => camposSeleccionados.includes(c.key));
  return seleccionadas.length > 0 ? seleccionadas : columnasDisponibles;
}

/**
 * Convierte un número de columna (1-based) a su letra de columna Excel (A, B, ..., Z, AA, ...).
 * @param {number} n
 * @returns {string}
 */
export function letraColumnaExcel(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}
