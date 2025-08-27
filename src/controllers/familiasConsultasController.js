import FamiliasConsultasService from '../services/familiasConsultasService.js';

class FamiliasConsultasController {
  /**
   * Consultar por Madres
   * GET /api/consultas/madres
   */
  async consultarMadres(req, res) {
    try {
      console.log('🔍 Consultando madres...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        documento: req.query.documento,
        telefono: req.query.telefono,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarPorMadres(filtros);

      console.log(`✅ Consulta de madres completada: ${resultado.total} resultados`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de madres realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados
      });

    } catch (error) {
      console.error('❌ Error en consulta de madres:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar madres',
        error: error.message
      });
    }
  }

  /**
   * Consultar por Padres
   * GET /api/consultas/padres
   */
  async consultarPadres(req, res) {
    try {
      console.log('🔍 Consultando padres...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        documento: req.query.documento,
        telefono: req.query.telefono,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarPorPadres(filtros);

      console.log(`✅ Consulta de padres completada: ${resultado.total} resultados`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de padres realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados
      });

    } catch (error) {
      console.error('❌ Error en consulta de padres:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar padres',
        error: error.message
      });
    }
  }

  /**
   * Consultar familias con información de padres y madres
   * GET /api/consultas/familias-padres-madres
   */
  async consultarFamiliasConPadresMadres(req, res) {
    try {
      console.log('🔍 Consultando familias con padres y madres...');
      
      const filtros = {
        apellido_familiar: req.query.apellido_familiar,
        sector: req.query.sector,
        limite: parseInt(req.query.limite) || 30
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarFamiliasConPadresMadres(filtros);

      console.log(`✅ Consulta de familias completada: ${resultado.total} resultados`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de familias con padres y madres realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados
      });

    } catch (error) {
      console.error('❌ Error en consulta de familias:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar familias con padres y madres',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de padres y madres
   * GET /api/consultas/estadisticas
   */
  async obtenerEstadisticas(req, res) {
    try {
      console.log('📊 Obteniendo estadísticas de padres y madres...');
      
      const estadisticas = await FamiliasConsultasService.obtenerEstadisticasPadresMadres();

      console.log('✅ Estadísticas obtenidas exitosamente');

      return res.status(200).json({
        exito: true,
        mensaje: 'Estadísticas obtenidas exitosamente',
        datos: estadisticas
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  /**
   * Consultar madres fallecidas
   * GET /api/consultas/madres-fallecidas
   */
  async consultarMadresFallecidas(req, res) {
    try {
      console.log('🕊️ Consultando madres fallecidas...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        fecha_fallecimiento: req.query.fecha_fallecimiento,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarMadresFallecidas(filtros);

      console.log(`✅ Consulta de madres fallecidas completada: ${resultado.total} resultados`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de madres fallecidas realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados,
        nota: resultado.nota,
        columnas: [
          'Tipo Parentesco',
          'Apellido Familiar',
          'Parentesco',
          'Documento',
          'Nombre',
          'Sexo',
          'Edad',
          'Fecha de nacimiento',
          'Telefono',
          'Estado',
          'Fecha de fallecimiento',
          'Años fallecida',
          'Observaciones'
        ]
      });

    } catch (error) {
      console.error('❌ Error en consulta de madres fallecidas:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar madres fallecidas',
        error: error.message
      });
    }
  }

  /**
   * Consultar padres fallecidos
   * GET /api/consultas/padres-fallecidos
   */
  async consultarPadresFallecidos(req, res) {
    try {
      console.log('🕊️ Consultando padres fallecidos...');
      
      const filtros = {
        nombre: req.query.nombre,
        apellido_familiar: req.query.apellido_familiar,
        fecha_fallecimiento: req.query.fecha_fallecimiento,
        limite: parseInt(req.query.limite) || 50
      };

      // Remover filtros vacíos
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const resultado = await FamiliasConsultasService.consultarPadresFallecidos(filtros);

      console.log(`✅ Consulta de padres fallecidos completada: ${resultado.total} resultados`);

      return res.status(200).json({
        exito: true,
        mensaje: 'Consulta de padres fallecidos realizada exitosamente',
        datos: resultado.datos,
        total: resultado.total,
        filtros_aplicados: resultado.filtros_aplicados,
        nota: resultado.nota,
        columnas: [
          'Tipo Parentesco',
          'Apellido Familiar',
          'Parentesco',
          'Documento',
          'Nombre',
          'Sexo',
          'Edad',
          'Fecha de nacimiento',
          'Telefono',
          'Estado',
          'Fecha de fallecimiento',
          'Años fallecido',
          'Observaciones'
        ]
      });

    } catch (error) {
      console.error('❌ Error en consulta de padres fallecidos:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al consultar padres fallecidos',
        error: error.message
      });
    }
  }
  async buscarPersonaPorDocumento(req, res) {
    try {
      const { documento } = req.params;
      
      console.log(`🔍 Buscando persona con documento: ${documento}`);
      
      // Buscar en madres
      const resultadoMadres = await FamiliasConsultasService.consultarPorMadres({ documento });
      // Buscar en padres
      const resultadoPadres = await FamiliasConsultasService.consultarPorPadres({ documento });
      
      const persona = [...resultadoMadres.datos, ...resultadoPadres.datos][0];
      
      if (!persona) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Persona no encontrada con el documento proporcionado'
        });
      }

      console.log('✅ Persona encontrada');

      return res.status(200).json({
        exito: true,
        mensaje: 'Persona encontrada exitosamente',
        datos: persona
      });

    } catch (error) {
      console.error('❌ Error al buscar persona:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al buscar persona',
        error: error.message
      });
    }
  }
}

export default new FamiliasConsultasController();
