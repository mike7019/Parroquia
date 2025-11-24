import personasService from '../../services/consolidados/personasService.js';

/**
 * Controlador para endpoints consolidados de personas
 */
class PersonasController {

  /**
   * Consultar personas por ubicación geográfica
   * GET /api/personas/consolidado/geografico
   */
  async consultarPorGeografia(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_corregimiento: req.query.id_corregimiento ? parseInt(req.query.id_corregimiento) : undefined,
        id_centro_poblado: req.query.id_centro_poblado ? parseInt(req.query.id_centro_poblado) : undefined
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('📍 Consulta geográfica:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_geografico_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en consultarPorGeografia:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_GEOGRAFICA_ERROR"
      });
    }
  }

  /**
   * Consultar personas por familia y vivienda
   * GET /api/personas/consolidado/familia
   */
  async consultarPorFamilia(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        apellido_familiar: req.query.apellido_familiar,
        id_tipo_vivienda: req.query.id_tipo_vivienda ? parseInt(req.query.id_tipo_vivienda) : undefined,
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('👨‍👩‍👧‍👦 Consulta por familia:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_familia_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en consultarPorFamilia:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_FAMILIA_ERROR"
      });
    }
  }

  /**
   * Consultar personas por datos personales
   * GET /api/personas/consolidado/personal
   */
  async consultarPorDatosPersonales(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        id_estado_civil: req.query.id_estado_civil ? parseInt(req.query.id_estado_civil) : undefined,
        id_profesion: req.query.id_profesion ? parseInt(req.query.id_profesion) : undefined,
        id_nivel_educativo: req.query.id_nivel_educativo ? parseInt(req.query.id_nivel_educativo) : undefined,
        id_comunidad_cultural: req.query.id_comunidad_cultural ? parseInt(req.query.id_comunidad_cultural) : undefined,
        liderazgo: req.query.liderazgo,
        id_destreza: req.query.id_destreza ? parseInt(req.query.id_destreza) : undefined
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('👤 Consulta por datos personales:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_personal_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en consultarPorDatosPersonales:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_PERSONAL_ERROR"
      });
    }
  }

  /**
   * Consultar personas por tallas con filtros de edad y sexo
   * GET /api/personas/consolidado/tallas
   */
  async consultarPorTallas(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        
        // Filtros de tallas
        talla_camisa: req.query.talla_camisa,
        talla_pantalon: req.query.talla_pantalon,
        talla_zapato: req.query.talla_zapato,
        
        // Filtros adicionales: edad
        edad_min: req.query.edad_min ? parseInt(req.query.edad_min) : undefined,
        edad_max: req.query.edad_max ? parseInt(req.query.edad_max) : undefined,
        
        // Filtros adicionales: sexo
        id_sexo: req.query.id_sexo ? parseInt(req.query.id_sexo) : undefined,
        sexo: req.query.sexo
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('👕 Consulta por tallas con filtros de edad y sexo:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_tallas_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en consultarPorTallas:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_TALLAS_ERROR"
      });
    }
  }

  /**
   * Consultar personas por rango de edad
   * GET /api/personas/consolidado/edad
   */
  async consultarPorEdad(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        edad_min: req.query.edad_min ? parseInt(req.query.edad_min) : undefined,
        edad_max: req.query.edad_max ? parseInt(req.query.edad_max) : undefined
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('🎂 Consulta por edad:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_edad_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en consultarPorEdad:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "CONSULTA_EDAD_ERROR"
      });
    }
  }

  /**
   * Generar reporte general con todos los filtros combinados
   * GET /api/personas/consolidado/reporte
   */
  async generarReporteGeneral(req, res) {
    try {
      const format = req.query.format || 'json';
      const filtros = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10,
        
        // Geográficos (IDs)
        id_municipio: req.query.id_municipio ? parseInt(req.query.id_municipio) : undefined,
        id_parroquia: req.query.id_parroquia ? parseInt(req.query.id_parroquia) : undefined,
        id_sector: req.query.id_sector ? parseInt(req.query.id_sector) : undefined,
        id_vereda: req.query.id_vereda ? parseInt(req.query.id_vereda) : undefined,
        id_corregimiento: req.query.id_corregimiento ? parseInt(req.query.id_corregimiento) : undefined,
        id_centro_poblado: req.query.id_centro_poblado ? parseInt(req.query.id_centro_poblado) : undefined,
        
        // Familia
        apellido_familiar: req.query.apellido_familiar,
        id_tipo_vivienda: req.query.id_tipo_vivienda ? parseInt(req.query.id_tipo_vivienda) : undefined,
        id_parentesco: req.query.id_parentesco ? parseInt(req.query.id_parentesco) : undefined,
        
        // Personales (IDs)
        id_estado_civil: req.query.id_estado_civil ? parseInt(req.query.id_estado_civil) : undefined,
        id_profesion: req.query.id_profesion ? parseInt(req.query.id_profesion) : undefined,
        id_nivel_educativo: req.query.id_nivel_educativo ? parseInt(req.query.id_nivel_educativo) : undefined,
        id_comunidad_cultural: req.query.id_comunidad_cultural ? parseInt(req.query.id_comunidad_cultural) : undefined,
        liderazgo: req.query.liderazgo,
        id_destreza: req.query.id_destreza ? parseInt(req.query.id_destreza) : undefined,
        
        // Tallas
        talla_camisa: req.query.talla_camisa,
        talla_pantalon: req.query.talla_pantalon,
        talla_zapato: req.query.talla_zapato,
        
        // Edad
        edad_min: req.query.edad_min ? parseInt(req.query.edad_min) : undefined,
        edad_max: req.query.edad_max ? parseInt(req.query.edad_max) : undefined,
        
        // Fechas
        fecha_registro_desde: req.query.fecha_registro_desde,
        fecha_registro_hasta: req.query.fecha_registro_hasta
      };

      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === null || filtros[key] === '') {
          delete filtros[key];
        }
      });

      console.log('📊 Reporte general con filtros:', filtros);

      if (format === 'excel') {
        const buffer = await personasService.generarExcelPersonas(filtros);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `personas_reporte_general_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);
      } else {
        const resultado = await personasService.consultarPersonas(filtros);
        res.json(resultado);
      }
    } catch (error) {
      console.error('❌ Error en generarReporteGeneral:', error);
      res.status(500).json({
        status: "error",
        message: error.message,
        code: "REPORTE_GENERAL_ERROR"
      });
    }
  }
}

export default new PersonasController();
