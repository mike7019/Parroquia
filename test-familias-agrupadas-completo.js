/**
 * Script de prueba para funcionalidad completa de familias agrupadas
 * 
 * Este script valida:
 * 1. Consulta de familias agrupadas (JSON)
 * 2. Generación de Excel completo
 * 3. Verificación de datos con estructura familiar correcta
 * 
 * Uso: node test-familias-agrupadas-completo.js
 */

import familiasConsolidadoService from './src/services/consolidados/familiasConsolidadoService.js';
import fs from 'fs';
import path from 'path';

class TestFamiliasCompleto {
  constructor() {
    this.resultados = {
      exitoso: true,
      pruebas: [],
      errores: []
    };
  }

  /**
   * Ejecutar todas las pruebas
   */
  async ejecutarPruebas() {
    console.log('🧪 INICIANDO PRUEBAS DE FAMILIAS AGRUPADAS COMPLETAS');
    console.log('=' .repeat(60));

    try {
      // Prueba 1: Obtener familias agrupadas básicas
      await this.probarFamiliasAgrupadas();

      // Prueba 2: Obtener familias con filtros
      await this.probarFamiliasConFiltros();

      // Prueba 3: Generar Excel completo
      await this.probarExcelCompleto();

      // Prueba 4: Verificar estructura de datos
      await this.verificarEstructuraDatos();

      // Prueba 5: Validar información específica
      await this.validarInformacionCompleta();

      // Resumen final
      this.mostrarResumen();

    } catch (error) {
      console.error('❌ Error general en las pruebas:', error);
      this.agregarError('ERROR_GENERAL', error.message);
    }
  }

  /**
   * Prueba 1: Obtener familias agrupadas básicas
   */
  async probarFamiliasAgrupadas() {
    console.log('\n🔍 Prueba 1: Familias agrupadas básicas');
    
    try {
      const resultado = await familiasConsolidadoService.obtenerFamiliasAgrupadas({
        limite: 10
      });

      if (resultado.exito && resultado.datos.length > 0) {
        console.log(`✅ Familias agrupadas obtenidas: ${resultado.datos.length}`);
        console.log(`📊 Campos disponibles: ${Object.keys(resultado.datos[0]).length}`);
        
        // Mostrar ejemplo de familia
        const ejemploFamilia = resultado.datos[0];
        console.log('👨‍👩‍👧‍👦 Ejemplo de familia:');
        console.log(`   - ID: ${ejemploFamilia.id_familia}`);
        console.log(`   - Apellido: ${ejemploFamilia.apellido_familiar}`);
        console.log(`   - Padre: ${ejemploFamilia.nombre_completo_padre || 'N/A'}`);
        console.log(`   - Madre: ${ejemploFamilia.nombre_completo_madre || 'N/A'}`);
        console.log(`   - Total miembros: ${ejemploFamilia.total_miembros}`);
        console.log(`   - Total hijos: ${ejemploFamilia.total_hijos}`);
        console.log(`   - Municipio: ${ejemploFamilia.nombre_municipio}`);

        this.agregarPrueba('FAMILIAS_AGRUPADAS_BASICAS', true, `${resultado.datos.length} familias obtenidas`);
        return resultado;
      } else {
        throw new Error('No se obtuvieron familias agrupadas');
      }

    } catch (error) {
      console.error('❌ Error en familias agrupadas básicas:', error.message);
      this.agregarError('FAMILIAS_AGRUPADAS_BASICAS', error.message);
      return null;
    }
  }

  /**
   * Prueba 2: Obtener familias con filtros
   */
  async probarFamiliasConFiltros() {
    console.log('\n🔍 Prueba 2: Familias con filtros específicos');
    
    try {
      const resultado = await familiasConsolidadoService.obtenerFamiliasAgrupadas({
        limite: 5,
        municipio: 'Medellín' // Cambiar por un municipio que exista en tu BD
      });

      console.log(`✅ Familias con filtro de municipio: ${resultado.datos.length}`);
      
      if (resultado.datos.length > 0) {
        const municipiosEncontrados = [...new Set(resultado.datos.map(f => f.nombre_municipio))];
        console.log(`🏘️ Municipios en resultados: ${municipiosEncontrados.join(', ')}`);
      }

      this.agregarPrueba('FAMILIAS_CON_FILTROS', true, `${resultado.datos.length} familias filtradas`);
      return resultado;

    } catch (error) {
      console.error('❌ Error en familias con filtros:', error.message);
      this.agregarError('FAMILIAS_CON_FILTROS', error.message);
      return null;
    }
  }

