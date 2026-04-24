import sequelize from '../../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import ExcelJS from 'exceljs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte un campo de texto (CSV o JSON) en array de strings limpios.
 * Soporta: JSON array, texto separado por comas.
 */
function parseTextArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch { /* not JSON */ }
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Agrupa un array de filas por una clave dada → Map<keyValue, row[]>
 */
function groupById(rows, keyField) {
  const map = new Map();
  for (const row of rows) {
    const k = row[keyField];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(row);
  }
  return map;
}

/**
 * Convierte una fila SQL cruda + arrays relacionados en un DTO limpio.
 * - Elimina IDs internos del output
 * - Normaliza arrays (liderazgo, necesidad_enfermo, destrezas, celebraciones)
 * - Agrupa ubicación (con {id,nombre}) y familia en sub-objetos
 * - sistema_acueducto es objeto singular {id,nombre} | null (un registro por familia)
 * - aguas_residuales es array (múltiples registros posibles)
 * - celebraciones es array desde tabla persona_celebracion
 */
function toPersonaDTO(row, destrezas, disposicionBasura, sistemaAcueducto, aguasResiduales, celebraciones) {
  return {
    // ── Datos personales ──────────────────────────────────────────────────────
    nombres:             row.nombres            ?? null,
    identificacion:      row.identificacion      ?? null,
    tipo_identificacion: row.tipo_identificacion ?? null,
    fecha_nacimiento:    row.fecha_nacimiento    ?? null,
    sexo:                row.sexo                ?? null,
    telefono:            row.telefono            ?? null,
    correo_electronico:  row.correo_electronico  ?? null,
    direccion:           row.direccion           ?? null,
    parentesco:          row.parentesco          ?? null,
    estado_civil:        row.estado_civil        ?? null,
    profesion:           row.profesion           ?? null,
    nivel_educativo:     row.nivel_educativo     ?? null,
    comunidad_cultural:  row.comunidad_cultural  ?? null,
    tallas: {
      camisa:   row.talla_camisa   ?? null,
      pantalon: row.talla_pantalon ?? null,
      zapato:   row.talla_zapato   ?? null,
    },
    // Arrays — siempre devueltos como array, nunca string
    liderazgo:         parseTextArray(row.liderazgo_raw),
    necesidad_enfermo: parseTextArray(row.necesidad_enfermo_raw),
    destrezas,
    // Múltiples celebraciones por persona (tabla persona_celebracion)
    celebraciones,

    // ── Familia ───────────────────────────────────────────────────────────────
    familia: {
      apellido_familiar:         row.apellido_familiar         ?? null,
      sustento_familia:          row.sustento_familia          ?? null,
      observaciones_encuestador: row.observaciones_encuestador ?? null,
      autorizacion_datos:        row.autorizacion_datos        ?? null,
      tipo_vivienda:             row.tipo_vivienda             ?? null,
      // Servicios: disposicion_basura y aguas_residuales son arrays; sistema_acueducto es objeto único
      disposicion_basura: disposicionBasura,
      sistema_acueducto:  sistemaAcueducto,  // { id, nombre } | null
      aguas_residuales:   aguasResiduales,
    },

    // ── Ubicación geográfica — espejo del modelo de entrada {id, nombre} ─────
    ubicacion: {
      municipio:      row.id_municipio      ? { id: Number(row.id_municipio),      nombre: row.municipio      ?? null } : null,
      parroquia:      row.id_parroquia      ? { id: Number(row.id_parroquia),      nombre: row.parroquia      ?? null } : null,
      sector:         (row.id_sector || row.sector)
        ? { id: row.id_sector ? Number(row.id_sector) : null, nombre: row.sector ?? null }
        : null,
      vereda:         row.id_vereda         ? { id: Number(row.id_vereda),         nombre: row.vereda         ?? null } : null,
      corregimiento:  row.id_corregimiento  ? { id: Number(row.id_corregimiento),  nombre: row.corregimiento  ?? null } : null,
      centro_poblado: row.id_centro_poblado ? { id: Number(row.id_centro_poblado), nombre: row.centro_poblado ?? null } : null,
    },
  };
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio consolidado para consulta avanzada de personas.
 * Soporta 28 filtros combinables y exportación a Excel.
 */
class PersonasService {

  /**
   * Consulta avanzada de personas con múltiples filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Resultado paginado
   */
  async consultarPersonas(filtros = {}) {
    try {
      console.log('🔍 Consultando personas con filtros:', filtros);

      const {
        // Paginación
        page = 1,
        limit = 10,

        // Ubicación geográfica (IDs)
        id_municipio,
        id_parroquia,
        id_sector,
        id_vereda,
        id_corregimiento,
        id_centro_poblado,

        // Familia y vivienda
        apellido_familiar,
        id_tipo_vivienda,

        // Datos personales (IDs)
        id_parentesco,
        id_estado_civil,
        id_profesion,
        id_nivel_educativo,
        id_comunidad_cultural,
        liderazgo,
        id_destreza,
        
        // Sexo
        id_sexo,
        sexo,

        // Tallas
        talla_camisa,
        talla_pantalon,
        talla_zapato,

        // Edades
        edad_min,
        edad_max,

        // Fechas de registro
        fecha_registro_desde,
        fecha_registro_hasta
      } = filtros;

      const offset = (page - 1) * limit;
      const whereConditions = [];
      const params = { limit, offset };

      // FILTROS GEOGRÁFICOS (por ID)
      if (id_municipio) {
        whereConditions.push('f.id_municipio = :id_municipio');
        params.id_municipio = id_municipio;
      }

      if (id_parroquia) {
        whereConditions.push('f.id_parroquia = :id_parroquia');
        params.id_parroquia = id_parroquia;
      }

      if (id_sector) {
        whereConditions.push('f.id_sector = :id_sector');
        params.id_sector = id_sector;
      }

      if (id_vereda) {
        whereConditions.push('f.id_vereda = :id_vereda');
        params.id_vereda = id_vereda;
      }

      if (id_corregimiento) {
        whereConditions.push('f.id_corregimiento = :id_corregimiento');
        params.id_corregimiento = id_corregimiento;
      }

      if (id_centro_poblado) {
        whereConditions.push('f.id_centro_poblado = :id_centro_poblado');
        params.id_centro_poblado = id_centro_poblado;
      }

      // FILTROS DE FAMILIA
      if (apellido_familiar) {
        whereConditions.push('f.apellido_familiar ILIKE :apellido_familiar');
        params.apellido_familiar = `%${apellido_familiar}%`;
      }

      if (id_tipo_vivienda) {
        whereConditions.push('f.id_tipo_vivienda = :id_tipo_vivienda');
        params.id_tipo_vivienda = id_tipo_vivienda;
      }

      // FILTROS DE DATOS PERSONALES (por ID)
      if (id_parentesco) {
        whereConditions.push('p.id_parentesco = :id_parentesco');
        params.id_parentesco = id_parentesco;
      }

      if (id_estado_civil) {
        whereConditions.push('p.id_estado_civil_estado_civil = :id_estado_civil');
        params.id_estado_civil = id_estado_civil;
      }

      if (id_profesion) {
        whereConditions.push('p.id_profesion = :id_profesion');
        params.id_profesion = id_profesion;
      }

      if (id_nivel_educativo) {
        whereConditions.push('p.id_nivel_educativo = :id_nivel_educativo');
        params.id_nivel_educativo = id_nivel_educativo;
      }

      if (id_comunidad_cultural) {
        whereConditions.push('p.id_comunidad_cultural = :id_comunidad_cultural');
        params.id_comunidad_cultural = id_comunidad_cultural;
      }

      if (liderazgo) {
        whereConditions.push('p.en_que_eres_lider IS NOT NULL AND p.en_que_eres_lider != \'\'');
      }

      if (id_destreza) {
        whereConditions.push(`
          EXISTS (
            SELECT 1 FROM persona_destreza dp
            WHERE dp.id_personas_personas = p.id_personas
            AND dp.id_destrezas_destrezas = :id_destreza
          )
        `);
        params.id_destreza = id_destreza;
      }

      // FILTROS DE TALLAS
      if (talla_camisa) {
        whereConditions.push('p.talla_camisa = :talla_camisa');
        params.talla_camisa = talla_camisa;
      }

      if (talla_pantalon) {
        whereConditions.push('p.talla_pantalon = :talla_pantalon');
        params.talla_pantalon = talla_pantalon;
      }

      if (talla_zapato) {
        whereConditions.push('p.talla_zapato = :talla_zapato');
        params.talla_zapato = talla_zapato;
      }

      // FILTROS DE SEXO
      if (id_sexo) {
        whereConditions.push('p.id_sexo = :id_sexo');
        params.id_sexo = id_sexo;
      }

      if (sexo) {
        whereConditions.push('sx.nombre ILIKE :sexo');
        params.sexo = `%${sexo}%`;
      }

      // FILTROS DE EDAD
      if (edad_min) {
        whereConditions.push('EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) >= :edad_min');
        params.edad_min = edad_min;
      }

      if (edad_max) {
        whereConditions.push('EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) <= :edad_max');
        params.edad_max = edad_max;
      }

      // FILTROS DE FECHAS DE REGISTRO
      if (fecha_registro_desde) {
        whereConditions.push('f.fecha_encuesta >= :fecha_registro_desde');
        params.fecha_registro_desde = fecha_registro_desde;
      }

      if (fecha_registro_hasta) {
        whereConditions.push('f.fecha_encuesta <= :fecha_registro_hasta');
        params.fecha_registro_hasta = fecha_registro_hasta;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      // ── Consulta principal ──────────────────────────────────────────────────
      // JOIN fix: personas tiene DOS columnas FK a familias (id_familia_familias e id_familia).
      // Usando COALESCE garantizamos que el JOIN funcione sin importar cuál esté poblada.
      const query = `
        SELECT
          -- IDs internos (uso interno para sub-consultas)
          p.id_personas,
          COALESCE(p.id_familia_familias, p.id_familia) AS id_familia,

          -- Datos personales
          p.nombres,
          p.identificacion,
          ti.nombre                            AS tipo_identificacion,
          p.fecha_nacimiento,
          sx.nombre                            AS sexo,
          p.telefono,
          p.correo_electronico,
          p.direccion,
          par.nombre                           AS parentesco,
          ec.nombre                            AS estado_civil,
          prof.nombre                          AS profesion,
          COALESCE(ne.nivel, p.estudios)       AS nivel_educativo,
          cc.nombre                            AS comunidad_cultural,
          p.en_que_eres_lider                  AS liderazgo_raw,
          p.necesidad_enfermo                  AS necesidad_enfermo_raw,
          p.talla_camisa,
          p.talla_pantalon,
          p.talla_zapato,

          -- Familia
          f.apellido_familiar,
          f.sustento_familia,
          f.observaciones_encuestador,
          f.autorizacion_datos,
          tv.nombre                            AS tipo_vivienda,

          -- IDs geográficos (para respuesta con {id, nombre} y para validación)
          f.id_municipio,
          f.id_parroquia,
          f.id_sector,
          f.id_vereda,
          f.id_corregimiento,
          f.id_centro_poblado,

          -- Nombres geográficos
          m.nombre_municipio                   AS municipio,
          pr.nombre                            AS parroquia,
          COALESCE(sec.nombre, f.sector)       AS sector,
          v.nombre                             AS vereda,
          corr.nombre                          AS corregimiento,
          cp.nombre                            AS centro_poblado

        FROM personas p
        LEFT JOIN familias            f    ON COALESCE(p.id_familia_familias, p.id_familia) = f.id_familia
        LEFT JOIN municipios          m    ON f.id_municipio        = m.id_municipio
        LEFT JOIN sectores            sec  ON f.id_sector           = sec.id_sector
        LEFT JOIN veredas             v    ON f.id_vereda           = v.id_vereda
        LEFT JOIN corregimientos      corr ON f.id_corregimiento    = corr.id_corregimiento
        LEFT JOIN centros_poblados    cp   ON f.id_centro_poblado   = cp.id_centro_poblado
        LEFT JOIN sexos               sx   ON p.id_sexo             = sx.id_sexo
        LEFT JOIN parroquia           pr   ON f.id_parroquia        = pr.id_parroquia
        LEFT JOIN parentescos         par  ON p.id_parentesco       = par.id_parentesco
        LEFT JOIN situaciones_civiles ec   ON p.id_estado_civil_estado_civil = ec.id_situacion_civil
        LEFT JOIN profesiones         prof ON p.id_profesion        = prof.id_profesion
        LEFT JOIN niveles_educativos  ne   ON p.id_nivel_educativo  = ne.id_niveles_educativos
        LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
        LEFT JOIN tipos_vivienda      tv   ON f.id_tipo_vivienda    = tv.id_tipo_vivienda
        LEFT JOIN tipos_identificacion ti  ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        ${whereClause}
        ORDER BY p.nombres
        LIMIT :limit OFFSET :offset
      `;

      // CONSULTA DE TOTAL
      const countQuery = `
        SELECT COUNT(p.id_personas) AS total
        FROM personas p
        LEFT JOIN familias            f    ON COALESCE(p.id_familia_familias, p.id_familia) = f.id_familia
        LEFT JOIN municipios          m    ON f.id_municipio        = m.id_municipio
        LEFT JOIN sectores            sec  ON f.id_sector           = sec.id_sector
        LEFT JOIN veredas             v    ON f.id_vereda           = v.id_vereda
        LEFT JOIN corregimientos      corr ON f.id_corregimiento    = corr.id_corregimiento
        LEFT JOIN centros_poblados    cp   ON f.id_centro_poblado   = cp.id_centro_poblado
        LEFT JOIN sexos               sx   ON p.id_sexo             = sx.id_sexo
        LEFT JOIN parroquia           pr   ON f.id_parroquia        = pr.id_parroquia
        LEFT JOIN parentescos         par  ON p.id_parentesco       = par.id_parentesco
        LEFT JOIN situaciones_civiles ec   ON p.id_estado_civil_estado_civil = ec.id_situacion_civil
        LEFT JOIN profesiones         prof ON p.id_profesion        = prof.id_profesion
        LEFT JOIN niveles_educativos  ne   ON p.id_nivel_educativo  = ne.id_niveles_educativos
        LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
        LEFT JOIN tipos_vivienda      tv   ON f.id_tipo_vivienda    = tv.id_tipo_vivienda
        ${whereClause}
      `;

      console.log('📋 Ejecutando consulta con parámetros:', params);

      const rows = await sequelize.query(query, { replacements: params, type: QueryTypes.SELECT });
      const [countResult] = await sequelize.query(countQuery, { replacements: params, type: QueryTypes.SELECT });

      if (rows.length === 0) {
        return { total: parseInt(countResult.total), page: parseInt(page), limit: parseInt(limit), data: [] };
      }

      // ── Sub-consultas en lote (evita N+1) ────────────────────────────────────
      const personaIds = rows.map(r => r.id_personas);
      const familiaIds = [...new Set(rows.map(r => r.id_familia).filter(Boolean))];

      const [destrezasRows, basuraRows, acueductoRows, aguasRows, celebracionesRows] = await Promise.all([
        // Destrezas por persona
        sequelize.query(
          `SELECT pd.id_personas_personas AS id_persona, d.nombre
           FROM persona_destreza pd
           INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
           WHERE pd.id_personas_personas IN (:ids)`,
          { replacements: { ids: personaIds }, type: QueryTypes.SELECT }
        ),
        // Disposición de basura por familia (array de catálogo)
        familiaIds.length ? sequelize.query(
          `SELECT fdb.id_familia, tdb.id_tipo_disposicion_basura AS id, tdb.nombre
           FROM familia_disposicion_basura fdb
           INNER JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
           WHERE fdb.id_familia IN (:ids)`,
          { replacements: { ids: familiaIds }, type: QueryTypes.SELECT }
        ) : Promise.resolve([]),
        // Sistema de acueducto por familia (se toma solo el primero → objeto único)
        familiaIds.length ? sequelize.query(
          `SELECT fsa.id_familia, sa.id_sistema_acueducto AS id, sa.nombre
           FROM familia_sistema_acueducto fsa
           INNER JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
           WHERE fsa.id_familia IN (:ids)`,
          { replacements: { ids: familiaIds }, type: QueryTypes.SELECT }
        ) : Promise.resolve([]),
        // Aguas residuales por familia (array)
        familiaIds.length ? sequelize.query(
          `SELECT far.id_familia, tar.id_tipo_aguas_residuales AS id, tar.nombre
           FROM familia_sistema_aguas_residuales far
           INNER JOIN tipos_aguas_residuales tar ON far.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
           WHERE far.id_familia IN (:ids)`,
          { replacements: { ids: familiaIds }, type: QueryTypes.SELECT }
        ) : Promise.resolve([]),
        // Celebraciones por persona (tabla persona_celebracion, columna id_persona sin 's')
        sequelize.query(
          `SELECT pc.id_persona, pc.motivo, pc.dia, pc.mes
           FROM persona_celebracion pc
           WHERE pc.id_persona IN (:ids)
           ORDER BY pc.mes, pc.dia`,
          { replacements: { ids: personaIds }, type: QueryTypes.SELECT }
        ),
      ]);

      // Agrupar por clave para O(1) lookup
      const destrezasByPersona     = groupById(destrezasRows,     'id_persona');
      const basuraByFamilia        = groupById(basuraRows,        'id_familia');
      const acueductoByFamilia     = groupById(acueductoRows,     'id_familia');
      const aguasByFamilia         = groupById(aguasRows,         'id_familia');
      const celebracionesByPersona = groupById(celebracionesRows, 'id_persona');

      // ── Mapear filas crudas → DTOs limpios ───────────────────────────────────
      const data = rows.map(row => {
        const destrezas        = (destrezasByPersona.get(row.id_personas)     || []).map(d => d.nombre);
        const fid              = row.id_familia;
        const disposicionBasura = (basuraByFamilia.get(fid)    || []).map(r => ({ id: Number(r.id), nombre: r.nombre }));
        // sistema_acueducto: objeto único (primer registro) o null
        const acueductoArr     = acueductoByFamilia.get(fid) || [];
        const sistemaAcueducto = acueductoArr.length ? { id: Number(acueductoArr[0].id), nombre: acueductoArr[0].nombre } : null;
        const aguasResiduales  = (aguasByFamilia.get(fid)     || []).map(r => ({ id: Number(r.id), nombre: r.nombre }));
        const celebraciones    = (celebracionesByPersona.get(row.id_personas) || []).map(c => ({
          motivo: c.motivo ?? null,
          dia:    c.dia    ?? null,
          mes:    c.mes    ?? null,
        }));
        return toPersonaDTO(row, destrezas, disposicionBasura, sistemaAcueducto, aguasResiduales, celebraciones);
      });

      console.log(`✅ Consulta exitosa: ${data.length} personas encontradas de ${countResult.total} totales`);

      return {
        total: parseInt(countResult.total),
        page: parseInt(page),
        limit: parseInt(limit),
        data
      };

    } catch (error) {
      console.error('❌ Error consultando personas:', error);
      throw error;
    }
  }

  /**
   * Generar reporte Excel de personas
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Buffer>} Buffer del archivo Excel
   */
  async generarExcelPersonas(filtros = {}) {
    try {
      console.log('📊 Generando Excel de personas...');

      // Usar consulta sin límite para Excel (obtener todos)
      const resultado = await this.consultarPersonas({ ...filtros, limit: 10000, page: 1 });
      const personas = resultado.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Personas');

      // Definir columnas
      worksheet.columns = [
        { header: 'Nombres',             key: 'nombres',             width: 35 },
        { header: 'Documento',           key: 'identificacion',      width: 18 },
        { header: 'Tipo ID',             key: 'tipo_identificacion', width: 15 },
        { header: 'Fecha Nacimiento',    key: 'fecha_nacimiento',    width: 15 },
        { header: 'Sexo',                key: 'sexo',                width: 12 },
        { header: 'Teléfono',            key: 'telefono',            width: 15 },
        { header: 'Email',               key: 'correo_electronico',  width: 30 },
        { header: 'Dirección',           key: 'direccion',           width: 30 },
        { header: 'Parentesco',          key: 'parentesco',          width: 15 },
        { header: 'Estado Civil',        key: 'estado_civil',        width: 15 },
        { header: 'Profesión',           key: 'profesion',           width: 25 },
        { header: 'Nivel Educativo',     key: 'nivel_educativo',     width: 25 },
        { header: 'Comunidad Cultural',  key: 'comunidad_cultural',  width: 25 },
        { header: 'Talla Camisa',        key: 'talla_camisa',        width: 12 },
        { header: 'Talla Pantalón',      key: 'talla_pantalon',      width: 12 },
        { header: 'Talla Zapato',        key: 'talla_zapato',        width: 12 },
        { header: 'Liderazgo',           key: 'liderazgo',           width: 35 },
        { header: 'Necesidades Salud',   key: 'necesidad_enfermo',   width: 35 },
        { header: 'Destrezas',           key: 'destrezas',           width: 35 },
        { header: 'Apellido Familiar',   key: 'apellido_familiar',   width: 25 },
        { header: 'Sustento Familia',    key: 'sustento_familia',    width: 30 },
        { header: 'Autorización Datos',  key: 'autorizacion_datos',  width: 16 },
        { header: 'Tipo Vivienda',       key: 'tipo_vivienda',       width: 20 },
        { header: 'Celebraciones',       key: 'celebraciones',       width: 40 },
        { header: 'Disposición Basura',  key: 'disposicion_basura',  width: 35 },
        { header: 'Sistema Acueducto',   key: 'sistema_acueducto',   width: 30 },
        { header: 'Aguas Residuales',    key: 'aguas_residuales',    width: 30 },
        { header: 'Municipio',           key: 'municipio',           width: 20 },
        { header: 'Parroquia',           key: 'parroquia',           width: 25 },
        { header: 'Sector',              key: 'sector',              width: 20 },
        { header: 'Vereda',              key: 'vereda',              width: 25 },
        { header: 'Corregimiento',       key: 'corregimiento',       width: 25 },
        { header: 'Centro Poblado',      key: 'centro_poblado',      width: 25 },
      ];

      // Estilo del header
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 25;

      // Agregar datos
      personas.forEach((p, index) => {
        const row = worksheet.addRow({
          nombres:             p.nombres,
          identificacion:      p.identificacion,
          tipo_identificacion: p.tipo_identificacion,
          fecha_nacimiento:    p.fecha_nacimiento,
          sexo:                p.sexo,
          telefono:            p.telefono,
          correo_electronico:  p.correo_electronico,
          direccion:           p.direccion,
          parentesco:          p.parentesco,
          estado_civil:        p.estado_civil,
          profesion:           p.profesion,
          nivel_educativo:     p.nivel_educativo,
          comunidad_cultural:  p.comunidad_cultural,
          talla_camisa:        p.tallas?.camisa,
          talla_pantalon:      p.tallas?.pantalon,
          talla_zapato:        p.tallas?.zapato,
          liderazgo:           p.liderazgo?.join(', ')                                     || '',
          necesidad_enfermo:   p.necesidad_enfermo?.join(', ')                             || '',
          destrezas:           p.destrezas?.join(', ')                                     || '',
          apellido_familiar:   p.familia?.apellido_familiar,
          sustento_familia:    p.familia?.sustento_familia,
          autorizacion_datos:  p.familia?.autorizacion_datos ? 'Sí' : 'No',
          tipo_vivienda:       p.familia?.tipo_vivienda,
          celebraciones:       p.celebraciones?.map(c => `${c.motivo || ''} (${c.dia || '?'}/${c.mes || '?'})`).join(' | ') || '',
          disposicion_basura:  p.familia?.disposicion_basura?.map(d => d.nombre).join(', ')  || '',
          sistema_acueducto:   p.familia?.sistema_acueducto?.nombre                           || '',
          aguas_residuales:    p.familia?.aguas_residuales?.map(a => a.nombre).join(', ')     || '',
          municipio:           p.ubicacion?.municipio?.nombre,
          parroquia:           p.ubicacion?.parroquia?.nombre,
          sector:              p.ubicacion?.sector?.nombre,
          vereda:              p.ubicacion?.vereda?.nombre,
          corregimiento:       p.ubicacion?.corregimiento?.nombre,
          centro_poblado:      p.ubicacion?.centro_poblado?.nombre,
        });

        // Zebra striping
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F2F2' }
          };
        }

        // Bordes
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'D3D3D3' } },
            left: { style: 'thin', color: { argb: 'D3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
            right: { style: 'thin', color: { argb: 'D3D3D3' } }
          };
          cell.alignment = { vertical: 'middle', wrapText: true };
        });
      });

      // Autofiltro
      worksheet.autoFilter = {
        from: 'A1',
        to: `AG1`
      };

      // Congelar primera fila
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      console.log(`✅ Excel generado: ${personas.length} personas`);

      return buffer;

    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      throw error;
    }
  }
}

export default new PersonasService();
