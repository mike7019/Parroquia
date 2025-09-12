/**
 * Controlador de reportes
 * Maneja las peticiones HTTP para generación de reportes
 */

import ReporteService from '../services/reportes/reporteService.js';
import familiasConsultasService from '../services/familiasConsultasService.js';
import difuntosService from '../services/difuntosService.js';
import reporteLogger from '../utils/reporteLogger.js';

class ReporteController {
  constructor() {
    this.reporteService = new ReporteService();
    this.familiasService = familiasConsultasService; // Ya es una instancia
    this.difuntosService = difuntosService; // Ya es una instancia
    this.logger = reporteLogger;
  }

  /**
   * Genera reporte de familias en Excel
   * GET /api/reportes/familias/excel
   */
  async generarFamiliasExcel(req, res) {
    const userId = req.user?.id;
    const operationId = this.logger.operacionIniciada('familias_excel', userId, {
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    try {
      // Extraer filtros de body (POST) o query (GET)
      const filtrosSource = req.method === 'POST' ? req.body.filtros || {} : req.query;
      const filtros = this.extraerFiltrosFamilias(filtrosSource);
      
      this.logger.debug('Filtros extraídos', { 
        operationId, 
        filtros, 
        cantidadFiltros: Object.keys(filtros).length 
      });
      
      // Obtener datos usando el servicio existente
      const resultado = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
      
      // Extraer el array de datos del resultado
      const familias = resultado?.datos || resultado;
      
      if (!familias || !Array.isArray(familias) || familias.length === 0) {
        this.logger.operacionFallida(operationId, 'familias_excel', userId, 
          new Error('No data found'), { filtros, resultadoTipo: typeof resultado });
        
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontraron familias con los filtros especificados',
          codigo: 'NO_DATA_FOUND'
        });
      }

      // Generar reporte - soportar tanto POST como GET
      const opcionesSource = req.method === 'POST' ? req.body : req.query;
      const opciones = {
        incluirEstadisticas: opcionesSource.incluir_estadisticas === true || opcionesSource.incluir_estadisticas === 'true',
        formatoAvanzado: opcionesSource.formato_avanzado === true || opcionesSource.formato_avanzado === 'true'
      };

      const reporte = await this.reporteService.generarReporteFamiliasExcel(familias, filtros, opciones);
      
      // Configurar headers para descarga forzada
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Total-Registros': reporte.registros,
        'X-Generado-En': reporte.generadoEn,
        'Access-Control-Expose-Headers': 'Content-Disposition, X-Total-Registros, X-Generado-En'
      });

      // Enviar archivo
      res.send(reporte.buffer);
      
