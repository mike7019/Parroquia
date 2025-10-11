/**
 * Controlador de Estadísticas Generales del Sistema
 */

import estadisticasGeneralesService from '../services/estadisticasGeneralesService.js';

class EstadisticasGeneralesController {
  
  /**
   * Obtener estadísticas completas del sistema
   */
  async getEstadisticasCompletas(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasCompletas();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas completas obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas completas:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas completas',
        error: error.message,
      });
    }
  }

  /**
   * Obtener resumen general
   */
  async getResumenGeneral(req, res) {
    try {
      const resumen = await estadisticasGeneralesService.getResumenGeneral();

      return res.status(200).json({
        exito: true,
        mensaje: 'Resumen general obtenido exitosamente',
        datos: resumen,
      });
    } catch (error) {
      console.error('Error al obtener resumen general:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener resumen general',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas por categoría específica
   */
  async getEstadisticasPorCategoria(req, res) {
    try {
      const { categoria } = req.params;

      const categoriasValidas = [
        'geografia',
        'poblacion',
        'familias',
        'salud',
        'educacion',
        'vivienda',
        'catalogos',
        'usuarios',
        'resumen'
      ];

      if (!categoriasValidas.includes(categoria)) {
        return res.status(400).json({
          exito: false,
          mensaje: `Categoría inválida. Categorías válidas: ${categoriasValidas.join(', ')}`,
        });
      }

      const estadisticas = await estadisticasGeneralesService.getEstadisticasPorCategoria(categoria);

      return res.status(200).json({
        exito: true,
        mensaje: `Estadísticas de ${categoria} obtenidas exitosamente`,
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas por categoría:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de geografía
   */
  async getEstadisticasGeografia(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasGeografia();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de geografía obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de geografía:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de geografía',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de población
   */
  async getEstadisticasPoblacion(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasPoblacion();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de población obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de población:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de población',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de familias
   */
  async getEstadisticasFamilias(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasFamilias();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de familias obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de familias:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de familias',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de salud
   */
  async getEstadisticasSalud(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasSalud();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de salud obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de salud:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de salud',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de educación
   */
  async getEstadisticasEducacion(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasEducacion();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de educación obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de educación:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de educación',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de vivienda
   */
  async getEstadisticasVivienda(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasVivienda();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de vivienda obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de vivienda:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de vivienda',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de catálogos
   */
  async getEstadisticasCatalogos(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasCatalogos();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de catálogos obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de catálogos:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de catálogos',
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getEstadisticasUsuarios(req, res) {
    try {
      const estadisticas = await estadisticasGeneralesService.getEstadisticasUsuarios();

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas de usuarios obtenidas exitosamente',
        datos: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas de usuarios',
        error: error.message,
      });
    }
  }
}

export default new EstadisticasGeneralesController();
