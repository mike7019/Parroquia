/**
 * Script para probar el servicio consolidado de difuntos
 * Verifica funcionalidades, identifica problemas y sugiere mejoras
 */

import difuntosConsolidadoService from './src/services/consolidados/difuntosConsolidadoService.js';
import sequelize from './config/sequelize.js';

class DifuntosServiceTester {
  constructor() {
    this.resultados = {
      pruebas_exitosas: 0,
      pruebas_fallidas: 0,
      errores: [],
      recomendaciones: []
    };
  }

  async ejecutarPruebas() {
    console.log('🔍 Iniciando pruebas del servicio consolidado de difuntos...\n');

    try {
      // Test de conexión a base de datos
      await this.testConexionBD();
      
      // Test de consulta básica
      await this.testConsultaBasica();
      
      // Test de filtros
      await this.testFiltros();
      
      // Test de aniversarios próximos
      await this.testAniversariosProximos();
      
      // Test de estadísticas
      await this.testEstadisticas();
      
      // Test de búsqueda por nombre
      await this.testBusquedaPorNombre();
      
      // Test de resumen por sector
      await this.testResumenPorSector();
      
      // Generar reporte final
      this.generarReporte();
      
    } catch (error) {
      console.error('❌ Error general en las pruebas:', error);
      this.registrarError('ERROR_GENERAL', error.message);
    } finally {
      await sequelize.close();
    }
  }

