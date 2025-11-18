import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/sequelize.js';
import ExcelJS from 'exceljs';
import personaDetallesHelper from '../helpers/personaDetallesHelper.js';

class FamiliasConsolidadoService {
  
  async consultarFamilias(filtros = {}) {
    try {
      console.log('🔍 Consultando familias consolidadas...', filtros);
      
      const limite = filtros.limite || 5;
      const offset = filtros.offset || 0;
      
      // Build WHERE conditions dynamically
      const whereConditions = ['f.id_familia IS NOT NULL'];
      const bindParams = [];
      let paramIndex = 1;
      
      if (filtros.id_parroquia) {
        whereConditions.push(`f.id_parroquia = $${paramIndex}`);
        bindParams.push(filtros.id_parroquia);
        paramIndex++;
      }
      
      if (filtros.id_municipio) {
        whereConditions.push(`f.id_municipio = $${paramIndex}`);
        bindParams.push(filtros.id_municipio);
        paramIndex++;
      }
      
      if (filtros.id_sector) {
        whereConditions.push(`f.id_sector = $${paramIndex}`);
        bindParams.push(filtros.id_sector);
        paramIndex++;
      }
      
      if (filtros.id_vereda) {
        whereConditions.push(`f.id_vereda = $${paramIndex}`);
        bindParams.push(filtros.id_vereda);
        paramIndex++;
      }
      
      // Add limite and offset to bind params
      bindParams.push(limite, offset);
      
      // Enhanced query with geographic data and filters
      const query = `
        SELECT 
          f.id_familia,
          f.codigo_familia,
          f.apellido_familiar,
          f.direccion_familia,
          f.telefono,
          p.nombre as parroquia_nombre,
          mun.nombre_municipio as municipio_nombre,
          dep.nombre as departamento_nombre,
          sec.nombre as sector_nombre,
          ver.nombre as vereda_nombre,
          corr.nombre as corregimiento_nombre,
          cp.nombre as centro_poblado_nombre
        FROM familias f
        LEFT JOIN parroquia p ON f.id_parroquia = p.id_parroquia  
        LEFT JOIN municipios mun ON f.id_municipio = mun.id_municipio
        LEFT JOIN departamentos dep ON mun.id_departamento = dep.id_departamento
        LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
        LEFT JOIN veredas ver ON f.id_vereda = ver.id_vereda
        LEFT JOIN corregimientos corr ON f.id_corregimiento = corr.id_corregimiento
        LEFT JOIN centros_poblados cp ON f.id_centro_poblado = cp.id_centro_poblado
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY f.apellido_familiar
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const familias = await sequelize.query(query, {
        bind: bindParams,
        type: QueryTypes.SELECT
      });
      
      // Formatear respuesta básica
      const datosFormateados = familias.map(familia => ({
        id_familia: familia.id_familia.toString(),
        codigo_familia: familia.codigo_familia || '',
        apellido_familiar: familia.apellido_familiar,
        direccion_familia: familia.direccion_familia,
        telefono: familia.telefono,
        parroquia_nombre: familia.parroquia_nombre,
        municipio_nombre: familia.municipio_nombre,
        departamento_nombre: familia.departamento_nombre,
        sector_nombre: familia.sector_nombre,
        vereda_nombre: familia.vereda_nombre,
        corregimiento_nombre: familia.corregimiento_nombre,
        centro_poblado_nombre: familia.centro_poblado_nombre,
        tipo_vivienda: 'No especificado',
        dispocision_basura: 'No especificado',
        tipos_agua_residuales: 'No especificado',
        sistema_acueducto: 'No especificado',
        miembros_familia: [],
        difuntos_familia: []
      }));
      
      // Now enhance each family with member and housing data
      const familiasCompletas = [];
      for (const familia of datosFormateados) {
        const miembros = await this.obtenerMiembrosFamilia(familia.id_familia);
        const difuntos = await this.obtenerDifuntosFamilia(familia.id_familia);
        const infoVivienda = await this.obtenerInfoVivienda(familia.id_familia);
        
        familiasCompletas.push({
          ...familia,
          ...infoVivienda,
          miembros_familia: miembros,
          difuntos_familia: difuntos
        });
      }
      
      return {
        exito: true,
        mensaje: 'Consulta consolidada de familias exitosa',
        datos: familiasCompletas
      };
      
    } catch (error) {
      console.error('❌ Error en consultarFamilias:', error);
      throw new Error(`Error al consultar familias consolidadas: ${error.message}`);
    }
  }

  async obtenerMiembrosFamilia(idFamilia) {
    try {
      // Usar el helper para obtener personas completas con celebraciones y enfermedades
      const miembros = await personaDetallesHelper.obtenerPersonasFamiliaCompletas(idFamilia);
      
      const miembrosConDestrezas = await Promise.all(
        miembros.map(async (miembro) => {
          const destrezas = await this.obtenerDestrezasPersona(miembro.id_personas);
          
          // Formatear celebraciones desde el array
          let celebracionPrincipal = {
            motivo: '',
            dia: '',
            mes: ''
          };
          
          // Tomar la primera celebración como principal para compatibilidad
          if (miembro.celebraciones && miembro.celebraciones.length > 0) {
            const primeraC = miembro.celebraciones[0];
            celebracionPrincipal = {
              motivo: primeraC.motivo || '',
              dia: primeraC.dia ? primeraC.dia.toString() : '',
              mes: this.obtenerNombreMes(primeraC.mes) || ''
            };
          }
          
          // Formatear enfermedades desde el array
          const enfermedadesTexto = miembro.enfermedades && miembro.enfermedades.length > 0
            ? miembro.enfermedades.map(e => e.enfermedad_nombre).join(', ')
            : '';
          
          return {
            tipo_identificacio: miembro.tipo_id_nombre || 'Cédula',
            numero_identificacion: miembro.identificacion || '',
            nombre_completo: `${miembro.primer_nombre || ''} ${miembro.segundo_nombre || ''} ${miembro.primer_apellido || ''} ${miembro.segundo_apellido || ''}`.trim(),
            telefono_personal: miembro.telefono || '',
            email_personal: miembro.correo_electronico || '',
            fecha_nacimiento: miembro.fecha_nacimiento,
            edad: miembro.edad || 0,
            sexo: miembro.sexo_nombre || 'No especificado',
            parentesco: miembro.parentesco_nombre || 'Familiar',
            situacion_civil: miembro.estado_civil_nombre || 'No especificado',
            estudios: miembro.estudios || '',
            profesion: miembro.profesion_nombre || 'No especificado',
            comunidad_cultural: miembro.comunidad_cultural_nombre || 'No especificado',
            enfermedades: enfermedadesTexto,
            liderazgo: miembro.en_que_eres_lider || '',
            destrezas: destrezas.length > 0 ? destrezas.join(', ') : '',
            necesidades_enfermo: enfermedadesTexto,
            comunion_casa: true,
            tallas: {
              camisa_blusa: miembro.talla_camisa || '',
              pantalon: miembro.talla_pantalon || '',
              calzado: miembro.talla_zapato || ''
            },
            celebracion: celebracionPrincipal,
            // ⭐ NUEVOS CAMPOS - Arrays completos ⭐
            todas_las_celebraciones: miembro.celebraciones || [],
            todas_las_enfermedades: miembro.enfermedades || []
          };
        })
      );
      
      return miembrosConDestrezas;
      
    } catch (error) {
      console.error('❌ Error en obtenerMiembrosFamilia:', error);
      return [];
    }
  }

  async obtenerDestrezasPersona(idPersona) {
    try {
      const query = `
        SELECT d.nombre
        FROM persona_destreza pd
        JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
        WHERE pd.id_personas_personas = $1
      `;
      
      const destrezas = await sequelize.query(query, {
        bind: [idPersona],
        type: QueryTypes.SELECT
      });
      
      return destrezas.map(d => d.nombre);
      
    } catch (error) {
      console.error('❌ Error en obtenerDestrezasPersona:', error);
      return [];
    }
  }

  async obtenerDifuntosFamilia(idFamilia) {
    try {
      const query = `
        SELECT 
          df.nombre_completo as nombre_difunto,
          TO_CHAR(df.fecha_fallecimiento, 'YYYY-MM-DD') as fecha_fallecimiento,
          COALESCE(s.nombre, 'No especificado') as sexo,
          COALESCE(par.nombre, 'No especificado') as parentesco,
          df.causa_fallecimiento
        FROM difuntos_familia df
        LEFT JOIN sexos s ON df.id_sexo = s.id_sexo
        LEFT JOIN parentescos par ON df.id_parentesco = par.id_parentesco
        WHERE df.id_familia_familias = $1
        ORDER BY df.fecha_fallecimiento DESC
      `;
      
      const difuntos = await sequelize.query(query, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });
      
      return difuntos.map(difunto => ({
        nombre_difunto: difunto.nombre_difunto,
        fecha_fallecimiento: difunto.fecha_fallecimiento,
        sexo: difunto.sexo,
        parentesco: difunto.parentesco,
        causa_fallecimiento: difunto.causa_fallecimiento || 'natural'
      }));
      
    } catch (error) {
      console.error('❌ Error en obtenerDifuntosFamilia:', error);
      return [];
    }
  }

  async obtenerInfoVivienda(idFamilia) {
    try {
      // 1. Obtener tipo de vivienda
      const queryVivienda = `
        SELECT 
          COALESCE(
            tv1.nombre, 
            tv2.nombre, 
            CASE 
              WHEN f.tipo_vivienda IS NOT NULL THEN f.tipo_vivienda
              ELSE 'No especificado'
            END
          ) as tipo_vivienda
        FROM familias f
        LEFT JOIN tipos_vivienda tv1 ON f.id_tipo_vivienda = tv1.id_tipo_vivienda
        LEFT JOIN tipos_vivienda tv2 ON f.tipo_vivienda::text = tv2.id_tipo_vivienda::text
        WHERE f.id_familia = $1
      `;
      
      const [infoVivienda] = await sequelize.query(queryVivienda, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 2. Obtener disposición de basura (puede ser múltiple)
      const queryBasura = `
        SELECT tdb.nombre
        FROM familia_disposicion_basura fdb
        JOIN tipos_disposicion_basura tdb ON fdb.id_tipo_disposicion_basura = tdb.id_tipo_disposicion_basura
        WHERE fdb.id_familia = $1
      `;
      
      const disposicionBasura = await sequelize.query(queryBasura, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 3. Obtener sistema de aguas residuales
      const queryAguasResiduales = `
        SELECT tar.nombre
        FROM familia_sistema_aguas_residuales fsar
        JOIN tipos_aguas_residuales tar ON fsar.id_tipo_aguas_residuales = tar.id_tipo_aguas_residuales
        WHERE fsar.id_familia = $1
      `;
      
      const aguasResiduales = await sequelize.query(queryAguasResiduales, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      // 4. Obtener sistema de acueducto
      const queryAcueducto = `
        SELECT sa.nombre
        FROM familia_sistema_acueducto fsa
        JOIN sistemas_acueducto sa ON fsa.id_sistema_acueducto = sa.id_sistema_acueducto
        WHERE fsa.id_familia = $1
      `;
      
      const sistemaAcueducto = await sequelize.query(queryAcueducto, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });
      
      return {
        tipo_vivienda: infoVivienda?.tipo_vivienda || 'No especificado',
        dispocision_basura: disposicionBasura.length > 0 
          ? disposicionBasura.map(d => d.nombre).join(', ') 
          : 'No especificado',
        tipos_agua_residuales: aguasResiduales.length > 0 
          ? aguasResiduales.map(a => a.nombre).join(', ') 
          : 'No especificado',
        sistema_acueducto: sistemaAcueducto.length > 0 
          ? sistemaAcueducto.map(s => s.nombre).join(', ') 
          : 'No especificado'
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerInfoVivienda:', error);
      return {
        tipo_vivienda: 'No especificado',
        dispocision_basura: 'No especificado',
        tipos_agua_residuales: 'No especificado',
        sistema_acueducto: 'No especificado'
      };
    }
  }

  obtenerNombreMes(numeroMes) {
    const meses = {
      1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
      5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 
      9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
    };
    return meses[numeroMes] || '';
  }

  /**
   * Generar reporte Excel completo de familias
   * GET /api/familias/reporte/excel
   */
  async generarReporteExcelFamilias(filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Configuración del workbook
    workbook.creator = 'Sistema Parroquial - Familias';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.subject = 'Reporte Consolidado de Familias';
    
    try {
      console.log('📊 Generando reporte Excel de familias con filtros:', filtros);
      
      // 1. Obtener datos consolidados
      const datosFamilias = await this.consultarFamilias(filtros);
      const familias = datosFamilias.datos || [];
      
      console.log(`📋 Procesando ${familias.length} familias para Excel`);
      
      // 2. HOJA 1: INFORMACIÓN GENERAL DE FAMILIAS
      await this.crearHojaInfoGeneral(workbook, familias);
      
      // 3. HOJA 2: MIEMBROS DE FAMILIAS
      await this.crearHojaMiembrosFamilias(workbook, familias);
      
      // 4. HOJA 3: DIFUNTOS POR FAMILIA
      await this.crearHojaDifuntosFamilias(workbook, familias);
      
      // 5. HOJA 4: ESTADÍSTICAS GENERALES
      await this.crearHojaEstadisticasFamilias(workbook, familias);
      
      console.log('✅ Excel de familias generado exitosamente');
      return workbook;
      
    } catch (error) {
      console.error('❌ Error generando Excel de familias:', error);
      throw new Error(`Error en generación de Excel: ${error.message}`);
    }
  }

  /**
   * HOJA 1: INFORMACIÓN GENERAL DE FAMILIAS
   */
  async crearHojaInfoGeneral(workbook, familias) {
    const hoja = workbook.addWorksheet('Información General');
    
    // Configurar columnas
    hoja.columns = [
      { header: 'Código Familia', key: 'codigo', width: 15 },
      { header: 'Apellido Familiar', key: 'apellido', width: 25 },
      { header: 'Dirección', key: 'direccion', width: 35 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Parroquia', key: 'parroquia', width: 20 },
      { header: 'Municipio', key: 'municipio', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 20 },
      { header: 'Sector', key: 'sector', width: 20 },
      { header: 'Vereda', key: 'vereda', width: 20 },
      { header: 'Tipo Vivienda', key: 'tipo_vivienda', width: 20 },
      { header: 'Sistema Acueducto', key: 'acueducto', width: 25 },
      { header: 'Disposición Basura', key: 'basura', width: 25 },
      { header: 'Aguas Residuales', key: 'aguas', width: 25 },
      { header: 'N° Miembros', key: 'num_miembros', width: 12 },
      { header: 'N° Difuntos', key: 'num_difuntos', width: 12 }
    ];
    
    // Agregar datos
    familias.forEach(familia => {
      hoja.addRow({
        codigo: familia.codigo_familia || '',
        apellido: familia.apellido_familiar,
        direccion: familia.direccion_familia,
        telefono: familia.telefono || '',
        parroquia: familia.parroquia_nombre || '',
        municipio: familia.municipio_nombre || '',
        departamento: familia.departamento_nombre || '',
        sector: familia.sector_nombre || '',
        vereda: familia.vereda_nombre || '',
        tipo_vivienda: familia.tipo_vivienda,
        acueducto: familia.sistema_acueducto,
        basura: familia.dispocision_basura,
        aguas: familia.tipos_agua_residuales,
        num_miembros: familia.miembros_familia?.length || 0,
        num_difuntos: familia.difuntos_familia?.length || 0
      });
    });
    
    this.aplicarFormatoTabla(hoja, '4472C4'); // Azul para familias
  }

  /**
   * HOJA 2: MIEMBROS DE FAMILIAS
   */
  async crearHojaMiembrosFamilias(workbook, familias) {
    const hoja = workbook.addWorksheet('Miembros de Familias');
    
    hoja.columns = [
      { header: 'ID Familia', key: 'id_familia', width: 12 },
      { header: 'Apellido Familia', key: 'familia', width: 25 },
      { header: 'Nombre Completo', key: 'nombre', width: 35 },
      { header: 'Tipo ID', key: 'tipo_id', width: 12 },
      { header: 'Número ID', key: 'num_id', width: 15 },
      { header: 'Parentesco', key: 'parentesco', width: 15 },
      { header: 'Sexo', key: 'sexo', width: 10 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Fecha Nacimiento', key: 'fecha_nac', width: 15 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Situación Civil', key: 'situacion_civil', width: 18 },
      { header: 'Estudios', key: 'estudios', width: 25 },
      { header: 'Profesión', key: 'profesion', width: 25 },
      { header: 'Comunidad Cultural', key: 'comunidad', width: 20 },
      { header: 'Destrezas', key: 'destrezas', width: 30 },
      { header: 'Liderazgo', key: 'liderazgo', width: 25 },
      { header: 'Enfermedades', key: 'enfermedades', width: 30 }
    ];
    
    // Agregar datos de todos los miembros
    familias.forEach(familia => {
      familia.miembros_familia?.forEach(miembro => {
        hoja.addRow({
          id_familia: familia.id_familia,
          familia: familia.apellido_familiar,
          nombre: miembro.nombre_completo,
          tipo_id: miembro.tipo_identificacio,
          num_id: miembro.numero_identificacion,
          parentesco: miembro.parentesco,
          sexo: miembro.sexo,
          edad: miembro.edad,
          fecha_nac: miembro.fecha_nacimiento,
          telefono: miembro.telefono_personal,
          email: miembro.email_personal,
          situacion_civil: miembro.situacion_civil,
          estudios: miembro.estudios,
          profesion: miembro.profesion,
          comunidad: miembro.comunidad_cultural,
          destrezas: miembro.destrezas,
          liderazgo: miembro.liderazgo,
          enfermedades: miembro.enfermedades
        });
      });
    });
    
    this.aplicarFormatoTabla(hoja, '70AD47'); // Verde para miembros
  }

  /**
   * HOJA 3: DIFUNTOS POR FAMILIA
   */
  async crearHojaDifuntosFamilias(workbook, familias) {
    const hoja = workbook.addWorksheet('Difuntos');
    
    hoja.columns = [
      { header: 'ID Familia', key: 'id_familia', width: 12 },
      { header: 'Apellido Familia', key: 'familia', width: 25 },
      { header: 'Nombre Difunto', key: 'nombre', width: 35 },
      { header: 'Parentesco', key: 'parentesco', width: 15 },
      { header: 'Sexo', key: 'sexo', width: 10 },
      { header: 'Fecha Fallecimiento', key: 'fecha', width: 18 },
      { header: 'Causa Fallecimiento', key: 'causa', width: 40 }
    ];
    
    // Agregar datos de todos los difuntos
    familias.forEach(familia => {
      familia.difuntos_familia?.forEach(difunto => {
        hoja.addRow({
          id_familia: familia.id_familia,
          familia: familia.apellido_familiar,
          nombre: difunto.nombre_difunto,
          parentesco: difunto.parentesco,
          sexo: difunto.sexo,
          fecha: difunto.fecha_fallecimiento,
          causa: difunto.causa_fallecimiento
        });
      });
    });
    
    this.aplicarFormatoTabla(hoja, '8B4513'); // Marrón para difuntos
  }

  /**
   * HOJA 4: ESTADÍSTICAS GENERALES
   */
  async crearHojaEstadisticasFamilias(workbook, familias) {
    const hoja = workbook.addWorksheet('Estadísticas');
    
    // Calcular estadísticas
    const totalFamilias = familias.length;
    const totalMiembros = familias.reduce((sum, f) => sum + (f.miembros_familia?.length || 0), 0);
    const totalDifuntos = familias.reduce((sum, f) => sum + (f.difuntos_familia?.length || 0), 0);
    
    // Estadísticas por municipio
    const porMunicipio = {};
    familias.forEach(f => {
      const municipio = f.municipio_nombre || 'Sin municipio';
      porMunicipio[municipio] = (porMunicipio[municipio] || 0) + 1;
    });
    
    // Estadísticas por sector
    const porSector = {};
    familias.forEach(f => {
      const sector = f.sector_nombre || 'Sin sector';
      porSector[sector] = (porSector[sector] || 0) + 1;
    });
    
    // Crear resumen
    hoja.addRow(['ESTADÍSTICAS GENERALES DE FAMILIAS']);
    hoja.addRow([]);
    hoja.addRow(['Concepto', 'Valor']);
    hoja.addRow(['Total Familias', totalFamilias]);
    hoja.addRow(['Total Miembros', totalMiembros]);
    hoja.addRow(['Total Difuntos', totalDifuntos]);
    hoja.addRow(['Promedio Miembros por Familia', (totalMiembros / totalFamilias).toFixed(2)]);
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR MUNICIPIO']);
    hoja.addRow([]);
    hoja.addRow(['Municipio', 'Total Familias', 'Porcentaje']);
    
    Object.entries(porMunicipio)
      .sort(([,a], [,b]) => b - a)
      .forEach(([municipio, total]) => {
        const porcentaje = ((total / totalFamilias) * 100).toFixed(1);
        hoja.addRow([municipio, total, `${porcentaje}%`]);
      });
    
    hoja.addRow([]);
    hoja.addRow(['DISTRIBUCIÓN POR SECTOR']);
    hoja.addRow([]);
    hoja.addRow(['Sector', 'Total Familias', 'Porcentaje']);
    
    Object.entries(porSector)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15) // Top 15 sectores
      .forEach(([sector, total]) => {
        const porcentaje = ((total / totalFamilias) * 100).toFixed(1);
        hoja.addRow([sector, total, `${porcentaje}%`]);
      });
    
    // Formato
    hoja.getRow(1).font = { bold: true, size: 14 };
    hoja.getRow(3).font = { bold: true };
    hoja.getRow(9).font = { bold: true, size: 14 };
    hoja.getRow(11).font = { bold: true };
    
    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 15;
    hoja.getColumn(3).width = 15;
  }

  /**
   * FUNCIÓN AUXILIAR: Aplicar formato profesional a tablas
   */
  aplicarFormatoTabla(hoja, colorHex) {
    // Formatear encabezados
    hoja.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorHex } };
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
}

export default new FamiliasConsolidadoService();