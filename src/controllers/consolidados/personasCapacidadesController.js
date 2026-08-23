import personasCapacidadesService from '../../services/consolidados/personasCapacidadesService.js';
import { parseIdOrNombre, parseIdEstricto, FiltroInvalidoError } from '../../utils/queryFilters.js';

/**
 * Controlador para endpoints consolidados de personas, capacidades y análisis geográfico
 */
class PersonasCapacidadesController {

  /**
   * Obtener personas filtradas por destrezas/habilidades
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  async obtenerPersonasPorDestrezas(req, res) {
    try {
      console.log('🔍 Controlador: Obteniendo personas por destrezas');

      const filtros = {
        destreza_id: parseIdEstricto(req.query.destreza_id, 'destreza_id'),
        id_municipio: parseIdOrNombre(req.query.id_municipio),
        id_sector: parseIdEstricto(req.query.id_sector, 'id_sector'),
        id_vereda: parseIdEstricto(req.query.id_vereda, 'id_vereda'),
        id_parroquia: parseIdEstricto(req.query.id_parroquia, 'id_parroquia'),
        id_corregimiento: parseIdEstricto(req.query.id_corregimiento, 'id_corregimiento'),
        id_centro_poblado: parseIdEstricto(req.query.id_centro_poblado, 'id_centro_poblado'),
        id_sexo: parseIdEstricto(req.query.id_sexo, 'id_sexo'),
        edad_min: req.query.edad_min ? parseInt(req.query.edad_min) : undefined,
        edad_max: req.query.edad_max ? parseInt(req.query.edad_max) : undefined,
        incluir_estadisticas: req.query.incluir_estadisticas !== 'false',
        pagina: req.query.pagina ? parseInt(req.query.pagina) : 1,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await personasCapacidadesService.consultarPersonasPorDestrezas(filtros);

      res.json({
        exito: true,
        mensaje: 'Consulta de personas por destrezas realizada exitosamente',
        datos: resultado.personas,
        estadisticas: resultado.estadisticas || null,
        total: resultado.total,
        pagina: resultado.pagina,
        limite: resultado.limite,
        total_paginas: resultado.total_paginas
      });

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: 'error', message: error.message, code: error.code });
      }
      console.error('❌ Error en obtenerPersonasPorDestrezas:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
        code: 'PERSONAS_DESTREZAS_ERROR'
      });
    }
  }

  /**
   * Análisis geográfico por sectores y veredas
   * @param {Object} req - Request  
   * @param {Object} res - Response
   */
  async obtenerAnalisisGeografico(req, res) {
    try {
      console.log('🗺️ Controlador: Obteniendo análisis geográfico');
      
      const filtros = {
        municipio: req.query.municipio,
        incluir_detalles: req.query.incluir_detalles !== 'false'
      };

      const resultado = await personasCapacidadesService.analizarPorGeografia(filtros);

      res.json({
        exito: true,
        mensaje: 'Análisis geográfico realizado exitosamente',
        datos: resultado,
        total: resultado.analisis_sectores.length + resultado.analisis_veredas.length
      });

    } catch (error) {
      console.error('❌ Error en obtenerAnalisisGeografico:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
        code: 'ANALISIS_GEOGRAFICO_ERROR'
      });
    }
  }

  /**
   * Obtener personas por profesiones
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  async obtenerPersonasPorProfesiones(req, res) {
    try {
      console.log('💼 Controlador: Obteniendo personas por profesiones');
      
      const filtros = {
        profesion_id: parseIdEstricto(req.query.profesion_id, 'profesion_id'),
        profesion_nombre: req.query.profesion_nombre,
        id_municipio: parseIdOrNombre(req.query.id_municipio),
        id_sexo: parseIdEstricto(req.query.id_sexo, 'id_sexo'),
        pagina: req.query.pagina ? parseInt(req.query.pagina) : 1,
        limite: req.query.limite ? parseInt(req.query.limite) : 50
      };

      const resultado = await personasCapacidadesService.consultarPorProfesiones(filtros);

      res.json({
        exito: true,
        mensaje: 'Consulta de personas por profesiones realizada exitosamente',
        datos: resultado.personas,
        estadisticas_profesiones: resultado.estadisticas_profesiones,
        total: resultado.total,
        pagina: resultado.pagina,
        limite: resultado.limite
      });

    } catch (error) {
      if (error instanceof FiltroInvalidoError) {
        return res.status(400).json({ status: 'error', message: error.message, code: error.code });
      }
      console.error('❌ Error en obtenerPersonasPorProfesiones:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
        code: 'PERSONAS_PROFESIONES_ERROR'
      });
    }
  }

  /**
   * Obtener análisis de comunidades culturales
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  async obtenerComunidadesCulturales(req, res) {
    try {
      console.log('🎭 Controlador: Obteniendo comunidades culturales');
      
      const filtros = {
        comunidad_id: req.query.comunidad_id ? parseInt(req.query.comunidad_id) : undefined,
        municipio: req.query.municipio,
        incluir_personas: req.query.incluir_personas !== 'false'
      };

      const resultado = await personasCapacidadesService.consultarComunidadesCulturales(filtros);

      res.json({
        exito: true,
        mensaje: 'Consulta de comunidades culturales realizada exitosamente',
        datos: {
          estadisticas_comunidades: resultado.estadisticas_comunidades,
          personas: resultado.personas || null
        },
        total: resultado.estadisticas_comunidades.length
      });

    } catch (error) {
      console.error('❌ Error en obtenerComunidadesCulturales:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
        code: 'COMUNIDADES_CULTURALES_ERROR'
      });
    }
  }

  /**
   * Obtener filtros disponibles para el sistema de capacidades
   * @param {Object} req - Request
   * @param {Object} res - Response
   */
  async obtenerFiltrosDisponibles(req, res) {
    try {
      console.log('🔧 Controlador: Obteniendo filtros disponibles para capacidades');

      const filtros = await personasCapacidadesService.obtenerFiltrosDisponibles();

      res.json({
        exito: true,
        mensaje: 'Filtros disponibles obtenidos exitosamente',
        datos: filtros,
        total: Object.keys(filtros).length
      });

    } catch (error) {
      console.error('❌ Error en obtenerFiltrosDisponibles:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Error interno del servidor',
        code: 'FILTROS_CAPACIDADES_ERROR'
      });
    }
  }
}

export default new PersonasCapacidadesController();
