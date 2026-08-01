/**
 * Utilidades para permitir que los endpoints de consolidado exporten
 * únicamente las columnas seleccionadas por el usuario (query param `campos`),
 * en lugar de siempre incluir el set completo de columnas.
 */

/**
 * Parsea el query param `campos` (lista separada por comas) a un array de keys.
 * Devuelve null si no se envió (para poder distinguir "sin selección" = todas las columnas).
 * @param {Object} query - req.query
 * @returns {string[]|null}
 */
export function parseCampos(query) {
  if (!query || !query.campos) return null;
  const campos = String(query.campos)
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
  return campos.length > 0 ? campos : null;
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
