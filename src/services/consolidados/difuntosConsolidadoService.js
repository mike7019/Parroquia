import { DifuntosFamilia, Familias, Municipios, Veredas, Sector } from '../../models/index.js';
import { Op, QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

class DifuntosConsolidadoService {
  /**
   * Consulta consolidada de difuntos con filtros múltiples
   * Consulta tanto difuntos_familia como personas fallecidas
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} filtros.id_parroquia - ID de la parroquia
   * @param {number} filtros.id_municipio - ID del municipio
   * @param {number} filtros.id_sector - ID del sector
   * @param {number} filtros.id_parentesco - ID del parentesco
   * @param {string} filtros.fecha_inicio - Fecha de inicio del rango (YYYY-MM-DD)
   * @param {string} filtros.fecha_fin - Fecha de fin del rango (YYYY-MM-DD)
   */
  async consultarDifuntos(filtros = {}) {
    try {
      console.log('🔍 Iniciando consulta consolidada de difuntos...', filtros);
      
      // Construir condiciones WHERE para filtros por ID
      const whereConditions = [];
      const replacements = {};
      
      if (filtros.id_parroquia) {
        whereConditions.push('p.id_parroquia = :id_parroquia');
        replacements.id_parroquia = filtros.id_parroquia;
      }
      
      if (filtros.id_municipio) {
        whereConditions.push('m.id_municipio = :id_municipio');
        replacements.id_municipio = filtros.id_municipio;
      }
      
      if (filtros.id_sector) {
        whereConditions.push('s.id_sector = :id_sector');
        replacements.id_sector = filtros.id_sector;
      }
      
      if (filtros.id_parentesco) {
        whereConditions.push('df.id_parentesco = :id_parentesco');
        replacements.id_parentesco = filtros.id_parentesco;
      }
      
      // Filtro de rango de fechas
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditions.push('df.fecha_fallecimiento BETWEEN :fecha_inicio AND :fecha_fin');
        replacements.fecha_inicio = filtros.fecha_inicio;
        replacements.fecha_fin = filtros.fecha_fin;
      } else if (filtros.fecha_inicio) {
        whereConditions.push('df.fecha_fallecimiento >= :fecha_inicio');
        replacements.fecha_inicio = filtros.fecha_inicio;
      } else if (filtros.fecha_fin) {
        whereConditions.push('df.fecha_fallecimiento <= :fecha_fin');
        replacements.fecha_fin = filtros.fecha_fin;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // PASO 1: Consultar difuntos de la tabla difuntos_familia
      const difuntosFamilia = await sequelize.query(`
        SELECT 
          'difuntos_familia' as fuente,
          df.id_difunto::text as id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.sector,
          f.telefono,
          f.direccion_familia,
          m.id_municipio,
          m.nombre_municipio,
          s.id_sector,
          s.nombre as nombre_sector,
          v.id_vereda,
          v.nombre as nombre_vereda,
          p.id_parroquia,
          p.nombre as nombre_parroquia,
          corr.nombre as corregimiento_nombre,
          cp.nombre as centro_poblado_nombre,
          -- Usar el parentesco real de la tabla parentescos
          COALESCE(par.nombre, 'Familiar') as parentesco_real,
          df.id_parentesco
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        ${whereClause}
      `, { 
        type: QueryTypes.SELECT,
        replacements 
      });

      console.log(`📊 Difuntos en tabla difuntos_familia: ${difuntosFamilia.length}`);

      // Construir condiciones WHERE para personas fallecidas (mismos filtros)
      const whereConditionsPersonas = ['pe.estudios IS NOT NULL', 
                                      'pe.estudios LIKE \'%es_fallecido%\'',
                                      'pe.estudios::json->>\'es_fallecido\' = \'true\''];
      
      if (filtros.id_parroquia) {
        whereConditionsPersonas.push('p.id_parroquia = :id_parroquia');
      }
      
      if (filtros.id_municipio) {
        whereConditionsPersonas.push('m.id_municipio = :id_municipio');
      }
      
      if (filtros.id_sector) {
        whereConditionsPersonas.push('s.id_sector = :id_sector');
      }
      
      if (filtros.id_parentesco) {
        whereConditionsPersonas.push('pe.id_parentesco = :id_parentesco');
      }
      
      // Filtro de rango de fechas para personas
      if (filtros.fecha_inicio && filtros.fecha_fin) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date BETWEEN :fecha_inicio AND :fecha_fin');
      } else if (filtros.fecha_inicio) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date >= :fecha_inicio');
      } else if (filtros.fecha_fin) {
        whereConditionsPersonas.push('(pe.estudios::json->>\'fecha_aniversario\')::date <= :fecha_fin');
      }
      
      const whereClausePersonas = `WHERE ${whereConditionsPersonas.join(' AND ')}`;

      // PASO 2: Consultar personas fallecidas
      const personasFallecidas = await sequelize.query(`
        SELECT 
          'personas' as fuente,
          pe.id_personas::text as id_difunto,
          TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
          (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
          pe.estudios::json->>'causa_fallecimiento' as observaciones,
          f.apellido_familiar,
          f.sector,
          f.telefono,
          f.direccion_familia,
          m.id_municipio,
          m.nombre_municipio,
          s.id_sector,
          s.nombre as nombre_sector,
          v.id_vereda,
          v.nombre as nombre_vereda,
          p.id_parroquia,
          p.nombre as nombre_parroquia,
          corr.nombre as corregimiento_nombre,
          cp.nombre as centro_poblado_nombre,
          -- Usar el parentesco real de la tabla parentescos para personas
          COALESCE(par.nombre, 'Familiar') as parentesco_real,
          pe.id_parentesco
        FROM personas pe
        LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN parentescos par ON pe.id_parentesco = par.id_parentesco
        ${whereClausePersonas}
      `, { 
        type: QueryTypes.SELECT,
        replacements 
      });

      console.log(`� Personas fallecidas en tabla personas: ${personasFallecidas.length}`);

      // PASO 3: Combinar resultados
      const todosLosDifuntos = [...difuntosFamilia, ...personasFallecidas];
      
      // Ordenar por fecha de aniversario descendente (más recientes primero)
      todosLosDifuntos.sort((a, b) => {
        if (!a.fecha_aniversario && !b.fecha_aniversario) return 0;
        if (!a.fecha_aniversario) return 1;
        if (!b.fecha_aniversario) return -1;
        return new Date(b.fecha_aniversario) - new Date(a.fecha_aniversario);
      });
      
      console.log('✅ Consulta consolidada de difuntos exitosa:', {
        difuntos_familia: difuntosFamilia.length,
        personas_fallecidas: personasFallecidas.length,
        total_encontrados: todosLosDifuntos.length,
        filtros_aplicados: {
          id_parroquia: filtros.id_parroquia || 'todos',
          id_municipio: filtros.id_municipio || 'todos',
          id_sector: filtros.id_sector || 'todos',
          id_parentesco: filtros.id_parentesco || 'todos',
          rango_fechas: filtros.fecha_inicio && filtros.fecha_fin ? 
            `${filtros.fecha_inicio} a ${filtros.fecha_fin}` : 'sin rango'
        }
      });
      
      return {
        exito: true,
        mensaje: `Consulta de difuntos completada exitosamente. ${todosLosDifuntos.length} registros encontrados.`,
        datos: todosLosDifuntos,
        total: todosLosDifuntos.length,
        estadisticas: {
          difuntos_familia: difuntosFamilia.length,
          personas_fallecidas: personasFallecidas.length,
          filtros_aplicados: filtros
        }
      };
      
    } catch (error) {
      console.error('❌ Error en consulta consolidada de difuntos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de difuntos por mes
   * Consulta ambas fuentes de datos
   */
  async obtenerEstadisticasPorMes() {
    try {
      const query = `
        WITH difuntos_consolidados AS (
          -- Difuntos de la tabla difuntos_familia
          SELECT fecha_fallecimiento as fecha_aniversario
          FROM difuntos_familia 
          WHERE fecha_fallecimiento IS NOT NULL
          
          UNION ALL
          
          -- Difuntos de la tabla personas
          SELECT (estudios::json->>'fecha_aniversario')::date as fecha_aniversario
          FROM personas 
          WHERE estudios IS NOT NULL 
            AND estudios::json->>'es_fallecido' = 'true'
            AND estudios::json->>'fecha_aniversario' IS NOT NULL
        )
        SELECT 
          EXTRACT(MONTH FROM fecha_aniversario) as mes,
          TO_CHAR(fecha_aniversario, 'Month') as nombre_mes,
          COUNT(*) as total_difuntos
        FROM difuntos_consolidados
        GROUP BY EXTRACT(MONTH FROM fecha_aniversario), TO_CHAR(fecha_aniversario, 'Month')
        ORDER BY mes
      `;
      
      const resultado = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por mes:', error);
      throw error;
    }
  }

  /**
   * Obtener difuntos próximos a cumplir aniversario
   * Consulta ambas fuentes de datos (difuntos_familia + personas)
   */
  async obtenerProximosAniversarios(diasAdelante = 30) {
    try {
      // Query consolidada para ambas fuentes de datos con cálculo de aniversarios próximos
      const query = `
        WITH aniversarios_consolidados AS (
          -- Aniversarios de la tabla difuntos_familia
          SELECT 
            'difuntos_familia' as fuente,
            df.id_difunto::text as id_difunto,
            df.nombre_completo,
            df.fecha_fallecimiento as fecha_aniversario,
            df.observaciones,
            f.apellido_familiar,
            f.telefono,
            f.direccion_familia,
            m.nombre_municipio,
            s.nombre as nombre_sector,
            v.nombre as nombre_vereda,
            p.nombre as nombre_parroquia,
            corr.nombre as corregimiento_nombre,
            cp.nombre as centro_poblado_nombre,
            COALESCE(par.nombre, 'Familiar') as parentesco_real,
            -- Calcular días hasta el próximo aniversario
            CASE 
              WHEN EXTRACT(DOY FROM df.fecha_fallecimiento) >= EXTRACT(DOY FROM CURRENT_DATE) 
              THEN EXTRACT(DOY FROM df.fecha_fallecimiento) - EXTRACT(DOY FROM CURRENT_DATE)
              ELSE (365 - EXTRACT(DOY FROM CURRENT_DATE)) + EXTRACT(DOY FROM df.fecha_fallecimiento)
            END as dias_hasta_aniversario
          FROM difuntos_familia df
          LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
          LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
          LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
          LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
          LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
          WHERE df.fecha_fallecimiento IS NOT NULL
          
          UNION ALL
          
          -- Aniversarios de la tabla personas fallecidas
          SELECT 
            'personas' as fuente,
            pe.id_personas::text as id_difunto,
            TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
            (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
            pe.estudios::json->>'causa_fallecimiento' as observaciones,
            f.apellido_familiar,
            f.telefono,
            f.direccion_familia,
            m.nombre_municipio,
            s.nombre as nombre_sector,
            v.nombre as nombre_vereda,
            p.nombre as nombre_parroquia,
            corr.nombre as corregimiento_nombre,
            cp.nombre as centro_poblado_nombre,
            COALESCE(par.nombre, 'Familiar') as parentesco_real,
            -- Calcular días hasta el próximo aniversario
            CASE 
              WHEN EXTRACT(DOY FROM (pe.estudios::json->>'fecha_aniversario')::date) >= EXTRACT(DOY FROM CURRENT_DATE) 
              THEN EXTRACT(DOY FROM (pe.estudios::json->>'fecha_aniversario')::date) - EXTRACT(DOY FROM CURRENT_DATE)
              ELSE (365 - EXTRACT(DOY FROM CURRENT_DATE)) + EXTRACT(DOY FROM (pe.estudios::json->>'fecha_aniversario')::date)
            END as dias_hasta_aniversario
          FROM personas pe
          LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
          LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
          LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
          LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
          LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
          LEFT JOIN parentescos par ON pe.id_parentesco = par.id_parentesco
          WHERE pe.estudios IS NOT NULL 
            AND pe.estudios::json->>'es_fallecido' = 'true'
            AND pe.estudios::json->>'fecha_aniversario' IS NOT NULL
        )
        SELECT *
        FROM aniversarios_consolidados
        WHERE dias_hasta_aniversario <= $1
        ORDER BY dias_hasta_aniversario ASC
        LIMIT 50
      `;
      
      const resultado = await sequelize.query(query, {
        bind: [diasAdelante],
        type: QueryTypes.SELECT
      });
      
      console.log(`✅ Próximos aniversarios (${diasAdelante} días): ${resultado.length} encontrados`);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo próximos aniversarios:', error);
      throw error;
    }
  }

  /**
   * Buscar difuntos por nombre
   * Consulta ambas fuentes de datos
   */
  async buscarPorNombre(nombreBusqueda, limite = 50) {
    try {
      // PASO 1: Buscar en difuntos_familia
      const difuntosFamilia = await sequelize.query(`
        SELECT 
          'difuntos_familia' as fuente,
          df.id_difunto::text as id_difunto,
          df.nombre_completo,
          df.fecha_fallecimiento as fecha_aniversario,
          df.observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          p.nombre as nombre_parroquia,
          COALESCE(par.nombre, 'Familiar') as parentesco_real
        FROM difuntos_familia df
        LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        WHERE df.nombre_completo ILIKE :nombreBusqueda
      `, {
        replacements: { nombreBusqueda: `%${nombreBusqueda}%` },
        type: QueryTypes.SELECT
      });

      // PASO 2: Buscar en personas fallecidas
      const personasFallecidas = await sequelize.query(`
        SELECT 
          'personas' as fuente,
          pe.id_personas::text as id_difunto,
          TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) as nombre_completo,
          (pe.estudios::json->>'fecha_aniversario')::date as fecha_aniversario,
          pe.estudios::json->>'causa_fallecimiento' as observaciones,
          f.apellido_familiar,
          f.telefono,
          f.direccion_familia,
          m.nombre_municipio,
          s.nombre as nombre_sector,
          v.nombre as nombre_vereda,
          p.nombre as nombre_parroquia,
          COALESCE(par.nombre, 'Familiar') as parentesco_real
        FROM personas pe
        LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
        LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
        LEFT JOIN sectores s ON f.id_sector = s.id_sector
        LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia
        LEFT JOIN parentescos par ON pe.id_parentesco = par.id_parentesco
        WHERE pe.estudios IS NOT NULL 
          AND pe.estudios LIKE '%es_fallecido%'
          AND pe.estudios::json->>'es_fallecido' = 'true'
          AND TRIM(CONCAT(pe.primer_nombre, ' ', COALESCE(pe.segundo_nombre, ''), ' ', COALESCE(pe.primer_apellido, ''), ' ', COALESCE(pe.segundo_apellido, ''))) ILIKE :nombreBusqueda
      `, {
        replacements: { nombreBusqueda: `%${nombreBusqueda}%` },
        type: QueryTypes.SELECT
      });

      // Combinar y limitar resultados
      const todosLosResultados = [...difuntosFamilia, ...personasFallecidas];
      
      // Ordenar por nombre y aplicar límite
      todosLosResultados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
      
      return todosLosResultados.slice(0, limite);
      
    } catch (error) {
      console.error('❌ Error buscando por nombre:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de difuntos por sector
   * Consulta ambas fuentes de datos
   */
  async obtenerResumenPorSector() {
    try {
      const query = `
        WITH difuntos_consolidados AS (
          -- Difuntos de la tabla difuntos_familia
          SELECT 
            df.id_difunto,
            f.id_familia,
            s.nombre as nombre_sector
          FROM difuntos_familia df
          LEFT JOIN familias f ON df.id_familia_familias = f.id_familia
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          
          UNION ALL
          
          -- Difuntos de la tabla personas
          SELECT 
            pe.id_personas,
            f.id_familia,
            s.nombre as nombre_sector
          FROM personas pe
          LEFT JOIN familias f ON pe.id_familia_familias = f.id_familia
          LEFT JOIN sectores s ON f.id_sector = s.id_sector
          WHERE pe.estudios IS NOT NULL 
            AND pe.estudios::json->>'es_fallecido' = 'true'
        )
        SELECT 
          COALESCE(nombre_sector, 'Sin sector') as sector,
          COUNT(id_difunto) as total_difuntos,
          COUNT(DISTINCT id_familia) as familias_con_difuntos
        FROM difuntos_consolidados
        GROUP BY nombre_sector
        ORDER BY total_difuntos DESC
      `;
      
      const resultado = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });
      
      return resultado;
    } catch (error) {
      console.error('❌ Error obteniendo resumen por sector:', error);
      throw error;
    }
  }

  /**
   * NUEVO MÉTODO: Generar reporte Excel completo de difuntos
   * Con múltiples hojas profesionales
   */
  async generarReporteExcelDifuntos(filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Configuración del workbook
    workbook.creator = 'Sistema Parroquial - Difuntos';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.subject = 'Reporte Consolidado de Difuntos';
    
    try {
      console.log('📊 Generando reporte Excel de difuntos con filtros:', filtros);
      
      // 1. Obtener datos consolidados
      const datosDifuntos = await this.consultarDifuntos(filtros);
      const difuntos = datosDifuntos.datos || [];
      
      console.log(`📋 Procesando ${difuntos.length} difuntos para Excel`);
      
      // 2. HOJA 1: RESUMEN GENERAL
      await this.crearHojaResumenDifuntos(workbook, difuntos, datosDifuntos.estadisticas);
      
      // 3. HOJA 2: DETALLE COMPLETO
      await this.crearHojaDetalleDifuntos(workbook, difuntos);
      
      // 4. HOJA 3: ESTADÍSTICAS POR FUENTE
      await this.crearHojaEstadisticasFuente(workbook, difuntos);
      
      // 5. HOJA 4: ANÁLISIS POR PERÍODO
      await this.crearHojaAnalisisPeriodo(workbook, difuntos);
      
      // 6. HOJA 5: ANÁLISIS GEOGRÁFICO
      await this.crearHojaAnalisisGeografico(workbook, difuntos);
      
      console.log('✅ Excel de difuntos generado exitosamente');
      return workbook;
      
    } catch (error) {
      console.error('❌ Error generando Excel de difuntos:', error);
      throw new Error(`Error en generación de Excel: ${error.message}`);
    }
  }

  /**
   * HOJA 1: RESUMEN GENERAL DE DIFUNTOS
   */
  async crearHojaResumenDifuntos(workbook, difuntos, estadisticas) {
    const hoja = workbook.addWorksheet('Resumen General');
    
    // Configurar columnas
    hoja.columns = [
      { header: 'Fuente', key: 'fuente', width: 18 },
      { header: 'ID Difunto', key: 'id_difunto', width: 12 },
      { header: 'Nombre Completo', key: 'nombre_completo', width: 30 },
      { header: 'Parentesco', key: 'parentesco', width: 12 },
      { header: 'Fecha Aniversario', key: 'fecha_aniversario', width: 18 },
      { header: 'Apellido Familiar', key: 'apellido_familiar', width: 25 },
      { header: 'Parroquia', key: 'parroquia', width: 20 },
      { header: 'Municipio', key: 'municipio', width: 20 },
      { header: 'Sector', key: 'sector', width: 18 },
      { header: 'Vereda', key: 'vereda', width: 18 },
      { header: 'Corregimiento', key: 'corregimiento', width: 25 },
      { header: 'Centro Poblado', key: 'centro_poblado', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Dirección', key: 'direccion', width: 35 },
      { header: 'Observaciones', key: 'observaciones', width: 40 }
    ];
    
    // Agregar datos
    difuntos.forEach(difunto => {
      hoja.addRow({
        fuente: difunto.fuente === 'difuntos_familia' ? 'Registro Difuntos' : 'Registro Personas',
        id_difunto: difunto.id_difunto,
        nombre_completo: difunto.nombre_completo,
        parentesco: difunto.parentesco_real,
        fecha_aniversario: difunto.fecha_aniversario ? new Date(difunto.fecha_aniversario).toLocaleDateString() : 'No especificada',
        apellido_familiar: difunto.apellido_familiar,
        parroquia: difunto.nombre_parroquia,
        municipio: difunto.nombre_municipio,
        sector: difunto.nombre_sector,
        vereda: difunto.nombre_vereda,
        corregimiento: difunto.corregimiento_nombre,
        centro_poblado: difunto.centro_poblado_nombre,
        telefono: difunto.telefono,
        direccion: difunto.direccion_familia,
        observaciones: difunto.observaciones
      });
    });
    
    this.aplicarFormatoTablaDifuntos(hoja);
  }

  /**
   * HOJA 2: DETALLE COMPLETO POR DIFUNTO
   */
  async crearHojaDetalleDifuntos(workbook, difuntos) {
    const hoja = workbook.addWorksheet('Detalle Completo');
    
    hoja.columns = [
      { header: 'Tipo Registro', key: 'tipo_registro', width: 18 },
      { header: 'ID Sistema', key: 'id_sistema', width: 12 },
      { header: 'Nombre Completo', key: 'nombre', width: 35 },
      { header: 'Parentesco Inferido', key: 'parentesco', width: 18 },
      { header: 'Fecha Fallecimiento', key: 'fecha', width: 18 },
      { header: 'Año Fallecimiento', key: 'año', width: 15 },
      { header: 'Mes Fallecimiento', key: 'mes', width: 15 },
      { header: 'Familia', key: 'familia', width: 25 },
      { header: 'Ubicación Completa', key: 'ubicacion', width: 50 },
      { header: 'Contacto', key: 'contacto', width: 15 },
      { header: 'Observaciones Completas', key: 'observaciones_completas', width: 50 }
    ];
    
    // Agregar datos enriquecidos
    difuntos.forEach(difunto => {
      const fecha = difunto.fecha_aniversario ? new Date(difunto.fecha_aniversario) : null;
      const ubicacion = [
        difunto.nombre_parroquia,
        difunto.nombre_municipio,
        difunto.nombre_sector,
        difunto.nombre_vereda
      ].filter(Boolean).join(' - ');
      
      hoja.addRow({
        tipo_registro: difunto.fuente === 'difuntos_familia' ? 'Tabla Difuntos' : 'Personas Fallecidas',
        id_sistema: difunto.id_difunto,
        nombre: difunto.nombre_completo,
        parentesco: difunto.parentesco_real,
        fecha: fecha ? fecha.toLocaleDateString() : 'No especificada',
        año: fecha ? fecha.getFullYear() : 'N/A',
        mes: fecha ? fecha.toLocaleDateString('es-ES', { month: 'long' }) : 'N/A',
        familia: difunto.apellido_familiar,
        ubicacion: ubicacion,
        contacto: difunto.telefono,
        observaciones_completas: difunto.observaciones
      });
    });
    
    this.aplicarFormatoTablaDifuntos(hoja);
  }

  /**
   * HOJA 3: ESTADÍSTICAS POR FUENTE DE DATOS
   */
  async crearHojaEstadisticasFuente(workbook, difuntos) {
    const hoja = workbook.addWorksheet('Estadísticas por Fuente');
    
    // Calcular estadísticas por fuente
    const estadisticasFuente = {
      difuntos_familia: difuntos.filter(d => d.fuente === 'difuntos_familia'),
      personas: difuntos.filter(d => d.fuente === 'personas')
    };
    
    // Estadísticas por parentesco y fuente
    const estadisticasParentesco = {};
    Object.keys(estadisticasFuente).forEach(fuente => {
      estadisticasParentesco[fuente] = {};
      estadisticasFuente[fuente].forEach(difunto => {
        const parentesco = difunto.parentesco_real;
        estadisticasParentesco[fuente][parentesco] = (estadisticasParentesco[fuente][parentesco] || 0) + 1;
      });
    });
    
    // Crear tabla de resumen
    hoja.addRow(['RESUMEN POR FUENTE DE DATOS']);
    hoja.addRow([]);
    hoja.addRow(['Fuente', 'Total Difuntos', 'Porcentaje']);
    
    Object.keys(estadisticasFuente).forEach(fuente => {
      const total = estadisticasFuente[fuente].length;
      const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
      hoja.addRow([
        fuente === 'difuntos_familia' ? 'Tabla Difuntos Familia' : 'Personas Fallecidas',
        total,
        `${porcentaje}%`
      ]);
    });
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR PARENTESCO Y FUENTE']);
    hoja.addRow([]);
    hoja.addRow(['Parentesco', 'Tabla Difuntos', 'Personas Fallecidas', 'Total']);
    
    // Obtener todos los parentescos únicos
    const todosParentescos = [...new Set(difuntos.map(d => d.parentesco_real))];
    
    todosParentescos.forEach(parentesco => {
      const difuntosFamilia = estadisticasParentesco.difuntos_familia[parentesco] || 0;
      const personas = estadisticasParentesco.personas[parentesco] || 0;
      const total = difuntosFamilia + personas;
      
      hoja.addRow([parentesco, difuntosFamilia, personas, total]);
    });
    
    // Formato
    hoja.getRow(1).font = { bold: true, size: 14 };
    hoja.getRow(3).font = { bold: true };
    hoja.getRow(7).font = { bold: true, size: 14 };
    hoja.getRow(9).font = { bold: true };
    
    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 15;
    hoja.getColumn(3).width = 20;
    hoja.getColumn(4).width = 15;
  }

  /**
   * HOJA 4: ANÁLISIS POR PERÍODO
   */
  async crearHojaAnalisisPeriodo(workbook, difuntos) {
    const hoja = workbook.addWorksheet('Análisis por Período');
    
    // Agrupar por año y mes
    const analisisPeriodo = {};
    const analisisMes = {};
    
    difuntos.forEach(difunto => {
      if (difunto.fecha_aniversario) {
        const fecha = new Date(difunto.fecha_aniversario);
        const año = fecha.getFullYear();
        const mes = fecha.getMonth() + 1;
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });
        
        // Por año
        analisisPeriodo[año] = (analisisPeriodo[año] || 0) + 1;
        
        // Por mes (global)
        analisisMes[nombreMes] = (analisisMes[nombreMes] || 0) + 1;
      }
    });
    
    // Tabla por años
    hoja.addRow(['DISTRIBUCIÓN POR AÑO']);
    hoja.addRow([]);
    hoja.addRow(['Año', 'Total Difuntos', 'Porcentaje']);
    
    Object.keys(analisisPeriodo)
      .sort((a, b) => b - a) // Ordenar años descendente
      .forEach(año => {
        const total = analisisPeriodo[año];
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        hoja.addRow([año, total, `${porcentaje}%`]);
      });
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR MES (GLOBAL)']);
    hoja.addRow([]);
    hoja.addRow(['Mes', 'Total Difuntos', 'Porcentaje']);
    
    // Ordenar meses correctamente
    const mesesOrdenados = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    mesesOrdenados.forEach(mes => {
      if (analisisMes[mes]) {
        const total = analisisMes[mes];
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        hoja.addRow([mes.charAt(0).toUpperCase() + mes.slice(1), total, `${porcentaje}%`]);
      }
    });
    
    // Formato
    hoja.getRow(1).font = { bold: true, size: 14 };
    hoja.getRow(3).font = { bold: true };
    hoja.getRow(6 + Object.keys(analisisPeriodo).length).font = { bold: true, size: 14 };
    
    hoja.getColumn(1).width = 20;
    hoja.getColumn(2).width = 15;
    hoja.getColumn(3).width = 15;
  }

  /**
   * HOJA 5: ANÁLISIS GEOGRÁFICO
   */
  async crearHojaAnalisisGeografico(workbook, difuntos) {
    const hoja = workbook.addWorksheet('Análisis Geográfico');
    
    // Análisis por ubicación
    const porParroquia = {};
    const porMunicipio = {};
    const porSector = {};
    
    difuntos.forEach(difunto => {
      // Por parroquia
      const parroquia = difunto.nombre_parroquia || 'Sin parroquia';
      porParroquia[parroquia] = (porParroquia[parroquia] || 0) + 1;
      
      // Por municipio
      const municipio = difunto.nombre_municipio || 'Sin municipio';
      porMunicipio[municipio] = (porMunicipio[municipio] || 0) + 1;
      
      // Por sector
      const sector = difunto.nombre_sector || 'Sin sector';
      porSector[sector] = (porSector[sector] || 0) + 1;
    });
    
    // Tabla por parroquias
    hoja.addRow(['DISTRIBUCIÓN POR PARROQUIA']);
    hoja.addRow([]);
    hoja.addRow(['Parroquia', 'Total Difuntos', 'Porcentaje']);
    
    Object.entries(porParroquia)
      .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
      .forEach(([parroquia, total]) => {
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        hoja.addRow([parroquia, total, `${porcentaje}%`]);
      });
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR MUNICIPIO']);
    hoja.addRow([]);
    hoja.addRow(['Municipio', 'Total Difuntos', 'Porcentaje']);
    
    Object.entries(porMunicipio)
      .sort(([,a], [,b]) => b - a)
      .forEach(([municipio, total]) => {
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        hoja.addRow([municipio, total, `${porcentaje}%`]);
      });
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR SECTOR']);
    hoja.addRow([]);
    hoja.addRow(['Sector', 'Total Difuntos', 'Porcentaje']);
    
    Object.entries(porSector)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15) // Solo top 15 sectores
      .forEach(([sector, total]) => {
        const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
        hoja.addRow([sector, total, `${porcentaje}%`]);
      });
    
    // Formato
    hoja.getRow(1).font = { bold: true, size: 14 };
    hoja.getRow(3).font = { bold: true };
    
    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 15;
    hoja.getColumn(3).width = 15;
  }

  /**
   * FUNCIÓN AUXILIAR: Aplicar formato profesional a tablas de difuntos
   */
  aplicarFormatoTablaDifuntos(hoja) {
    // Formatear encabezados
    hoja.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '8B4513' } }; // Color marrón para difuntos
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Auto-ajustar altura de filas
    hoja.eachRow((row, rowNumber) => {
      row.height = rowNumber === 1 ? 25 : 20;
    });
    
    // Aplicar filtros automáticos si hay datos
    if (hoja.rowCount > 1) {
      hoja.autoFilter = {
        from: 'A1',
        to: hoja.lastColumn.letter + '1'
      };
    }
  }

  /**
   * Generar reporte PDF de difuntos con filtros avanzados
   */
  async generarReportePDFDifuntos(filtros = {}) {
    try {
      // Obtener datos de difuntos
      const difuntos = await this.consultarDifuntos(filtros);
      
      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      // Capturar el PDF en memoria
      doc.on('data', buffers.push.bind(buffers));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        
        doc.on('error', reject);
        
        // Generar contenido del PDF
        this.generarContenidoPDF(doc, difuntos.datos || [], filtros);
        
        // Finalizar documento
        doc.end();
      });
      
    } catch (error) {
      console.error('❌ Error generando reporte PDF:', error);
      throw error;
    }
  }

  /**
   * Generar contenido del PDF
   */
  generarContenidoPDF(doc, difuntos, filtros) {
    const fechaReporte = new Date().toLocaleDateString('es-ES');
    
    // Encabezado
    doc.fontSize(20)
       .fillColor('#8B4513')
       .text('Reporte de Difuntos - Parroquia', { align: 'center' });
    
    doc.fontSize(12)
       .fillColor('black')
       .text(`Fecha del reporte: ${fechaReporte}`, { align: 'right' })
       .moveDown();
    
    // Filtros aplicados
    if (Object.keys(filtros).length > 0) {
      doc.fontSize(14)
         .fillColor('#8B4513')
         .text('Filtros Aplicados:', { underline: true })
         .fontSize(10)
         .fillColor('black');
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) {
          doc.text(`• ${key.replace('_', ' ')}: ${value}`);
        }
      });
      doc.moveDown();
    }
    
    // Resumen estadístico
    doc.fontSize(14)
       .fillColor('#8B4513')
       .text('Resumen Estadístico', { underline: true })
       .fontSize(10)
       .fillColor('black');
    
    doc.text(`Total de difuntos: ${difuntos.length}`)
       .moveDown();
    
    // Análisis por parentesco
    const porParentesco = {};
    difuntos.forEach(difunto => {
      const parentesco = difunto.parentesco_real || 'Sin especificar';
      porParentesco[parentesco] = (porParentesco[parentesco] || 0) + 1;
    });
    
    doc.text('Distribución por parentesco:');
    Object.entries(porParentesco).forEach(([parentesco, total]) => {
      const porcentaje = ((total / difuntos.length) * 100).toFixed(1);
      doc.text(`  • ${parentesco}: ${total} (${porcentaje}%)`);
    });
    
    doc.moveDown();
    
    // Lista detallada (paginada)
    doc.fontSize(14)
       .fillColor('#8B4513')
       .text('Listado Detallado', { underline: true })
       .fontSize(9)
       .fillColor('black');
    
    let yPosition = doc.y;
    const pageHeight = doc.page.height - 100;
    
    difuntos.forEach((difunto, index) => {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 150) {
        doc.addPage();
        yPosition = 50;
      }
      
      // Información del difunto
      doc.fontSize(10)
         .fillColor('#8B4513')
         .text(`${index + 1}. ${difunto.nombre_completo || 'Sin nombre'}`, { continued: false })
         .fontSize(9)
         .fillColor('black');
      
      if (difunto.apellido_familiar) {
        doc.text(`   Familia: ${difunto.apellido_familiar}`);
      }
      
      if (difunto.fecha_aniversario) {
        doc.text(`   Fecha: ${new Date(difunto.fecha_aniversario).toLocaleDateString('es-ES')}`);
      }
      
      if (difunto.parentesco_real) {
        doc.text(`   Parentesco: ${difunto.parentesco_real}`);
      }
      
      if (difunto.municipio || difunto.nombre_sector) {
        doc.text(`   Ubicación: ${difunto.municipio || 'N/A'} - ${difunto.nombre_sector || 'N/A'}`);
      }
      
      doc.moveDown(0.5);
      yPosition = doc.y;
    });
    
    // Pie de página
    const totalPages = Math.ceil(difuntos.length / 20) + 1;
    doc.fontSize(8)
       .fillColor('gray')
       .text(`Reporte generado el ${fechaReporte} - Total de registros: ${difuntos.length}`,
             50, doc.page.height - 30, { align: 'center' });
  }
}

export default new DifuntosConsolidadoService();
