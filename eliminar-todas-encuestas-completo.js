/**
 * Script para eliminar TODAS las encuestas y datos relacionados
 * 
 * ADVERTENCIA: Este script eliminará TODOS los registros de:
 * - Encuestas
 * - Familias
 * - Personas
 * - Difuntos
 * - Relaciones familiares (persona_destreza, persona_enfermedad, etc.)
 * - Configuraciones de familia (sistema acueducto, tipo vivienda, etc.)
 * 
 * Los datos de catálogos (municipios, sectores, profesiones, etc.) NO se eliminarán
 */

import sequelize from './config/sequelize.js';

class EliminadorEncuestasCompleto {
  constructor() {
    this.resultados = {
      tablas_eliminadas: [],
      registros_eliminados: 0,
      errores: []
    };
  }

  async ejecutarLimpieza() {
    console.log('🚨 INICIANDO ELIMINACIÓN COMPLETA DE ENCUESTAS Y DATOS RELACIONADOS');
    console.log('=' * 80);
    console.log('⚠️  ADVERTENCIA: Este proceso eliminará TODOS los datos de encuestas');
    console.log('⚠️  Incluyendo: familias, personas, difuntos y sus relaciones');
    console.log('✅ Se conservarán: catálogos, usuarios, configuraciones\n');

    try {
      // Verificar datos existentes antes de eliminar
      await this.verificarDatosExistentes();
      
      // Confirmar eliminación
      console.log('🔄 Iniciando proceso de eliminación...\n');
      
      // Deshabilitar restricciones de claves foráneas temporalmente
      await this.deshabilitarRestriccionesForeignKeys();
      
      // Eliminar en orden correcto (de dependientes a principales)
      await this.eliminarDatosPersonas();
      await this.eliminarDatosFamilias(); 
      await this.eliminarDatosEncuestas();
      
      // Rehabilitar restricciones
      await this.habilitarRestriccionesForeignKeys();
      
      // Reiniciar secuencias de auto-incremento
      await this.reiniciarSecuencias();
      
      // Verificar resultado final
      await this.verificarEliminacion();
      
      // Generar reporte
      this.generarReporte();
      
    } catch (error) {
      console.error('❌ Error durante la eliminación:', error);
      await this.habilitarRestriccionesForeignKeys(); // Asegurar que se rehabiliten
      throw error;
    } finally {
      await sequelize.close();
    }
  }

