import sequelize from '../../../config/sequelize.js';
import { QueryTypes } from 'sequelize';
import ExcelJS from 'exceljs';

/**
 * Servicio consolidado para consulta avanzada de personas
 * Soporta 28 filtros combinables y exportación a Excel
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
            SELECT 1 FROM destrezas_personas dp
            WHERE dp.id_persona = p.id_personas
            AND dp.id_destreza = :id_destreza
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

      // CONSULTA PRINCIPAL
      const query = `
        SELECT
          p.id_personas,
          CONCAT(
            p.primer_nombre,
            CASE WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre ELSE '' END,
            ' ', p.primer_apellido,
            CASE WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido ELSE '' END
          ) as nombre_completo,
          p.identificacion as documento,
          ti.nombre as tipo_identificacion,
          EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) as edad,
          p.fecha_nacimiento,
          sx.nombre as sexo,
          p.telefono,
          p.correo_electronico,
          p.direccion as direccion_personal,
          
          -- Ubicación
          m.nombre_municipio as municipio,
          pr.nombre as parroquia,
          sec.nombre as sector,
          v.nombre as vereda,
          f.direccion_familia,
          
          -- Familia
          f.apellido_familiar,
          par.nombre as parentesco,
          f.telefono as telefono_familia,
          f.fecha_encuesta as fecha_registro,
          
          -- Vivienda
          tv.nombre as tipo_vivienda,
          f.pozo_septico,
          f.letrina,
          f.campo_abierto,
          f.disposicion_recolector as basura_recolector,
          f.disposicion_quemada as basura_quemada,
          f.disposicion_enterrada as basura_enterrada,
          f.disposicion_recicla as basura_recicla,
          f.disposicion_aire_libre as basura_aire_libre,
          
          -- Datos personales
          ec.nombre as estado_civil,
          prof.nombre as profesion,
          p.estudios,
          cc.nombre as comunidad_cultural,
          p.en_que_eres_lider as liderazgo,
          
          -- Tallas
          p.talla_camisa,
          p.talla_pantalon,
          p.talla_zapato,
          
          -- Salud
          p.necesidad_enfermo,
          
          -- Celebraciones
          p.motivo_celebrar,
          p.dia_celebrar,
          p.mes_celebrar
          
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        LEFT JOIN parroquia pr ON f.id_parroquia = pr.id_parroquia
        LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
        LEFT JOIN situaciones_civiles ec ON p.id_estado_civil_estado_civil = ec.id_situacion_civil
        LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
        LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
        LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
        LEFT JOIN tipos_identificacion ti ON p.id_tipo_identificacion_tipo_identificacion = ti.id_tipo_identificacion
        ${whereClause}
        ORDER BY p.primer_apellido, p.primer_nombre
        LIMIT :limit OFFSET :offset
      `;

      // CONSULTA DE TOTAL
      const countQuery = `
        SELECT COUNT(p.id_personas) as total
        FROM personas p
        LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN sexos sx ON p.id_sexo = sx.id_sexo
        LEFT JOIN parroquia pr ON f.id_parroquia = pr.id_parroquia
        LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
        LEFT JOIN situaciones_civiles ec ON p.id_estado_civil_estado_civil = ec.id_situacion_civil
        LEFT JOIN profesiones prof ON p.id_profesion = prof.id_profesion
        LEFT JOIN comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural
        LEFT JOIN tipos_vivienda tv ON f.id_tipo_vivienda = tv.id_tipo_vivienda
        ${whereClause}
      `;

      console.log('📋 Ejecutando consulta con parámetros:', params);

      const personas = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const [countResult] = await sequelize.query(countQuery, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // Obtener destrezas para todas las personas (solo para mostrar, el filtro ya se aplicó en WHERE)
      for (let persona of personas) {
        const personaDestrezas = await sequelize.query(`
          SELECT d.nombre
          FROM persona_destreza pd
          INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
          WHERE pd.id_personas_personas = :id_persona
        `, {
          replacements: { id_persona: persona.id_personas },
          type: QueryTypes.SELECT
        });

        persona.destrezas = personaDestrezas.map(d => d.nombre);
      }

      console.log(`✅ Consulta exitosa: ${personas.length} personas encontradas de ${countResult.total} totales`);

      return {
        total: parseInt(countResult.total),
        page: parseInt(page),
        limit: parseInt(limit),
        data: personas
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
        { header: 'ID', key: 'id_personas', width: 8 },
        { header: 'Documento', key: 'documento', width: 15 },
        { header: 'Tipo ID', key: 'tipo_identificacion', width: 15 },
        { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
        { header: 'Edad', key: 'edad', width: 8 },
        { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 15 },
        { header: 'Sexo', key: 'sexo', width: 12 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Email', key: 'correo_electronico', width: 30 },
        { header: 'Dirección Personal', key: 'direccion_personal', width: 30 },
        { header: 'Municipio', key: 'municipio', width: 20 },
        { header: 'Parroquia', key: 'parroquia', width: 25 },
        { header: 'Sector', key: 'sector', width: 20 },
        { header: 'Vereda', key: 'vereda', width: 25 },
        { header: 'Dirección Familia', key: 'direccion_familia', width: 30 },
        { header: 'Apellido Familiar', key: 'apellido_familiar', width: 25 },
        { header: 'Parentesco', key: 'parentesco', width: 15 },
        { header: 'Teléfono Familia', key: 'telefono_familia', width: 15 },
        { header: 'Tipo Vivienda', key: 'tipo_vivienda', width: 20 },
        { header: 'Estado Civil', key: 'estado_civil', width: 15 },
        { header: 'Profesión', key: 'profesion', width: 25 },
        { header: 'Estudios', key: 'estudios', width: 25 },
        { header: 'Comunidad Cultural', key: 'comunidad_cultural', width: 25 },
        { header: 'Liderazgo', key: 'liderazgo', width: 30 },
        { header: 'Destrezas', key: 'destrezas', width: 40 },
        { header: 'Talla Camisa', key: 'talla_camisa', width: 12 },
        { header: 'Talla Pantalón', key: 'talla_pantalon', width: 12 },
        { header: 'Talla Zapato', key: 'talla_zapato', width: 12 },
        { header: 'Necesidades Salud', key: 'necesidad_enfermo', width: 40 },
        { header: 'Motivo Celebrar', key: 'motivo_celebrar', width: 20 },
        { header: 'Día Celebrar', key: 'dia_celebrar', width: 12 },
        { header: 'Mes Celebrar', key: 'mes_celebrar', width: 12 },
        { header: 'Fecha Registro', key: 'fecha_registro', width: 15 }
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
          ...persona,
          destrezas: Array.isArray(persona.destrezas) ? persona.destrezas.join(', ') : ''
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
        to: `AC1`
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
