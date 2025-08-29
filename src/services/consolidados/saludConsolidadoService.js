import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';

class SaludConsolidadoService {
  /**
   * Consulta consolidada de salud de personas usando SOLO SQL directo
   */
  async consultarSalud(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de salud...', filtros);
      
      // Usar SOLO consulta SQL directa para evitar problemas de asociaciones
      let whereConditions = [];
      let params = {};
      
      // Construir condiciones WHERE
      if (filtros.enfermedad) {
        whereConditions.push(`p.necesidad_enfermo ILIKE :enfermedad`);
        params.enfermedad = `%${filtros.enfermedad}%`;
      }
      
      // Filtrar por rango de edad
      if (filtros.rango_edad) {
        const [edadMin, edadMax] = filtros.rango_edad.split('-').map(e => parseInt(e.trim()));
        if (edadMin && edadMax) {
          whereConditions.push(`EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) BETWEEN :edad_min AND :edad_max`);
          params.edad_min = edadMin;
          params.edad_max = edadMax;
        }
      }
      
      if (filtros.edad_min) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) >= :edad_min_individual`);
        params.edad_min_individual = filtros.edad_min;
      }
      
      if (filtros.edad_max) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) <= :edad_max_individual`);
        params.edad_max_individual = filtros.edad_max;
      }
      
      // Filtrar por sexo
      if (filtros.sexo) {
        const sexoUpper = filtros.sexo.toUpperCase();
        if (sexoUpper === 'M' || sexoUpper === 'MASCULINO') {
          whereConditions.push(`s.descripcion ILIKE '%masculino%'`);
        } else if (sexoUpper === 'F' || sexoUpper === 'FEMENINO') {
          whereConditions.push(`s.descripcion ILIKE '%femenino%'`);
        }
      }
      
      if (filtros.parroquia) {
        whereConditions.push(`pr.nombre ILIKE :parroquia`);
        params.parroquia = `%${filtros.parroquia}%`;
      }
      
      if (filtros.municipio) {
        whereConditions.push(`m.nombre_municipio ILIKE :municipio`);
        params.municipio = `%${filtros.municipio}%`;
      }
      
      if (filtros.sector) {
        whereConditions.push(`(sec.nombre ILIKE :sector OR f.sector ILIKE :sector)`);
        params.sector = `%${filtros.sector}%`;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const limite = filtros.limite || 100;
      params.limite = limite;
      
      const query = `
        SELECT 
          p.id_personas,
          CONCAT(p.primer_nombre, 
                 CASE WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre ELSE '' END,
                 ' ', p.primer_apellido,
                 CASE WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido ELSE '' END
          ) as nombre_completo,
          p.identificacion as documento,
          p.telefono,
          p.fecha_nacimiento,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          p.necesidad_enfermo,
          CASE 
            WHEN p.necesidad_enfermo IS NOT NULL AND p.necesidad_enfermo != '' THEN true
            ELSE false
          END as tiene_enfermedades,
          s.descripcion as sexo,
          f.apellido_familiar,
          f.sector as sector_familia,
          f.telefono as telefono_familia,
          f.direccion_familia,
          m.nombre_municipio,
          sec.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          pr.nombre as nombre_parroquia,
          CASE 
            WHEN p.id_familia_familias IS NOT NULL THEN 'Miembro de familia'
            ELSE 'Individual'
          END as tipo_registro
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        ${whereClause}
        ORDER BY p.primer_apellido, p.primer_nombre
        LIMIT :limite
      `;
      
      console.log('📋 Ejecutando consulta SQL de salud:', query);
      console.log('📊 Parámetros:', params);
      
      const personas = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      // Consulta para obtener el total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        ${whereClause}
      `;
      
      const [countResult] = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      // Procesar los datos para estructurar mejor la información de salud
      const personasConSalud = personas.map(persona => ({
        id: persona.id_personas,
        documento: persona.documento,
        nombre: persona.nombre_completo,
        edad: persona.edad,
        sexo: persona.sexo,
        telefono: persona.telefono,
        fecha_nacimiento: persona.fecha_nacimiento,
        apellido_familiar: persona.apellido_familiar,
        municipio: persona.nombre_municipio,
        sector: persona.nombre_sector || persona.sector_familia,
        vereda: persona.nombre_vereda,
        parroquia: persona.nombre_parroquia,
        direccion: persona.direccion_familia,
        telefono_familia: persona.telefono_familia,
        tipo_registro: persona.tipo_registro,
        salud: {
          enfermedades: persona.necesidad_enfermo ? 
            persona.necesidad_enfermo.split(',').map(e => e.trim()) : [],
          necesidades_medicas: persona.necesidad_enfermo,
          tiene_enfermedades: persona.tiene_enfermedades
        }
      }));
      
      console.log('✅ Consulta de salud exitosa:', {
        personas_encontradas: personasConSalud.length,
        total_en_db: countResult.total
      });
      
      return {
        datos: personasConSalud,
        total: parseInt(countResult.total),
        filtros_aplicados: filtros
      };
      
    } catch (error) {
      console.error('❌ Error en consulta consolidada de salud:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de salud
   */
  async obtenerEstadisticas() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_personas,
          COUNT(CASE WHEN p.necesidad_enfermo IS NOT NULL AND p.necesidad_enfermo != '' THEN 1 END) as con_enfermedades,
          COUNT(CASE WHEN p.necesidad_enfermo IS NULL OR p.necesidad_enfermo = '' THEN 1 END) as sin_enfermedades,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 2) as edad_promedio,
          COUNT(CASE WHEN s.descripcion ILIKE '%masculino%' THEN 1 END) as masculinos,
          COUNT(CASE WHEN s.descripcion ILIKE '%femenino%' THEN 1 END) as femeninos
        FROM personas p
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
      `;
      
      const [estadisticas] = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      return {
        total_personas: parseInt(estadisticas.total_personas),
        con_enfermedades: parseInt(estadisticas.con_enfermedades),
        sin_enfermedades: parseInt(estadisticas.sin_enfermedades),
        edad_promedio: parseFloat(estadisticas.edad_promedio),
        por_sexo: {
          masculino: parseInt(estadisticas.masculinos),
          femenino: parseInt(estadisticas.femeninos)
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de salud:', error);
      throw error;
    }
  }

  /**
   * Buscar personas con enfermedad específica
   */
  async buscarPorEnfermedad(enfermedad, limite = 50) {
    try {
      const query = `
        SELECT 
          p.id_personas,
          CONCAT(p.primer_nombre, ' ', p.primer_apellido) as nombre_completo,
          p.identificacion as documento,
          p.telefono,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          p.necesidad_enfermo,
          s.descripcion as sexo,
          f.apellido_familiar,
          m.nombre_municipio,
          sec.nombre as nombre_sector
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        WHERE p.necesidad_enfermo ILIKE :enfermedad
        ORDER BY p.primer_apellido, p.primer_nombre
        LIMIT :limite
      `;
      
      const resultado = await sequelize.query(query, {
        replacements: { 
          enfermedad: `%${enfermedad}%`,
          limite 
        },
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error buscando por enfermedad:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen por parroquia
   */
  async obtenerResumenPorParroquia(idParroquia) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_personas,
          COUNT(CASE WHEN p.necesidad_enfermo IS NOT NULL AND p.necesidad_enfermo != '' THEN 1 END) as con_enfermedades,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 2) as edad_promedio,
          pr.nombre as nombre_parroquia
        FROM personas p
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        WHERE p.id_parroquia = :idParroquia
        GROUP BY pr.nombre
      `;
      
      const [resultado] = await sequelize.query(query, {
        replacements: { idParroquia },
        type: QueryTypes.SELECT
      });
      
      return resultado || {
        total_personas: 0,
        con_enfermedades: 0,
        edad_promedio: 0,
        nombre_parroquia: 'Parroquia no encontrada'
      };
    } catch (error) {
      console.error('❌ Error obteniendo resumen por parroquia:', error);
      throw error;
    }
  }
}

export default new SaludConsolidadoService();