  async testConexionBD() {
    console.log('🔄 Probando conexión a base de datos...');
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión exitosa\n');
      this.pruebaPasada('Conexión BD');
    } catch (error) {
      console.error('❌ Error de conexión:', error.message);
      this.pruebaFallida('Conexión BD', error.message);
    }
  }

  async testConsultaBasica() {
    console.log('🔄 Probando consulta básica...');
    try {
      const resultado = await difuntosConsolidadoService.consultarDifuntos({});
      
      if (resultado && Array.isArray(resultado.difuntos)) {
        console.log(`✅ Consulta básica exitosa: ${resultado.difuntos.length} difuntos encontrados`);
        console.log(`📊 Total en BD: ${resultado.total}\n`);
        this.pruebaPasada('Consulta básica');
        
        // Verificar estructura de datos
        if (resultado.difuntos.length > 0) {
          const primer_difunto = resultado.difuntos[0];
          const campos_esperados = ['id_difunto', 'nombre_completo', 'fecha_aniversario'];
          const campos_presentes = campos_esperados.filter(campo => primer_difunto.hasOwnProperty(campo));
          
          if (campos_presentes.length === campos_esperados.length) {
            console.log('✅ Estructura de datos correcta');
          } else {
            console.log('⚠️ Estructura de datos incompleta:', campos_presentes);
            this.registrarRecomendacion('Verificar estructura de respuesta de consulta básica');
          }
        }
      } else {
        console.log('⚠️ Formato de respuesta inesperado');
        this.pruebaFallida('Consulta básica', 'Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('❌ Error en consulta básica:', error.message);
      this.pruebaFallida('Consulta básica', error.message);
    }
  }

  async testFiltros() {
    console.log('🔄 Probando filtros específicos...');
    
    // Test filtro por parentesco - Madre
    try {
      const madres = await difuntosConsolidadoService.consultarDifuntos({ parentesco: 'Madre' });
      console.log(`✅ Filtro madres: ${madres.difuntos.length} resultados`);
      this.pruebaPasada('Filtro madres');
    } catch (error) {
      console.error('❌ Error filtro madres:', error.message);
      this.pruebaFallida('Filtro madres', error.message);
    }

    // Test filtro por parentesco - Padre
    try {
      const padres = await difuntosConsolidadoService.consultarDifuntos({ parentesco: 'Padre' });
      console.log(`✅ Filtro padres: ${padres.difuntos.length} resultados`);
      this.pruebaPasada('Filtro padres');
    } catch (error) {
      console.error('❌ Error filtro padres:', error.message);
      this.pruebaFallida('Filtro padres', error.message);
    }

    // Test filtro por mes de aniversario
    try {
      const noviembre = await difuntosConsolidadoService.consultarDifuntos({ mes_aniversario: 11 });
      console.log(`✅ Filtro noviembre: ${noviembre.difuntos.length} resultados`);
      this.pruebaPasada('Filtro mes aniversario');
    } catch (error) {
      console.error('❌ Error filtro mes:', error.message);
      this.pruebaFallida('Filtro mes aniversario', error.message);
    }

    // Test filtro por rango de fechas
    try {
      const rango = await difuntosConsolidadoService.consultarDifuntos({ 
        fecha_inicio: '2020-01-01', 
        fecha_fin: '2024-12-31' 
      });
      console.log(`✅ Filtro rango fechas: ${rango.difuntos.length} resultados\n`);
      this.pruebaPasada('Filtro rango fechas');
    } catch (error) {
      console.error('❌ Error filtro rango:', error.message);
      this.pruebaFallida('Filtro rango fechas', error.message);
    }
  }

  async testAniversariosProximos() {
    console.log('🔄 Probando aniversarios próximos...');
    try {
      const aniversarios = await difuntosConsolidadoService.obtenerProximosAniversarios(30);
      console.log(`✅ Aniversarios próximos (30 días): ${aniversarios.length} resultados\n`);
      this.pruebaPasada('Aniversarios próximos');
    } catch (error) {
      console.error('❌ Error aniversarios próximos:', error.message);
      this.pruebaFallida('Aniversarios próximos', error.message);
    }
  }

  async testEstadisticas() {
    console.log('🔄 Probando estadísticas por mes...');
    try {
      const estadisticas = await difuntosConsolidadoService.obtenerEstadisticasPorMes();
      console.log(`✅ Estadísticas por mes: ${estadisticas.length} meses con datos\n`);
      this.pruebaPasada('Estadísticas por mes');
    } catch (error) {
      console.error('❌ Error estadísticas:', error.message);
      this.pruebaFallida('Estadísticas por mes', error.message);
    }
  }

  async testBusquedaPorNombre() {
    console.log('🔄 Probando búsqueda por nombre...');
    try {
      const busqueda = await difuntosConsolidadoService.buscarPorNombre('Maria');
      console.log(`✅ Búsqueda por nombre "Maria": ${busqueda.length} resultados\n`);
      this.pruebaPasada('Búsqueda por nombre');
    } catch (error) {
      console.error('❌ Error búsqueda por nombre:', error.message);
      this.pruebaFallida('Búsqueda por nombre', error.message);
    }
  }

  async testResumenPorSector() {
    console.log('🔄 Probando resumen por sector...');
    try {
      const resumen = await difuntosConsolidadoService.obtenerResumenPorSector();
      console.log(`✅ Resumen por sector: ${resumen.length} sectores con difuntos\n`);
      this.pruebaPasada('Resumen por sector');
    } catch (error) {
      console.error('❌ Error resumen por sector:', error.message);
      this.pruebaFallida('Resumen por sector', error.message);
    }
  }

  pruebaPasada(nombre) {
    this.resultados.pruebas_exitosas++;
  }

  pruebaFallida(nombre, error) {
    this.resultados.pruebas_fallidas++;
    this.registrarError(nombre, error);
  }

  registrarError(contexto, mensaje) {
    this.resultados.errores.push({ contexto, mensaje });
  }

  registrarRecomendacion(recomendacion) {
    this.resultados.recomendaciones.push(recomendacion);
  }

  generarReporte() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL DE PRUEBAS');
    console.log('='.repeat(60));
    
    console.log(`✅ Pruebas exitosas: ${this.resultados.pruebas_exitosas}`);
    console.log(`❌ Pruebas fallidas: ${this.resultados.pruebas_fallidas}`);
    
    if (this.resultados.errores.length > 0) {
      console.log('\n🚨 ERRORES ENCONTRADOS:');
      this.resultados.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error.contexto}: ${error.mensaje}`);
      });
    }
    
    if (this.resultados.recomendaciones.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      this.resultados.recomendaciones.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Recomendaciones específicas del análisis
    console.log('\n🔧 RECOMENDACIONES ADICIONALES:');
    console.log('1. Resolver conflicto de rutas en app.js (/api/difuntos registrado 2 veces)');
    console.log('2. Implementar parámetros preparados para mayor seguridad SQL');
    console.log('3. Considerar unificar los dos servicios consolidados');
    console.log('4. Añadir validación de entrada en controladores');
    console.log('5. Implementar cache para consultas frecuentes');
    
    const porcentaje_exito = Math.round((this.resultados.pruebas_exitosas / (this.resultados.pruebas_exitosas + this.resultados.pruebas_fallidas)) * 100);
    console.log(`\n🎯 TASA DE ÉXITO: ${porcentaje_exito}%`);
    
    if (porcentaje_exito >= 80) {
      console.log('🟢 Estado: BUENO - El servicio funciona correctamente');
    } else if (porcentaje_exito >= 60) {
      console.log('🟡 Estado: REGULAR - Necesita algunas mejoras');
    } else {
      console.log('🔴 Estado: CRÍTICO - Requiere atención inmediata');
    }
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const tester = new DifuntosServiceTester();
  tester.ejecutarPruebas();
}

export default DifuntosServiceTester;
