import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import ExcelJS from 'exceljs';

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
      // Filtrar por ID de enfermedad (usar tabla relacional persona_enfermedad)
      if (filtros.id_enfermedad) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM persona_enfermedad pe 
          WHERE pe.id_persona = p.id_personas 
          AND pe.id_enfermedad = :id_enfermedad
        )`);
        params.id_enfermedad = filtros.id_enfermedad;
      }
      
      // Filtrar por texto en necesidad_enfermo (búsqueda parcial) - OPCIONAL
      if (filtros.enfermedad) {
        whereConditions.push(`p.necesidad_enfermo ILIKE :enfermedad`);
        params.enfermedad = `%${filtros.enfermedad}%`;
      }
      
      // Filtros de edad individuales
      if (filtros.edad_min) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) >= :edad_min_individual`);
        params.edad_min_individual = filtros.edad_min;
      }
      
      if (filtros.edad_max) {
        whereConditions.push(`EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) <= :edad_max_individual`);
        params.edad_max_individual = filtros.edad_max;
      }
      
      // Filtrar por sexo (ahora por ID)
      if (filtros.id_sexo) {
        whereConditions.push(`p.id_sexo = :id_sexo`);
        params.id_sexo = filtros.id_sexo;
      }
      
      // Filtrar por parroquia (ahora por ID)
      if (filtros.id_parroquia) {
        whereConditions.push(`f.id_parroquia = :id_parroquia`);
        params.id_parroquia = filtros.id_parroquia;
      }
      
      // Filtrar por municipio (ahora por ID)
      if (filtros.id_municipio) {
        whereConditions.push(`f.id_municipio = :id_municipio`);
        params.id_municipio = filtros.id_municipio;
      }
      
      // Filtrar por sector (ahora por ID)
      if (filtros.id_sector) {
        whereConditions.push(`f.id_sector = :id_sector`);
        params.id_sector = filtros.id_sector;
      }
      
      // Filtrar por corregimiento (ahora por ID)
      if (filtros.id_corregimiento) {
        whereConditions.push(`f.id_corregimiento = :id_corregimiento`);
        params.id_corregimiento = filtros.id_corregimiento;
      }
      
      // Filtrar por centro poblado (ahora por ID)
      if (filtros.id_centro_poblado) {
        whereConditions.push(`f.id_centro_poblado = :id_centro_poblado`);
        params.id_centro_poblado = filtros.id_centro_poblado;
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
          s.nombre as sexo,
          f.apellido_familiar,
          f.sector as sector_familia,
          f.telefono as telefono_familia,
          f.direccion_familia,
          m.nombre_municipio,
          sec.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          corr.nombre as corregimiento_nombre,
          cp.nombre as centro_poblado_nombre,
          pr.nombre as nombre_parroquia,
          -- Obtener enfermedades de la tabla relacional
          (SELECT STRING_AGG(e.nombre, ', ')
           FROM persona_enfermedad pe
           LEFT JOIN enfermedades e ON pe.id_enfermedad = e.id_enfermedad
           WHERE pe.id_persona = p.id_personas) as enfermedades_texto
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON f.id_parroquia = pr.id_parroquia
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
      const personasConSalud = personas.map((persona) => {
        return {
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
          corregimiento: persona.corregimiento_nombre,
          centro_poblado: persona.centro_poblado_nombre,
          parroquia: persona.nombre_parroquia,
          direccion: persona.direccion_familia,
          telefono_familia: persona.telefono_familia,
          salud: {
            enfermedades: persona.enfermedades_texto || '', // De la tabla persona_enfermedad
            necesidades_medicas: persona.necesidad_enfermo, // Del campo necesidad_enfermo
            tiene_enfermedades: persona.tiene_enfermedades
          }
        };
      });
      
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
          s.nombre as sexo,
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
      console.log('🔍 Consultando salud por parroquia:', idParroquia);
      
      // Primero verificar que la parroquia existe
      const parroquiaQuery = `
        SELECT nombre FROM parroquia WHERE id_parroquia = :idParroquia
      `;
      
      const [parroquia] = await sequelize.query(parroquiaQuery, {
        replacements: { idParroquia },
        type: QueryTypes.SELECT
      });
      
      if (!parroquia) {
        return {
          resumen: {
            total_personas: 0,
            con_enfermedades: 0,
            sin_enfermedades: 0,
            edad_promedio: 0,
            nombre_parroquia: null,
            id_parroquia: parseInt(idParroquia),
            mensaje: `No existe parroquia con ID ${idParroquia}`
          },
          personas: []
        };
      }
      
      // Obtener estadísticas de salud
      const estadisticasQuery = `
        SELECT 
          COUNT(*) as total_personas,
          COUNT(CASE WHEN p.necesidad_enfermo IS NOT NULL AND p.necesidad_enfermo != '' THEN 1 END) as con_enfermedades,
          COUNT(CASE WHEN p.necesidad_enfermo IS NULL OR p.necesidad_enfermo = '' THEN 1 END) as sin_enfermedades,
          ROUND(AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento))), 2) as edad_promedio
        FROM personas p
        WHERE p.id_parroquia = :idParroquia
      `;
      
      const [estadisticas] = await sequelize.query(estadisticasQuery, {
        replacements: { idParroquia },
        type: QueryTypes.SELECT
      });
      
      // Obtener detalle de cada persona con su información de salud
      const personasQuery = `
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
          s.nombre as sexo,
          f.sector as sector_familia,
          f.telefono as telefono_familia,
          f.direccion_familia,
          m.nombre_municipio,
          sec.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          pr.nombre as nombre_parroquia
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        WHERE p.id_parroquia = :idParroquia
        ORDER BY p.primer_apellido, p.primer_nombre
      `;
      
      const personas = await sequelize.query(personasQuery, {
        replacements: { idParroquia },
        type: QueryTypes.SELECT
      });
      
      // Estructurar información de cada persona
      const personasConSalud = personas.map(persona => ({
        id: persona.id_personas,
        documento: persona.documento,
        nombre: persona.nombre_completo,
        edad: parseInt(persona.edad),
        sexo: persona.sexo,
        telefono: persona.telefono,
        fecha_nacimiento: persona.fecha_nacimiento,
        familia: {
          telefono: persona.telefono_familia,
          direccion: persona.direccion_familia,
          sector: persona.nombre_sector || persona.sector_familia
        },
        ubicacion: {
          municipio: persona.nombre_municipio,
          sector: persona.nombre_sector || persona.sector_familia,
          vereda: persona.nombre_vereda,
          parroquia: persona.nombre_parroquia
        },
        salud: {
          tiene_enfermedades: persona.tiene_enfermedades,
          enfermedades: persona.necesidad_enfermo ? 
            persona.necesidad_enfermo.split(',').map(e => e.trim()) : [],
          necesidades_medicas: persona.necesidad_enfermo
        }
      }));
      
      console.log('✅ Consulta de salud por parroquia exitosa:', {
        parroquia: parroquia.nombre,
        total_personas: personasConSalud.length
      });
      
      return {
        resumen: {
          nombre_parroquia: parroquia.nombre,
          id_parroquia: parseInt(idParroquia),
          total_personas: parseInt(estadisticas.total_personas) || 0,
          con_enfermedades: parseInt(estadisticas.con_enfermedades) || 0,
          sin_enfermedades: parseInt(estadisticas.sin_enfermedades) || 0,
          edad_promedio: parseFloat(estadisticas.edad_promedio) || 0
        },
        personas: personasConSalud
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo resumen por parroquia:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de salud en formato Excel
   */
  async generarReporteExcel(filtros = {}) {
    try {
      console.log('📊 Generando reporte Excel de salud...');

      // Obtener los datos usando el método existente
      const resultado = await this.consultarSalud(filtros);
      const personas = resultado.datos;

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte Salud');

      // Definir columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Nombre Completo', key: 'nombre', width: 35 },
        { header: 'Edad', key: 'edad', width: 8 },
        { header: 'Sexo', key: 'sexo', width: 12 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 18 },
        { header: 'Familia', key: 'apellido_familiar', width: 25 },
        { header: 'Municipio', key: 'municipio', width: 20 },
        { header: 'Sector', key: 'sector', width: 20 },
        { header: 'Vereda', key: 'vereda', width: 25 },
        { header: 'Corregimiento', key: 'corregimiento', width: 25 },
        { header: 'Centro Poblado', key: 'centro_poblado', width: 25 },
        { header: 'Parroquia', key: 'parroquia', width: 25 },
        { header: 'Dirección', key: 'direccion', width: 30 },
        { header: 'Teléfono Familia', key: 'telefono_familia', width: 15 },
        { header: 'Enfermedades', key: 'enfermedades', width: 40 },
        { header: 'Necesidades Médicas', key: 'necesidades_medicas', width: 40 },
        { header: 'Tiene Enfermedades', key: 'tiene_enfermedades', width: 18 }
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
      personas.forEach((persona, index) => {
        const row = worksheet.addRow({
          id: persona.id,
          documento: persona.documento || '',
          nombre: persona.nombre || '',
          edad: persona.edad || '',
          sexo: persona.sexo || '',
          telefono: persona.telefono || '',
          fecha_nacimiento: persona.fecha_nacimiento || '',
          apellido_familiar: persona.apellido_familiar || '',
          municipio: persona.municipio || '',
          sector: persona.sector || '',
          vereda: persona.vereda || '',
          corregimiento: persona.corregimiento || '',
          centro_poblado: persona.centro_poblado || '',
          parroquia: persona.parroquia || '',
          direccion: persona.direccion || '',
          telefono_familia: persona.telefono_familia || '',
          enfermedades: persona.salud.enfermedades || '',
          necesidades_medicas: persona.salud.necesidades_medicas || '',
          tiene_enfermedades: persona.salud.tiene_enfermedades ? 'Sí' : 'No'
        });

        // Estilo zebra (filas alternadas)
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

      // Agregar autofiltro (ahora son 19 columnas)
      worksheet.autoFilter = {
        from: 'A1',
        to: `S1`
      };

      // Congelar primera fila
      worksheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];

      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();

      console.log(`✅ Reporte Excel generado: ${personas.length} personas`);

      return buffer;

    } catch (error) {
      console.error('❌ Error generando reporte Excel:', error);
      throw error;
    }
  }
}

export default new SaludConsolidadoService();