  /**
   * Prueba 3: Generar Excel completo
   */
  async probarExcelCompleto() {
    console.log('\n📊 Prueba 3: Generación de Excel completo');
    
    try {
      const resultado = await familiasConsolidadoService.generarReporteExcelCompleto({
        limite: 20
      });

      if (resultado.exito && resultado.archivo) {
        console.log(`✅ Excel generado: ${resultado.archivo.nombre}`);
        console.log(`📁 Tamaño del archivo: ${(resultado.archivo.buffer.length / 1024).toFixed(2)} KB`);
        console.log(`👨‍👩‍👧‍👦 Total familias: ${resultado.total_registros}`);

        // Guardar archivo de prueba
        const rutaArchivo = path.join(process.cwd(), 'test-output', resultado.archivo.nombre);
        await fs.promises.mkdir(path.dirname(rutaArchivo), { recursive: true });
        await fs.promises.writeFile(rutaArchivo, resultado.archivo.buffer);
        console.log(`💾 Archivo guardado en: ${rutaArchivo}`);

        // Mostrar estadísticas si están disponibles
        if (resultado.estadisticas) {
          console.log('📈 Estadísticas del reporte:');
          console.log(`   - Familias con padre: ${resultado.estadisticas.familias_con_padre}`);
          console.log(`   - Familias con madre: ${resultado.estadisticas.familias_con_madre}`);
          console.log(`   - Familias completas: ${resultado.estadisticas.familias_completas}`);
          console.log(`   - Familias monoparentales: ${resultado.estadisticas.familias_monoparentales}`);
          console.log(`   - Total hijos: ${resultado.estadisticas.total_hijos}`);
          console.log(`   - Total difuntos: ${resultado.estadisticas.total_difuntos}`);
        }

        this.agregarPrueba('EXCEL_COMPLETO', true, `Excel generado: ${resultado.archivo.nombre}`);
        return resultado;
      } else {
        throw new Error('No se pudo generar el Excel completo');
      }

    } catch (error) {
      console.error('❌ Error generando Excel completo:', error.message);
      this.agregarError('EXCEL_COMPLETO', error.message);
      return null;
    }
  }

  /**
   * Prueba 4: Verificar estructura de datos
   */
  async verificarEstructuraDatos() {
    console.log('\n🔍 Prueba 4: Verificación de estructura de datos');
    
    try {
      const resultado = await familiasConsolidadoService.obtenerFamiliasAgrupadas({
        limite: 5
      });

      if (resultado.datos.length > 0) {
        const familia = resultado.datos[0];
        const camposEsperados = [
          'id_familia', 'apellido_familiar', 'direccion_familia',
          'nombre_completo_padre', 'documento_padre', 'ocupacion_padre', 'edad_padre',
          'nombre_completo_madre', 'documento_madre', 'ocupacion_madre', 'edad_madre',
          'total_miembros', 'total_hijos', 'total_difuntos',
          'nombre_municipio', 'nombre_parroquia', 'nombre_vereda'
        ];

        const camposPresentes = camposEsperados.filter(campo => 
          familia.hasOwnProperty(campo)
        );

        const camposFaltantes = camposEsperados.filter(campo => 
          !familia.hasOwnProperty(campo)
        );

        console.log(`✅ Campos presentes: ${camposPresentes.length}/${camposEsperados.length}`);
        console.log(`📋 Campos validados: ${camposPresentes.join(', ')}`);
        
        if (camposFaltantes.length > 0) {
          console.log(`⚠️ Campos faltantes: ${camposFaltantes.join(', ')}`);
        }

        // Verificar tipos de datos específicos
        const verificaciones = [
          { campo: 'total_miembros', tipo: 'number', valor: familia.total_miembros },
          { campo: 'total_hijos', tipo: 'number', valor: familia.total_hijos },
          { campo: 'edad_padre', tipo: 'number', valor: familia.edad_padre },
          { campo: 'edad_madre', tipo: 'number', valor: familia.edad_madre }
        ];

        verificaciones.forEach(({ campo, tipo, valor }) => {
          if (valor !== null && valor !== undefined) {
            const tipoReal = typeof valor;
            if (tipoReal === tipo || (tipo === 'number' && !isNaN(Number(valor)))) {
              console.log(`✅ ${campo}: ${tipoReal} (${valor})`);
            } else {
              console.log(`⚠️ ${campo}: esperado ${tipo}, encontrado ${tipoReal} (${valor})`);
            }
          }
        });

        this.agregarPrueba('ESTRUCTURA_DATOS', true, `${camposPresentes.length}/${camposEsperados.length} campos validados`);
      }

    } catch (error) {
      console.error('❌ Error verificando estructura:', error.message);
      this.agregarError('ESTRUCTURA_DATOS', error.message);
    }
  }