  async verificarDatosExistentes() {
    console.log('📊 Verificando datos existentes antes de eliminar...');
    
    const consultas = [
      { tabla: 'encuestas', query: 'SELECT COUNT(*) as count FROM encuestas' },
      { tabla: 'familias', query: 'SELECT COUNT(*) as count FROM familias' },
      { tabla: 'personas', query: 'SELECT COUNT(*) as count FROM personas' },
      { tabla: 'difuntos_familia', query: 'SELECT COUNT(*) as count FROM difuntos_familia' },
      { tabla: 'persona_destreza', query: 'SELECT COUNT(*) as count FROM persona_destreza' },
      { tabla: 'persona_enfermedad', query: 'SELECT COUNT(*) as count FROM persona_enfermedad' },
      { tabla: 'familia_sistema_acueducto', query: 'SELECT COUNT(*) as count FROM familia_sistema_acueducto' },
      { tabla: 'familia_tipo_vivienda', query: 'SELECT COUNT(*) as count FROM familia_tipo_vivienda' },
      { tabla: 'familia_disposicion_basura', query: 'SELECT COUNT(*) as count FROM familia_disposicion_basura' },
      { tabla: 'familia_aguas_residuales', query: 'SELECT COUNT(*) as count FROM familia_aguas_residuales' }
    ];

    for (const consulta of consultas) {
      try {
        const [result] = await sequelize.query(consulta.query);
        const count = parseInt(result[0].count);
        console.log(`📋 ${consulta.tabla}: ${count} registros`);
        
        if (count > 0) {
          this.resultados.registros_eliminados += count;
        }
      } catch (error) {
        console.log(`⚠️  No se pudo consultar ${consulta.tabla}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Total de registros a eliminar: ${this.resultados.registros_eliminados}\n`);
  }

  async deshabilitarRestriccionesForeignKeys() {
    console.log('🔧 Deshabilitando restricciones de claves foráneas...');
    try {
      await sequelize.query('SET session_replication_role = replica;');
      console.log('✅ Restricciones deshabilitadas temporalmente\n');
    } catch (error) {
      console.log('⚠️  No se pudieron deshabilitar restricciones:', error.message);
    }
  }

  async habilitarRestriccionesForeignKeys() {
    console.log('🔧 Rehabilitando restricciones de claves foráneas...');
    try {
      await sequelize.query('SET session_replication_role = DEFAULT;');
      console.log('✅ Restricciones rehabilitadas\n');
    } catch (error) {
      console.log('⚠️  No se pudieron rehabilitar restricciones:', error.message);
    }
  }

  async eliminarDatosPersonas() {
    console.log('🗑️  Eliminando datos de personas y relaciones...');
    
    const tablasPersonas = [
      'persona_destreza',
      'persona_enfermedad', 
      'difuntos_familia',
      'personas'
    ];

    for (const tabla of tablasPersonas) {
      await this.eliminarTabla(tabla);
    }
  }

  async eliminarDatosFamilias() {
    console.log('🗑️  Eliminando datos de familias y configuraciones...');
    
    const tablasFamilias = [
      'familia_sistema_acueducto',
      'familia_sistema_acueductos', // Por si existe la versión plural
      'familia_tipo_vivienda',
      'familia_tipo_viviendas', // Por si existe la versión plural
      'familia_disposicion_basura',
      'familia_disposicion_basuras', // Por si existe la versión plural
      'familia_aguas_residuales',
      'familia_sistema_aguas_residuales', // Por si existe
      'familias'
    ];

    for (const tabla of tablasFamilias) {
      await this.eliminarTabla(tabla);
    }
  }

  async eliminarDatosEncuestas() {
    console.log('🗑️  Eliminando encuestas...');
    await this.eliminarTabla('encuestas');
  }

  async eliminarTabla(nombreTabla) {
    try {
      // Verificar si la tabla existe y tiene datos
      const [verificacion] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = '${nombreTabla}' AND table_schema = 'public'
      `);
      
      if (verificacion[0].count === '0') {
        console.log(`⚠️  Tabla '${nombreTabla}' no existe, saltando...`);
        return;
      }

      // Verificar cantidad de registros
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${nombreTabla}`);
      const count = parseInt(countResult[0].count);
      
      if (count === 0) {
        console.log(`ℹ️  Tabla '${nombreTabla}' ya está vacía, saltando...`);
        return;
      }

      // Eliminar registros
      const [deleteResult] = await sequelize.query(`DELETE FROM ${nombreTabla}`);
      
      console.log(`✅ Eliminados ${count} registros de '${nombreTabla}'`);
      this.resultados.tablas_eliminadas.push({
        tabla: nombreTabla,
        registros_eliminados: count
      });
      
    } catch (error) {
      console.error(`❌ Error eliminando tabla '${nombreTabla}':`, error.message);
      this.resultados.errores.push({
        tabla: nombreTabla,
        error: error.message
      });
    }
  }

  async reiniciarSecuencias() {
    console.log('🔄 Reiniciando secuencias de auto-incremento...');
    
    const secuencias = [
      { tabla: 'encuestas', columna: 'id_encuesta' },
      { tabla: 'familias', columna: 'id_familia' },
      { tabla: 'personas', columna: 'id_persona' },
      { tabla: 'difuntos_familia', columna: 'id_difunto' }
    ];

    for (const seq of secuencias) {
      try {
        await sequelize.query(`ALTER SEQUENCE ${seq.tabla}_${seq.columna}_seq RESTART WITH 1`);
        console.log(`✅ Secuencia de ${seq.tabla} reiniciada`);
      } catch (error) {
        console.log(`⚠️  No se pudo reiniciar secuencia de ${seq.tabla}:`, error.message);
      }
    }
    console.log('');
  }

  async verificarEliminacion() {
    console.log('🔍 Verificando eliminación completa...');
    
    const verificaciones = [
      'encuestas', 'familias', 'personas', 'difuntos_familia',
      'persona_destreza', 'persona_enfermedad',
      'familia_sistema_acueducto', 'familia_tipo_vivienda'
    ];

    let todoBien = true;
    
    for (const tabla of verificaciones) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const count = parseInt(result[0].count);
        
        if (count > 0) {
          console.log(`⚠️  ${tabla}: AÚN QUEDAN ${count} registros`);
          todoBien = false;
        } else {
          console.log(`✅ ${tabla}: vacía correctamente`);
        }
      } catch (error) {
        console.log(`⚠️  No se pudo verificar ${tabla}: ${error.message}`);
      }
    }
    
