/**
 * Script simple y directo para eliminar TODAS las encuestas y datos relacionados
 * Versión simplificada para ejecución rápida
 */

import sequelize from './config/sequelize.js';

async function eliminarTodasLasEncuestas() {
  try {
    console.log('🚨 ELIMINANDO TODAS LAS ENCUESTAS Y DATOS RELACIONADOS...\n');
    
    // Deshabilitar restricciones temporalmente
    console.log('🔧 Deshabilitando restricciones...');
    await sequelize.query('SET session_replication_role = replica;');
    
    // Eliminar en orden de dependencias (hijos primero)
    const tablasAEliminar = [
      'persona_destreza',
      'persona_enfermedad', 
      'difuntos_familia',
      'personas',
      'familia_sistema_acueducto',
      'familia_sistema_acueductos',
      'familia_tipo_vivienda', 
      'familia_tipo_viviendas',
      'familia_disposicion_basura',
      'familia_disposicion_basuras',
      'familia_aguas_residuales',
      'familia_sistema_aguas_residuales',
      'familias',
      'encuestas'
    ];
    
    let totalEliminado = 0;
    
    for (const tabla of tablasAEliminar) {
      try {
        // Verificar si existe la tabla
        const [existe] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = '${tabla}' AND table_schema = 'public'
        `);
        
        if (existe[0].count === '0') {
          console.log(`⚠️  Tabla '${tabla}' no existe`);
          continue;
        }
        
        // Contar registros antes de eliminar
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const registros = parseInt(count[0].count);
        
        if (registros > 0) {
          // Eliminar todos los registros
          await sequelize.query(`DELETE FROM ${tabla}`);
          console.log(`✅ ${tabla}: ${registros} registros eliminados`);
          totalEliminado += registros;
        } else {
          console.log(`ℹ️  ${tabla}: ya estaba vacía`);
        }
        
      } catch (error) {
        console.log(`❌ Error en ${tabla}: ${error.message}`);
      }
    }
    
    // Rehabilitar restricciones
    console.log('\n🔧 Rehabilitando restricciones...');
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    // Reiniciar secuencias
    console.log('🔄 Reiniciando secuencias...');
    const secuencias = [
      'encuestas_id_encuesta_seq',
      'familias_id_familia_seq', 
      'personas_id_persona_seq',
      'difuntos_familia_id_difunto_seq'
    ];
    
    for (const secuencia of secuencias) {
      try {
        await sequelize.query(`ALTER SEQUENCE ${secuencia} RESTART WITH 1`);
        console.log(`✅ Secuencia ${secuencia} reiniciada`);
      } catch (error) {
        console.log(`⚠️  No se pudo reiniciar ${secuencia}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 ELIMINACIÓN COMPLETADA');
    console.log(`📊 Total de registros eliminados: ${totalEliminado}`);
    console.log('✅ Base de datos lista para nuevas encuestas');
    
    // Verificación final
    console.log('\n🔍 Verificación final...');
    const tablasVerificar = ['encuestas', 'familias', 'personas', 'difuntos_familia'];
    
    for (const tabla of tablasVerificar) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const count = parseInt(result[0].count);
        console.log(`📋 ${tabla}: ${count} registros`);
      } catch (error) {
        console.log(`⚠️  No se pudo verificar ${tabla}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la eliminación:', error);
    
    // Asegurar que se rehabiliten las restricciones
    try {
      await sequelize.query('SET session_replication_role = DEFAULT;');
    } catch (e) {
      console.error('Error rehabilitando restricciones:', e.message);
    }
    
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  eliminarTodasLasEncuestas();
}

export { eliminarTodasLasEncuestas };
