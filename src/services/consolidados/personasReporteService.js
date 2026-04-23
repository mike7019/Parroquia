import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import ExcelJS from 'exceljs';

class PersonasReporteService {
  /**
   * Generar reporte de personas con filtros avanzados
   */
  async generarReporte(filtros = {}) {
    try {
      console.log('🔍 Generando reporte de personas con filtros:', filtros);
      
      let whereConditions = [];
      let params = {};
      
      // Filtro por ID de persona específica
      if (filtros.id_persona) {
        whereConditions.push('p.id_personas = :id_persona');
        params.id_persona = filtros.id_persona;
      }
      
      // Filtros geográficos
      if (filtros.id_municipio) {
        whereConditions.push('f.id_municipio = :id_municipio');
        params.id_municipio = filtros.id_municipio;
      }
      
      if (filtros.id_sector) {
        whereConditions.push('f.id_sector = :id_sector');
        params.id_sector = filtros.id_sector;
      }
      
      if (filtros.id_vereda) {
        whereConditions.push('f.id_vereda = :id_vereda');
        params.id_vereda = filtros.id_vereda;
      }
      
      if (filtros.id_corregimiento) {
        whereConditions.push('f.id_corregimiento = :id_corregimiento');
        params.id_corregimiento = filtros.id_corregimiento;
      }
      
      if (filtros.id_centro_poblado) {
        whereConditions.push('f.id_centro_poblado = :id_centro_poblado');
        params.id_centro_poblado = filtros.id_centro_poblado;
      }
      
      if (filtros.id_parroquia) {
        whereConditions.push('p.id_parroquia = :id_parroquia');
        params.id_parroquia = filtros.id_parroquia;
      }
      
      // Filtros de tallas
      if (filtros.talla_camisa) {
        whereConditions.push('p.talla_camisa = :talla_camisa');
        params.talla_camisa = filtros.talla_camisa;
      }
      
      if (filtros.talla_pantalon) {
        whereConditions.push('p.talla_pantalon = :talla_pantalon');
        params.talla_pantalon = filtros.talla_pantalon;
      }
      
      if (filtros.talla_zapatos) {
        whereConditions.push('p.talla_zapato = :talla_zapatos');
        params.talla_zapatos = filtros.talla_zapatos;
      }
      
      // Filtro por profesión
      if (filtros.id_profesion) {
        whereConditions.push('p.id_profesion = :id_profesion');
        params.id_profesion = filtros.id_profesion;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const limite = filtros.limite || 1000;
      params.limite = limite;
      
      // Consulta principal de personas
      const query = `
        SELECT 
          p.id_personas,
          p.identificacion,
          TRIM(CONCAT(
            COALESCE(p.primer_nombre, ''), ' ',
            COALESCE(p.segundo_nombre, ''), ' ',
            COALESCE(p.primer_apellido, ''), ' ',
            COALESCE(p.segundo_apellido, '')
          )) as nombre_completo,
          p.primer_nombre,
          p.segundo_nombre,
          p.primer_apellido,
          p.segundo_apellido,
          p.fecha_nacimiento,
          COALESCE(EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.fecha_nacimiento)), 0) as edad,
          p.telefono,
          p.correo_electronico as email,
          p.direccion,
          
          -- Información de sexo
          s.id_sexo,
          s.nombre as sexo,
          
          -- Información de familia
          f.id_familia,
          f.apellido_familiar,
          f.direccion_familia,
          f.telefono as telefono_familia,
          
          -- Información geográfica
          m.id_municipio,
          m.nombre_municipio,
          sec.id_sector,
          sec.nombre as nombre_sector,
          v.id_vereda,
          v.nombre as nombre_vereda,
          corr.id_corregimiento,
          corr.nombre as nombre_corregimiento,
          cp.id_centro_poblado,
          cp.nombre as nombre_centro_poblado,
          pr.id_parroquia,
          pr.nombre as nombre_parroquia,
          
          -- Tallas
          p.talla_camisa,
          p.talla_pantalon,
          p.talla_zapato as talla_zapatos,
          
          -- Profesión
          prof.id_profesion,
          prof.nombre as profesion,
          
          -- Información adicional
          p.estudios,
          p.necesidad_enfermo,
          p.en_que_eres_lider,
          
          -- Estado civil
          ec.descripcion as estado_civil,
          
          -- Tipo de identificación
          ti.descripcion as tipo_identificacion
          
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
        LEFT JOIN estados_civiles ec ON p.id_estado_civil_estado_civil = ec.id_estado
        LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        ${whereClause}
        ORDER BY p.primer_apellido, p.segundo_apellido, p.primer_nombre
        LIMIT :limite
      `;
      
      console.log('📋 Ejecutando consulta de personas:', query);
      
      const personas = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      console.log(`✅ Encontradas ${personas.length} personas`);
      
      // Obtener capacidades/destrezas para cada persona
      const personasConCapacidades = await Promise.all(personas.map(async (persona) => {
        // Obtener destrezas
        let destrezas = [];
        if (filtros.id_destreza) {
          // Si se filtra por destreza específica, verificar si la persona la tiene
          const [tieneDestreza] = await sequelize.query(`
            SELECT COUNT(*) as tiene
            FROM persona_destreza pd
            WHERE pd.id_personas_personas = :id_persona
              AND pd.id_destrezas_destrezas = :id_destreza
          `, {
            replacements: {
              id_persona: persona.id_personas,
              id_destreza: filtros.id_destreza
            },
            type: QueryTypes.SELECT
          });
          
          if (tieneDestreza.tiene > 0) {
            destrezas = await sequelize.query(`
              SELECT d.id_destreza, d.nombre
              FROM persona_destreza pd
              INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
              WHERE pd.id_personas_personas = :id_persona
            `, {
              replacements: { id_persona: persona.id_personas },
              type: QueryTypes.SELECT
            });
          } else {
            return null; // Excluir persona si no tiene la destreza filtrada
          }
        } else {
          // Sin filtro, obtener todas las destrezas
          destrezas = await sequelize.query(`
            SELECT d.id_destreza, d.nombre
            FROM persona_destreza pd
            INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
            WHERE pd.id_personas_personas = :id_persona
          `, {
            replacements: { id_persona: persona.id_personas },
            type: QueryTypes.SELECT
          });
        }
        
        // Obtener habilidades
        const habilidades = await sequelize.query(`
          SELECT h.id_habilidad, h.nombre
          FROM persona_habilidad ph
          INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
          WHERE ph.id_persona = :id_persona
        `, {
          replacements: { id_persona: persona.id_personas },
          type: QueryTypes.SELECT
        });
        
        // Obtener enfermedades
        const enfermedades = await sequelize.query(`
          SELECT e.id_enfermedad, e.nombre
          FROM persona_enfermedad pe
          INNER JOIN enfermedades e ON pe.id_enfermedad = e.id_enfermedad
          WHERE pe.id_persona = :id_persona AND pe.activo = true
        `, {
          replacements: { id_persona: persona.id_personas },
          type: QueryTypes.SELECT
        });
        
        // Obtener celebraciones
        const celebraciones = await sequelize.query(`
          SELECT pc.motivo, pc.dia, pc.mes
          FROM persona_celebracion pc
          WHERE pc.id_persona = :id_persona
        `, {
          replacements: { id_persona: persona.id_personas },
          type: QueryTypes.SELECT
        });
        
        return {
          id_personas: persona.id_personas,
          identificacion: persona.identificacion,
          nombre_completo: persona.nombre_completo,
          primer_nombre: persona.primer_nombre,
          segundo_nombre: persona.segundo_nombre,
          primer_apellido: persona.primer_apellido,
          segundo_apellido: persona.segundo_apellido,
          fecha_nacimiento: persona.fecha_nacimiento,
          edad: persona.edad || 0,
          telefono: persona.telefono,
          email: persona.email,
          direccion: persona.direccion,
          sexo: persona.sexo,
          familia_apellido: persona.apellido_familiar,
          municipio: persona.nombre_municipio,
          sector: persona.nombre_sector,
          vereda: persona.nombre_vereda,
          corregimiento: persona.nombre_corregimiento,
          centro_poblado: persona.nombre_centro_poblado,
          parroquia: persona.nombre_parroquia,
          talla_camisa: persona.talla_camisa,
          talla_pantalon: persona.talla_pantalon,
          talla_zapatos: persona.talla_zapatos,
          profesion: persona.profesion,
          estudios: persona.estudios,
          necesidad_enfermo: persona.necesidad_enfermo,
          liderazgo: persona.en_que_eres_lider || 'No especificado',
          estado_civil: persona.estado_civil,
          tipo_identificacion: persona.tipo_identificacion,
          destrezas: destrezas,
          destrezas_texto: destrezas.length > 0 ? destrezas.map(d => d.nombre).join(', ') : 'Ninguna',
          total_destrezas: destrezas.length,
          habilidades: habilidades,
          habilidades_texto: habilidades.length > 0 ? habilidades.map(h => h.nombre).join(', ') : 'Ninguna',
          total_habilidades: habilidades.length,
          celebraciones: celebraciones,
          celebraciones_texto: celebraciones.length > 0 ? celebraciones.map(c => `${c.motivo} (${c.dia}/${c.mes})`).join(', ') : 'Ninguna',
          enfermedades: enfermedades,
          enfermedades_texto: enfermedades.length > 0 ? enfermedades.map(e => e.nombre).join(', ') : 'Ninguna',
          total_enfermedades: enfermedades.length
        };
      }));
      
      // Filtrar personas que no cumplen con el filtro de destrezas
      const personasFiltradas = personasConCapacidades.filter(p => p !== null);
      
      // Obtener total sin límite
      const countQuery = `
        SELECT COUNT(DISTINCT p.id_personas) as total
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN sexos s ON p.id_sexo = s.id_sexo
        LEFT JOIN parroquia pr ON p.id_parroquia = pr.id_parroquia
        LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
        ${whereClause}
      `;
      
      const [countResult] = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });
      
      return {
        datos: personasFiltradas,
        total: parseInt(countResult.total),
        filtros_aplicados: filtros,
        total_retornado: personasFiltradas.length
      };
      
    } catch (error) {
      console.error('❌ Error generando reporte de personas:', error);
      throw error;
    }
  }

  /**
   * Generar reporte en formato Excel - UNA SOLA HOJA CON TODA LA INFORMACIÓN
   */
  async generarReporteExcel(filtros = {}) {
    try {
      console.log('📊 Generando reporte Excel de personas...');
      
      // Obtener datos del reporte
      const reporte = await this.generarReporte(filtros);
      
      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema Parroquial';
      workbook.created = new Date();
      
      // ÚNICA HOJA: Reporte Completo de Personas
      const sheet = workbook.addWorksheet('Reporte Completo Personas');
      
      // Definir todas las columnas en una sola hoja
      sheet.columns = [
        // Información Personal
        { header: 'ID', key: 'id_personas', width: 10 },
        { header: 'Identificación', key: 'identificacion', width: 15 },
        { header: 'Tipo ID', key: 'tipo_identificacion', width: 15 },
        { header: 'Nombre Completo', key: 'nombre_completo', width: 40 },
        { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 15 },
        { header: 'Edad', key: 'edad', width: 10 },
        { header: 'Sexo', key: 'sexo', width: 15 },
        { header: 'Estado Civil', key: 'estado_civil', width: 15 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Dirección', key: 'direccion', width: 40 },
        
        // Información Geográfica
        { header: 'Municipio', key: 'municipio', width: 25 },
        { header: 'Sector', key: 'sector', width: 25 },
        { header: 'Vereda', key: 'vereda', width: 25 },
        { header: 'Corregimiento', key: 'corregimiento', width: 25 },
        { header: 'Centro Poblado', key: 'centro_poblado', width: 25 },
        { header: 'Parroquia', key: 'parroquia', width: 30 },
        { header: 'Familia', key: 'familia_apellido', width: 30 },
        
        // Capacidades y Profesión
        { header: 'Profesión', key: 'profesion', width: 30 },
        { header: 'Estudios', key: 'estudios', width: 30 },
        { header: 'Liderazgo', key: 'liderazgo', width: 40 },
        
        // Destrezas
        { header: 'Destrezas', key: 'destrezas_texto', width: 50 },
        { header: 'Cant. Destrezas', key: 'total_destrezas', width: 15 },
        
        // Habilidades
        { header: 'Habilidades', key: 'habilidades_texto', width: 50 },
        { header: 'Cant. Habilidades', key: 'total_habilidades', width: 15 },
        
        // Tallas
        { header: 'Talla Camisa', key: 'talla_camisa', width: 12 },
        { header: 'Talla Pantalón', key: 'talla_pantalon', width: 12 },
        { header: 'Talla Zapato', key: 'talla_zapatos', width: 12 },
        
        // Salud y Celebraciones
        { header: 'Celebraciones', key: 'celebraciones_texto', width: 40 },
        { header: 'Enfermedades', key: 'enfermedades_texto', width: 50 },
        { header: 'Cant. Enfermedades', key: 'total_enfermedades', width: 15 },
        { header: 'Necesidades de Salud', key: 'necesidad_enfermo', width: 40 }
      ];
      
      // Estilo del encabezado - Azul profesional
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.getRow(1).height = 20;
      
      // Agregar los datos (mapeo explícito para asegurar que todas las columnas se llenen)
      reporte.datos.forEach(p => {
        sheet.addRow({
          id_personas: p.id_personas,
          identificacion: p.identificacion,
          tipo_identificacion: p.tipo_identificacion,
          nombre_completo: p.nombre_completo,
          fecha_nacimiento: p.fecha_nacimiento,
          edad: p.edad,
          sexo: p.sexo,
          estado_civil: p.estado_civil,
          telefono: p.telefono,
          email: p.email,
          direccion: p.direccion,
          municipio: p.municipio,
          sector: p.sector,
          vereda: p.vereda,
          corregimiento: p.corregimiento,
          centro_poblado: p.centro_poblado,
          parroquia: p.parroquia,
          familia_apellido: p.familia_apellido,
          profesion: p.profesion,
          estudios: p.estudios,
          liderazgo: p.liderazgo,
          destrezas_texto: p.destrezas_texto,
          total_destrezas: p.total_destrezas,
          habilidades_texto: p.habilidades_texto,
          total_habilidades: p.total_habilidades,
          talla_camisa: p.talla_camisa,
          talla_pantalon: p.talla_pantalon,
          talla_zapatos: p.talla_zapatos,
          celebraciones_texto: p.celebraciones_texto,
          enfermedades_texto: p.enfermedades_texto,
          total_enfermedades: p.total_enfermedades,
          necesidad_enfermo: p.necesidad_enfermo
        });
      });
      
      // Aplicar formato alternado a las filas (zebra striping)
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Saltar el encabezado
          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' }
            };
          }
        }
      });
      
      // Aplicar bordes a todas las celdas
      sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
            right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
          };
        });
      });
      
      // Aplicar autofiltro
      sheet.autoFilter = {
        from: 'A1',
        to: `AF1` // 32 columnas
      };
      
      // Congelar primera fila
      sheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1 }
      ];
      
      console.log(`✅ Excel generado con ${reporte.datos.length} personas en una sola hoja`);
      
      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      console.log('✅ Reporte Excel generado exitosamente');
      
      return buffer;
      
    } catch (error) {
      console.error('❌ Error generando reporte Excel:', error);
      throw error;
    }
  }
}

export default new PersonasReporteService();