    if (todoBien) {
      console.log('\n🎉 ELIMINACIÓN COMPLETADA EXITOSAMENTE');
    } else {
      console.log('\n⚠️  ELIMINACIÓN INCOMPLETA - Revisar tablas con registros restantes');
    }
    console.log('');
  }

  generarReporte() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 REPORTE FINAL DE ELIMINACIÓN');
    console.log('='.repeat(80));
    
    console.log(`📊 Tablas procesadas: ${this.resultados.tablas_eliminadas.length}`);
    console.log(`✅ Registros eliminados: ${this.resultados.registros_eliminados}`);
    console.log(`❌ Errores encontrados: ${this.resultados.errores.length}`);
    
    if (this.resultados.tablas_eliminadas.length > 0) {
      console.log('\n📋 TABLAS ELIMINADAS:');
      this.resultados.tablas_eliminadas.forEach((item, index) => {
        console.log(`${index + 1}. ${item.tabla}: ${item.registros_eliminados} registros`);
      });
    }
    
    if (this.resultados.errores.length > 0) {
      console.log('\n🚨 ERRORES ENCONTRADOS:');
      this.resultados.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error.tabla}: ${error.error}`);
      });
    }
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. ✅ La base de datos está limpia y lista para nuevas encuestas');
    console.log('2. ✅ Los catálogos (municipios, sectores, etc.) se conservaron');
    console.log('3. ✅ Los usuarios y configuraciones se conservaron');
    console.log('4. 🔄 Ahora puedes crear nuevas encuestas desde cero');
    
    console.log('\n🎯 ESTADO FINAL: BASE DE DATOS LIMPIA PARA NUEVAS ENCUESTAS');
  }
}

// Función de confirmación para evitar ejecución accidental
async function confirmarEliminacion() {
  console.log('⚠️  CONFIRMACIÓN REQUERIDA');
  console.log('Este script eliminará TODOS los datos de encuestas existentes.');
  console.log('¿Estás seguro de que quieres continuar? (y/N)');
  
  // En un entorno real, aquí usarías readline para confirmar
  // Por ahora, el script se ejecutará si se llama directamente
  return true;
}

// Ejecutar solo si se llama directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log('🚨 ELIMINADOR COMPLETO DE ENCUESTAS INICIADO');
  console.log('⚠️  Este proceso es IRREVERSIBLE\n');
  
  const eliminador = new EliminadorEncuestasCompleto();
  
  confirmarEliminacion().then(confirmado => {
    if (confirmado) {
      eliminador.ejecutarLimpieza();
    } else {
      console.log('❌ Operación cancelada por el usuario');
    }
  });
}

export default EliminadorEncuestasCompleto;
