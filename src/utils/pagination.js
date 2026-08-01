/**
 * Normaliza page/limit para consultas paginadas con LIMIT/OFFSET en SQL.
 * Evita OFFSET negativo (page<=0) y limita el máximo de filas por página.
 * @param {number|string} page
 * @param {number|string} limit
 * @param {{limiteMaximo?: number, limitePorDefecto?: number}} [opciones]
 * @returns {{page: number, limit: number, offset: number}}
 */
export function normalizarPaginacion(page, limit, { limiteMaximo = 100, limitePorDefecto = 10 } = {}) {
  let paginaNormalizada = parseInt(page, 10);
  if (!Number.isInteger(paginaNormalizada) || paginaNormalizada < 1) {
    paginaNormalizada = 1;
  }

  let limiteNormalizado = parseInt(limit, 10);
  if (!Number.isInteger(limiteNormalizado) || limiteNormalizado < 1) {
    limiteNormalizado = limitePorDefecto;
  }
  if (limiteNormalizado > limiteMaximo) {
    limiteNormalizado = limiteMaximo;
  }

  const offset = (paginaNormalizada - 1) * limiteNormalizado;
  return { page: paginaNormalizada, limit: limiteNormalizado, offset };
}
