/**
 * Sistema de Acueducto Service
 */

export const createSistemaAcueducto = async (data) => {
  return { message: 'test create', data };
};

export const bulkCreateSistemasAcueducto = async (sistemasData) => {
  return { message: 'test bulk create', count: sistemasData.length };
};
