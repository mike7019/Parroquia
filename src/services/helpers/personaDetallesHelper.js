/**
 * Helper para obtener detalles completos de personas
 * Incluye celebraciones y enfermedades de tablas intermedias
 */

import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

/**
 * Obtiene todas las celebraciones de una persona
 * @param {number} idPersona - ID de la persona
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Array>} Array de celebraciones
 */
export async function obtenerCelebracionesPersona(idPersona, transaction = null) {
  const celebraciones = await sequelize.query(`
    SELECT 
      pc.id,
      pc.motivo,
      pc.dia,
      pc.mes,
      pc.created_at,
      pc.updated_at
    FROM persona_celebracion pc
    WHERE pc.id_persona = :idPersona
    ORDER BY pc.mes ASC, pc.dia ASC
  `, {
    replacements: { idPersona },
    type: QueryTypes.SELECT,
    transaction
  });

  return celebraciones;
}

/**
 * Obtiene todas las enfermedades de una persona
 * @param {number} idPersona - ID de la persona
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Array>} Array de enfermedades con información del catálogo
 */
export async function obtenerEnfermedadesPersona(idPersona, transaction = null) {
  const enfermedades = await sequelize.query(`
    SELECT 
      pe.*,
      e.nombre as enfermedad_nombre,
      e.descripcion as enfermedad_descripcion
    FROM persona_enfermedad pe
    INNER JOIN enfermedades e ON e.id_enfermedad = pe.id_enfermedad
    WHERE pe.id_persona = :idPersona
    ORDER BY e.nombre ASC
  `, {
    replacements: { idPersona },
    type: QueryTypes.SELECT,
    transaction
  });

  return enfermedades;
}

/**
 * Obtiene todas las celebraciones de múltiples personas
 * @param {Array<number>} idsPersonas - Array de IDs de personas
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Map>} Map con id_persona como clave y array de celebraciones como valor
 */
export async function obtenerCelebracionesMultiplesPersonas(idsPersonas, transaction = null) {
  if (!idsPersonas || idsPersonas.length === 0) {
    return new Map();
  }

  const celebraciones = await sequelize.query(`
    SELECT 
      pc.id_personas,
      pc.id_persona_celebracion as id,
      pc.motivo,
      pc.dia,
      pc.mes,
      pc.created_at,
      pc.updated_at
    FROM persona_celebracion pc
    WHERE pc.id_personas IN (:idsPersonas)
    ORDER BY pc.id_personas ASC, pc.mes ASC, pc.dia ASC
  `, {
    replacements: { idsPersonas },
    type: QueryTypes.SELECT,
    transaction
  });

  // Agrupar por id_personas
  const celebracionesPorPersona = new Map();
  celebraciones.forEach(cel => {
    if (!celebracionesPorPersona.has(cel.id_personas)) {
      celebracionesPorPersona.set(cel.id_personas, []);
    }
    celebracionesPorPersona.get(cel.id_personas).push(cel);
  });

  return celebracionesPorPersona;
}

/**
 * Obtiene todas las enfermedades de múltiples personas
 * @param {Array<number>} idsPersonas - Array de IDs de personas
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Map>} Map con id_persona como clave y array de enfermedades como valor
 */
export async function obtenerEnfermedadesMultiplesPersonas(idsPersonas, transaction = null) {
  if (!idsPersonas || idsPersonas.length === 0) {
    return new Map();
  }

  const enfermedades = await sequelize.query(`
    SELECT 
      pe.*,
      e.nombre as enfermedad_nombre,
      e.descripcion as enfermedad_descripcion
    FROM persona_enfermedad pe
    INNER JOIN enfermedades e ON e.id_enfermedad = pe.id_enfermedad
    WHERE pe.id_persona IN (:idsPersonas)
    ORDER BY pe.id_persona ASC, e.nombre ASC
  `, {
    replacements: { idsPersonas },
    type: QueryTypes.SELECT,
    transaction
  });

  // Agrupar por id_persona
  const enfermedadesPorPersona = new Map();
  enfermedades.forEach(enf => {
    if (!enfermedadesPorPersona.has(enf.id_persona)) {
      enfermedadesPorPersona.set(enf.id_persona, []);
    }
    enfermedadesPorPersona.get(enf.id_persona).push(enf);
  });

  return enfermedadesPorPersona;
}