      this.logger.operacionCompletada(operationId, 'familias_excel', userId, {
        filename: reporte.filename,
        registros: reporte.registros,
        tamañoKB: Math.round(reporte.size / 1024),
        filtros: Object.keys(filtros).length
      });
      
    } catch (error) {
      this.logger.operacionFallida(operationId, 'familias_excel', userId, error, {
        method: req.method,
        hasBody: !!req.body,
        hasQuery: !!req.query
      });
      
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno generando reporte de familias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'REPORTE_ERROR'
      });
    }
  }

  /**
   * Genera reporte de familias Excel y lo guarda en el servidor
   * POST /api/reportes/download/familias-excel
   */
  async generarYGuardarFamiliasExcel(req, res) {
    try {
      console.log('📊 Solicitud de reporte de familias Excel para guardar:', req.body);
      
      // Extraer filtros del body
      const filtros = this.extraerFiltrosFamilias(req.body.filtros || {});
      
      // Obtener datos usando el servicio existente
      const resultado = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
      
      // Extraer el array de datos del resultado
      const familias = resultado?.datos || resultado;
      
      if (!familias || !Array.isArray(familias) || familias.length === 0) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontraron familias con los filtros especificados',
          codigo: 'NO_DATA_FOUND'
        });
      }

      // Generar reporte
      const opciones = {
        incluirEstadisticas: req.body.incluir_estadisticas === true || req.body.incluir_estadisticas === 'true',
        formatoAvanzado: req.body.formato_avanzado === true || req.body.formato_avanzado === 'true'
      };

      const reporte = await this.reporteService.generarReporteFamiliasExcel(familias, filtros, opciones);
      
      // Guardar archivo físicamente
      const fs = await import('fs');
      const path = await import('path');
      
      const dirReportes = './reportes_generados';
      if (!fs.existsSync(dirReportes)) {
        fs.mkdirSync(dirReportes, { recursive: true });
      }
      
      const rutaArchivo = path.join(dirReportes, reporte.filename);
      fs.writeFileSync(rutaArchivo, reporte.buffer);
      
      // Responder con información del archivo
      res.json({
        exito: true,
        mensaje: 'Reporte generado y guardado exitosamente',
        archivo: reporte.filename,
        ruta_descarga: `/api/reportes/download/file/${reporte.filename}`,
        registros: reporte.registros,
        tamaño: reporte.size,
        generado_en: reporte.generadoEn
      });
      
      console.log(`✅ Reporte Excel guardado: ${rutaArchivo} (${reporte.registros} registros)`);
      
    } catch (error) {
      console.error('❌ Error en generarYGuardarFamiliasExcel:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno generando reporte de familias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'REPORTE_ERROR'
      });
    }
  }

  /**
   * Genera reporte de difuntos en PDF
   * GET /api/reportes/difuntos/pdf
   */
  async generarDifuntosPDF(req, res) {
    try {
      console.log('📄 Solicitud de reporte de difuntos PDF:', { 
        method: req.method,
        query: req.query, 
        body: req.body 
      });
      
      // Extraer filtros de body (POST) o query (GET)
      const filtrosSource = req.method === 'POST' ? req.body.filtros || {} : req.query;
      const filtros = this.extraerFiltrosDifuntos(filtrosSource);
      
      // Obtener datos usando el servicio existente
      const resultado = await this.difuntosService.getTodosDifuntos(filtros);
      
      // Extraer el array de datos del resultado
      const difuntos = resultado?.data || resultado;
      
      if (!difuntos || !Array.isArray(difuntos) || difuntos.length === 0) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontraron registros de difuntos con los filtros especificados',
          codigo: 'NO_DATA_FOUND'
        });
      }

      // Opciones del reporte - soportar tanto POST como GET
      const opcionesSource = req.method === 'POST' ? req.body : req.query;
      const opciones = {
        ceremonial: opcionesSource.ceremonial === true || opcionesSource.ceremonial === 'true',
        incluirVersiculos: opcionesSource.incluir_versiculos === true || opcionesSource.incluir_versiculos === 'true'
      };

      const reporte = await this.reporteService.generarReporteDifuntosPDF(difuntos, filtros, opciones);
      
      // Configurar headers para descarga forzada
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Total-Registros': reporte.registros,
        'X-Tipo-Reporte': reporte.tipo,
        'X-Generado-En': reporte.generadoEn,
        'Access-Control-Expose-Headers': 'Content-Disposition, X-Total-Registros, X-Tipo-Reporte, X-Generado-En'
      });

      // Enviar archivo
      res.send(reporte.buffer);
      
      console.log(`✅ Reporte PDF enviado: ${reporte.filename} (${reporte.registros} registros, tipo: ${reporte.tipo})`);
      
    } catch (error) {
      console.error('❌ Error en generarDifuntosPDF:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno generando reporte de difuntos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'REPORTE_ERROR'
      });
    }
  }

  /**
   * Genera reporte de difuntos en Excel
   * POST /api/reportes/excel/difuntos
   */
  async generarDifuntosExcel(req, res) {
    try {
      console.log('📊 Solicitud de reporte de difuntos Excel:', req.body);
      
      // Extraer filtros de body para POST
      const filtros = this.extraerFiltrosDifuntos(req.body.filtros || {});
      
      // Obtener datos usando el servicio existente
      const resultado = await this.difuntosService.getTodosDifuntos(filtros);
      
      // Extraer el array de datos del resultado
      const difuntos = resultado?.data || resultado;
      
      if (!difuntos || !Array.isArray(difuntos) || difuntos.length === 0) {
        return res.status(404).json({
          exito: false,
          mensaje: 'No se encontraron registros de difuntos con los filtros especificados',
          codigo: 'NO_DATA_FOUND'
        });
      }

      // Generar reporte
      const opciones = {
        incluirEstadisticas: req.body.incluir_estadisticas === true || req.body.incluir_estadisticas === 'true',
        formatoAvanzado: req.body.formato_avanzado === true || req.body.formato_avanzado === 'true'
      };

      const reporte = await this.reporteService.generarReporteDifuntosExcel(difuntos, filtros, opciones);
      
      // Configurar headers para descarga
      res.set({
        'Content-Type': reporte.mimeType,
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size,
        'X-Total-Registros': reporte.registros,
        'X-Generado-En': reporte.generadoEn
      });

      // Enviar archivo
      res.send(reporte.buffer);
      
      console.log(`✅ Reporte Excel enviado: ${reporte.filename} (${reporte.registros} registros)`);
      
    } catch (error) {
      console.error('❌ Error generando reporte Excel de difuntos:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno generando reporte de difuntos Excel',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'REPORTE_ERROR'
      });
    }
  }

  /**
   * Genera reporte estadístico en Excel
   * GET /api/reportes/estadisticas/excel
   */
  async generarEstadisticasExcel(req, res) {
    try {
      console.log('📈 Solicitud de estadísticas Excel:', req.query);
      
      const tipo = req.query.tipo || 'general';
      const filtros = this.extraerFiltrosFamilias(req.query);
      
      // Obtener datos según el tipo solicitado
      let datos;
      switch (tipo) {
        case 'familias':
          const resultadoFamilias = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
          datos = resultadoFamilias?.datos || resultadoFamilias;
          break;
        case 'difuntos':
          const resultadoDifuntos = await this.difuntosService.getTodosDifuntos(filtros);
          datos = resultadoDifuntos?.data || resultadoDifuntos;
          break;
        default:
          // Estadísticas generales - combinación de datos
          const resultadoFamiliasGeneral = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
          const resultadoDifuntosGeneral = await this.difuntosService.getTodosDifuntos(filtros);
          const familias = resultadoFamiliasGeneral?.datos || resultadoFamiliasGeneral;
          const difuntos = resultadoDifuntosGeneral?.data || resultadoDifuntosGeneral;
          datos = { familias, difuntos };
      }

      const reporte = await this.reporteService.generarReporteEstadisticasExcel(datos, tipo, filtros);
      
      res.set({
        'Content-Type': reporte.mimeType,
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size,
        'X-Tipo-Estadisticas': tipo,
        'X-Generado-En': reporte.generadoEn
      });

      res.send(reporte.buffer);
      
      console.log(`✅ Estadísticas Excel enviadas: ${reporte.filename} (tipo: ${tipo})`);
      
    } catch (error) {
      console.error('❌ Error en generarEstadisticasExcel:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno generando estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'ESTADISTICAS_ERROR'
      });
    }
  }

  /**
   * Obtiene información del sistema de reportes
   * GET /api/reportes/info
   */
  async obtenerInfoSistema(req, res) {
    try {
      const info = this.reporteService.getInfoSistema();
      
      res.json({
        exito: true,
        mensaje: 'Información del sistema de reportes',
        datos: info
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo info del sistema:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error obteniendo información del sistema',
        codigo: 'INFO_ERROR'
      });
    }
  }

  /**
   * Limpia el cache de reportes
   * DELETE /api/reportes/cache
   */
  async limpiarCache(req, res) {
    try {
      const estadisticasAntes = this.reporteService.getEstadisticasCache();
      this.reporteService.limpiarCache();
      const estadisticasDespues = this.reporteService.getEstadisticasCache();
      
      res.json({
        exito: true,
        mensaje: 'Cache de reportes limpiado exitosamente',
        datos: {
          antes: estadisticasAntes,
          despues: estadisticasDespues
        }
      });
      
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error limpiando cache de reportes',
        codigo: 'CACHE_ERROR'
      });
    }
  }

  /**
   * Obtiene estadísticas del cache
   * GET /api/reportes/cache/estadisticas
   */
  async obtenerEstadisticasCache(req, res) {
    try {
      const estadisticas = this.reporteService.getEstadisticasCache();
      
      res.json({
        exito: true,
        mensaje: 'Estadísticas del cache de reportes',
        datos: estadisticas
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas cache:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error obteniendo estadísticas del cache',
        codigo: 'CACHE_STATS_ERROR'
      });
    }
  }

  /**
   * Extrae filtros para familias de los query parameters
   */
  extraerFiltrosFamilias(query) {
    const filtros = {};
    
    if (query.municipio && query.municipio !== 'todos') {
      filtros.municipio = query.municipio;
    }
    
    if (query.sector && query.sector !== 'todos') {
      filtros.sector = query.sector;
    }
    
    if (query.vereda && query.vereda !== 'todos') {
      filtros.vereda = query.vereda;
    }
    
    if (query.estado && query.estado !== 'todos') {
      filtros.estado = query.estado;
    }
    
    if (query.fecha_desde) {
      filtros.fecha_desde = query.fecha_desde;
    }
    
    if (query.fecha_hasta) {
      filtros.fecha_hasta = query.fecha_hasta;
    }
    
    if (query.apellido_familiar) {
      filtros.apellido_familiar = query.apellido_familiar;
    }
    
    if (query.tiene_telefono === 'true') {
      filtros.tiene_telefono = true;
    } else if (query.tiene_telefono === 'false') {
      filtros.tiene_telefono = false;
    }
    
    // Paginación (para limitar cantidad si es necesario)
    if (query.limite) {
      filtros.limite = parseInt(query.limite);
    }
    
    return filtros;
  }

  /**
   * Extrae filtros para difuntos de los query parameters
   */
  extraerFiltrosDifuntos(query) {
    const filtros = {};
    
    if (query.municipio && query.municipio !== 'todos') {
      filtros.municipio = query.municipio;
    }
    
    if (query.apellido_familiar) {
      filtros.apellido_familiar = query.apellido_familiar;
    }
    
    if (query.mes_aniversario) {
      filtros.mes_aniversario = parseInt(query.mes_aniversario);
    }
    
    if (query.fecha_aniversario) {
      filtros.fecha_aniversario = query.fecha_aniversario;
    }
    
    if (query.fecha_desde) {
      filtros.fecha_desde = query.fecha_desde;
    }
    
    if (query.fecha_hasta) {
      filtros.fecha_hasta = query.fecha_hasta;
    }
    
    if (query.parentesco) {
      filtros.parentesco = query.parentesco;
    }
    
    // Paginación
    if (query.limite) {
      filtros.limite = parseInt(query.limite);
    }
    
    return filtros;
  }

  /**
   * Middleware de validación mejorado para reportes
   */
  validarSolicitudReporte(req, res, next) {
    const userId = req.user?.id;
    
    try {
      // Validar que no se soliciten demasiados registros
      const limite = parseInt(req.query.limite || req.body?.filtros?.limite);
      if (limite && limite > 50000) {
        this.logger.seguridadEvent('limite_excedido', userId, { 
          limiteSOlicitado: limite, 
          limiteMaximo: 50000,
          ip: req.ip 
        });
        
        return res.status(400).json({
          exito: false,
          mensaje: 'El límite de registros no puede exceder 50,000',
          codigo: 'LIMITE_EXCEDIDO'
        });
      }
      
      // Validar formato de fechas de forma más robusta
      const fechasParaValidar = [
        req.query.fecha_desde || req.body?.filtros?.fecha_desde,
        req.query.fecha_hasta || req.body?.filtros?.fecha_hasta,
        req.query.fecha_aniversario || req.body?.filtros?.fecha_aniversario
      ].filter(Boolean);
      
      for (const fecha of fechasParaValidar) {
        if (!this.validarFecha(fecha)) {
          this.logger.seguridadEvent('fecha_invalida', userId, { 
            fechaInvalida: fecha,
            ip: req.ip 
          });
          
          return res.status(400).json({
            exito: false,
            mensaje: `Formato de fecha inválido: ${fecha}. Use YYYY-MM-DD`,
            codigo: 'FECHA_INVALIDA'
          });
        }
      }
      
      // Validar rangos de fechas lógicos
      const fechaDesde = req.query.fecha_desde || req.body?.filtros?.fecha_desde;
      const fechaHasta = req.query.fecha_hasta || req.body?.filtros?.fecha_hasta;
      
      if (fechaDesde && fechaHasta) {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        
        if (desde > hasta) {
          return res.status(400).json({
            exito: false,
            mensaje: 'La fecha desde no puede ser mayor que la fecha hasta',
            codigo: 'RANGO_FECHAS_INVALIDO'
          });
        }
        
        // Validar que el rango no sea excesivamente grande (más de 10 años)
        const diffYears = (hasta - desde) / (1000 * 60 * 60 * 24 * 365);
        if (diffYears > 10) {
          this.logger.seguridadEvent('rango_fechas_excesivo', userId, { 
            fechaDesde, 
            fechaHasta, 
            años: Math.round(diffYears),
            ip: req.ip 
          });
          
          return res.status(400).json({
            exito: false,
            mensaje: 'El rango de fechas no puede exceder 10 años',
            codigo: 'RANGO_FECHAS_EXCESIVO'
          });
        }
      }
      
      // Sanitizar parámetros de texto para prevenir inyecciones
      const parametrosTexto = [
        req.query.apellido_familiar || req.body?.filtros?.apellido_familiar,
        req.query.municipio || req.body?.filtros?.municipio,
        req.query.sector || req.body?.filtros?.sector,
        req.query.vereda || req.body?.filtros?.vereda
      ].filter(Boolean);
      
      for (const parametro of parametrosTexto) {
        // Validar que solo contenga caracteres seguros
        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s\-\.0-9]+$/.test(parametro)) {
          this.logger.seguridadEvent('caracteres_sospechosos', userId, { 
            parametro,
            ip: req.ip 
          });
          
          return res.status(400).json({
            exito: false,
            mensaje: 'Los parámetros de texto contienen caracteres no permitidos',
            codigo: 'CARACTERES_INVALIDOS'
          });
        }
        
        // Validar longitud razonable
        if (parametro.length > 100) {
          return res.status(400).json({
            exito: false,
            mensaje: 'Los parámetros de texto no pueden exceder 100 caracteres',
            codigo: 'PARAMETRO_DEMASIADO_LARGO'
          });
        }
      }
      
      this.logger.debug('Validación de solicitud exitosa', {
        userId,
        parametrosValidados: parametrosTexto.length + fechasParaValidar.length,
        limite: limite || 'no_especificado',
        ip: req.ip
      });
      
      next();
      
    } catch (error) {
      this.logger.error('Error en validación de solicitud', error, {
        userId,
        ip: req.ip,
        method: req.method,
        url: req.originalUrl
      });
      
      res.status(500).json({
        exito: false,
        mensaje: 'Error en validación de parámetros',
        codigo: 'VALIDACION_ERROR'
      });
    }
  }

  /**
   * Valida formato de fecha YYYY-MM-DD con validación robusta
   */
  validarFecha(fecha) {
    // Regex más estricta
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    
    // Validar que la fecha sea real y no futura
    const date = new Date(fecha);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    
    if (!(date instanceof Date) || isNaN(date)) return false;
    if (date > now) return false; // No fechas futuras
    if (date < minDate) return false; // No fechas muy antiguas
    
    // Validar que el día, mes y año sean válidos
    const parts = fecha.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > now.getFullYear()) return false;
    
    // Verificar que la fecha coincide con los componentes
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  }

  /**
   * Genera un reporte de prueba en Excel
   * GET /api/reportes/test/excel
   */
  async generarTestExcel(req, res) {
    try {
      console.log('🧪 Generando reporte de prueba Excel...');
      
      // Datos de prueba
      const datosPrueba = [
        { id: 1, nombre: 'Familia Prueba 1', municipio: 'Test City', personas: 4 },
        { id: 2, nombre: 'Familia Prueba 2', municipio: 'Demo Town', personas: 3 },
        { id: 3, nombre: 'Familia Prueba 3', municipio: 'Sample Village', personas: 5 }
      ];
      
      const reporte = await this.reporteService.generarReporteFamiliasExcel(datosPrueba, {}, { test: true });
      
      res.set({
        'Content-Type': reporte.mimeType,
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size
      });

      res.send(reporte.buffer);
      console.log('✅ Reporte de prueba Excel enviado');
      
    } catch (error) {
      console.error('❌ Error en prueba Excel:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error generando reporte de prueba Excel',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Genera un reporte de prueba en PDF
   * GET /api/reportes/test/pdf
   */
  async generarTestPDF(req, res) {
    try {
      console.log('🧪 Generando reporte de prueba PDF...');
      
      // Datos de prueba
      const datosPrueba = [
        { nombre_completo: 'Juan Pérez', fecha_aniversario: '2023-01-15', parentesco_inferido: 'Padre', apellido_familiar: 'Pérez' },
        { nombre_completo: 'María García', fecha_aniversario: '2023-02-20', parentesco_inferido: 'Madre', apellido_familiar: 'García' },
        { nombre_completo: 'Carlos López', fecha_aniversario: '2023-03-10', parentesco_inferido: 'Hijo', apellido_familiar: 'López' }
      ];
      
      const reporte = await this.reporteService.generarReporteDifuntosPDF(datosPrueba, {}, { test: true });
      
      res.set({
        'Content-Type': reporte.mimeType,
        'Content-Disposition': `attachment; filename="${reporte.filename}"`,
        'Content-Length': reporte.size
      });

      res.send(reporte.buffer);
      console.log('✅ Reporte de prueba PDF enviado');
      
    } catch (error) {
      console.error('❌ Error en prueba PDF:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error generando reporte de prueba PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Descargar archivo de reporte generado
   * GET /api/reportes/download/file/:filename
   */
  async descargarArchivo(req, res) {
    try {
      const { filename } = req.params;
      const fs = await import('fs');
      const path = await import('path');
      
      // ✅ SEGURIDAD MEJORADA: Validación robusta contra path traversal
      const allowedExtensions = ['.xlsx', '.pdf'];
      const sanitizedFilename = path.basename(filename);
      const ext = path.extname(sanitizedFilename);
      
      // Validar extensión permitida, nombre limpio y caracteres seguros
      if (!allowedExtensions.includes(ext) || 
          sanitizedFilename !== filename ||
          !/^[a-zA-Z0-9_\-\.]+$/.test(sanitizedFilename)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Nombre de archivo inválido o extensión no permitida',
          codigo: 'INVALID_FILENAME'
        });
      }
      
      const rutaArchivo = path.join('./reportes_generados', filename);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Archivo no encontrado',
          codigo: 'FILE_NOT_FOUND'
        });
      }
      
      // Determinar Content-Type basado en la extensión
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.xlsx')) {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (filename.endsWith('.pdf')) {
        contentType = 'application/pdf';
      }
      
      // Configurar headers para descarga
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Enviar archivo
      res.sendFile(path.resolve(rutaArchivo));
      
      console.log(`✅ Archivo descargado: ${filename}`);
      
    } catch (error) {
      console.error('❌ Error en descargarArchivo:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno descargando archivo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        codigo: 'DOWNLOAD_ERROR'
      });
    }
  }
}

export default ReporteController;