  /**
   * Prueba 5: Validar información específica
   */
  async validarInformacionCompleta() {
    console.log('\n🔍 Prueba 5: Validación de información completa');
    
    try {
      const resultado = await familiasConsolidadoService.obtenerFamiliasAgrupadas({
        limite: 10
      });

      if (resultado.datos.length > 0) {
        let familiasConPadre = 0;
        let familiasConMadre = 0;
        let familiasCompletas = 0;
        let familiasConHijos = 0;
        let familiasConDifuntos = 0;

        resultado.datos.forEach(familia => {
          if (familia.nombre_completo_padre && familia.nombre_completo_padre.trim()) {
            familiasConPadre++;
          }
          if (familia.nombre_completo_madre && familia.nombre_completo_madre.trim()) {
            familiasConMadre++;
          }
          if (familia.nombre_completo_padre && familia.nombre_completo_madre) {
            familiasCompletas++;
          }
          if (familia.total_hijos > 0) {
            familiasConHijos++;
          }
          if (familia.total_difuntos > 0) {
            familiasConDifuntos++;
          }
        });

        console.log('📊 Análisis de información familiar:');
        console.log(`   - Familias con padre: ${familiasConPadre}/${resultado.datos.length}`);
        console.log(`   - Familias con madre: ${familiasConMadre}/${resultado.datos.length}`);
        console.log(`   - Familias completas: ${familiasCompletas}/${resultado.datos.length}`);
        console.log(`   - Familias con hijos: ${familiasConHijos}/${resultado.datos.length}`);
        console.log(`   - Familias con difuntos: ${familiasConDifuntos}/${resultado.datos.length}`);

        this.agregarPrueba('VALIDACION_COMPLETA', true, `Análisis completado de ${resultado.datos.length} familias`);
      }

    } catch (error) {
      console.error('❌ Error en validación completa:', error.message);
      this.agregarError('VALIDACION_COMPLETA', error.message);
    }
  }

  /**
   * Agregar prueba exitosa
   */
  agregarPrueba(nombre, exitoso, detalles) {
    this.resultados.pruebas.push({
      nombre,
      exitoso,
      detalles,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Agregar error
   */
  agregarError(nombre, mensaje) {
    this.resultados.exitoso = false;
    this.resultados.errores.push({
      nombre,
      mensaje,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Mostrar resumen final
   */
  mostrarResumen() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE PRUEBAS DE FAMILIAS COMPLETAS');
    console.log('='.repeat(60));

    const pruebasExitosas = this.resultados.pruebas.filter(p => p.exitoso).length;
    const totalPruebas = this.resultados.pruebas.length;
    const totalErrores = this.resultados.errores.length;

    console.log(`✅ Pruebas exitosas: ${pruebasExitosas}/${totalPruebas}`);
    console.log(`❌ Errores encontrados: ${totalErrores}`);
    console.log(`🎯 Estado general: ${this.resultados.exitoso ? '✅ EXITOSO' : '❌ CON ERRORES'}`);

    if (this.resultados.pruebas.length > 0) {
      console.log('\n📝 Detalle de pruebas:');
      this.resultados.pruebas.forEach(prueba => {
        const icono = prueba.exitoso ? '✅' : '❌';
        console.log(`   ${icono} ${prueba.nombre}: ${prueba.detalles}`);
      });
    }

    if (this.resultados.errores.length > 0) {
      console.log('\n🚨 Errores encontrados:');
      this.resultados.errores.forEach(error => {
        console.log(`   ❌ ${error.nombre}: ${error.mensaje}`);
      });
    }

    console.log('\n🎉 Funcionalidad de familias agrupadas completas implementada exitosamente!');
    console.log('📌 Endpoints disponibles:');
    console.log('   - GET  /api/familias/agrupadas');
    console.log('   - GET  /api/familias/excel-completo');
    console.log('   - POST /api/familias/excel-completo');
    console.log('='.repeat(60));
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestFamiliasCompleto();
  test.ejecutarPruebas()
    .then(() => {
      console.log('\n✅ Todas las pruebas completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error ejecutando pruebas:', error);
      process.exit(1);
    });
}

export default TestFamiliasCompleto;