/**
 * Enriquece un array de personas con sus celebraciones y enfermedades
 * @param {Array} personas - Array de personas
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Array>} Personas enriquecidas con celebraciones y enfermedades
 */
export async function enriquecerPersonasConDetalles(personas, transaction = null) {
  if (!personas || personas.length === 0) {
    return [];
  }

  const idsPersonas = personas.map(p => p.id_personas).filter(Boolean);
  
  // Obtener celebraciones y enfermedades en paralelo
  const [celebracionesMap, enfermedadesMap] = await Promise.all([
    obtenerCelebracionesMultiplesPersonas(idsPersonas, transaction),
    obtenerEnfermedadesMultiplesPersonas(idsPersonas, transaction)
  ]);

  // Agregar a cada persona
  return personas.map(persona => ({
    ...persona,
    celebraciones: celebracionesMap.get(persona.id_personas) || [],
    enfermedades: enfermedadesMap.get(persona.id_personas) || [],
    // DEPRECATED: Mantener para compatibilidad con versiones anteriores
    motivo_celebrar_deprecated: persona.motivo_celebrar,
    dia_celebrar_deprecated: persona.dia_celebrar,
    mes_celebrar_deprecated: persona.mes_celebrar,
    necesidad_enfermo_deprecated: persona.necesidad_enfermo
  }));
}

/**
 * Obtiene personas de una familia con todos sus detalles
 * Incluye celebraciones y enfermedades de tablas intermedias
 * @param {number} idFamilia - ID de la familia
 * @param {object} transaction - Transacción opcional
 * @returns {Promise<Array>} Personas con detalles completos
 */
export async function obtenerPersonasFamiliaCompletas(idFamilia, transaction = null) {
  // Obtener personas básicas
  const personas = await sequelize.query(`
    SELECT 
      p.id_personas,
      p.primer_nombre,
      p.segundo_nombre,
      p.primer_apellido,
      p.segundo_apellido,
      p.identificacion,
      p.telefono,
      p.correo_electronico,
      p.fecha_nacimiento,
      p.direccion,
      p.estudios,
      p.en_que_eres_lider,
      p.talla_camisa,
      p.talla_pantalon,
      p.talla_zapato,
      p.id_sexo,
      p.id_profesion,
      p.id_parentesco,
      p.id_comunidad_cultural,
      p.id_tipo_identificacion_tipo_identificacion,
      p.id_estado_civil_estado_civil,
      -- Campos antiguos para compatibilidad (marcados como deprecated)
      p.motivo_celebrar,
      p.dia_celebrar,
      p.mes_celebrar,
      p.necesidad_enfermo,
      -- Información de catálogos
      s.id_sexo as sexo_id,
      s.nombre as sexo_nombre,
      ti.id_tipo_identificacion as tipo_id_id,
      ti.nombre as tipo_id_nombre,
      ti.codigo as tipo_id_codigo,
      sc.id_situacion_civil as estado_civil_id,
      sc.nombre as estado_civil_nombre,
      prof.id_profesion as profesion_id,
      prof.nombre as profesion_nombre,
      par.id_parentesco as parentesco_id,
      par.nombre as parentesco_nombre,
      cc.id_comunidad_cultural as comunidad_cultural_id,
      cc.nombre as comunidad_cultural_nombre
    FROM personas p
    LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
    LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
    LEFT JOIN situaciones_civiles sc ON p.id_estado_civil_estado_civil = sc.id_situacion_civil
    LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
    LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
    LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
    WHERE p.id_familia_familias = :idFamilia 
      AND (p.identificacion NOT LIKE 'FALLECIDO%' OR p.identificacion IS NULL)
    ORDER BY p.id_personas ASC
  `, {
    replacements: { idFamilia },
    type: QueryTypes.SELECT,
    transaction
  });

  // Enriquecer con celebraciones y enfermedades
  return await enriquecerPersonasConDetalles(personas, transaction);
}

export default {
  obtenerCelebracionesPersona,
  obtenerEnfermedadesPersona,
  obtenerCelebracionesMultiplesPersonas,
  obtenerEnfermedadesMultiplesPersonas,
  enriquecerPersonasConDetalles,
  obtenerPersonasFamiliaCompletas
};
