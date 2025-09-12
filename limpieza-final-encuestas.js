/**
 * Script final para eliminar TODOS los registros restantes de encuestas
 */

import sequelize from './config/sequelize.js';

async function limpiezaFinal() {
  try {
    console.log('🧹 LIMPIEZA FINAL - Eliminando registros restantes...\n');
    
    await sequelize.authenticate();
    
    // Deshabilitar restricciones
    await sequelize.query('SET session_replication_role = replica;');
    
    // Eliminar registros restantes de todas las tablas relacionadas
    const tablasALimpiar = [
      'familia_disposicion_basura',
      'familia_disposicion_basuras', // Versión plural si existe
      'familia_aguas_residuales',
      'familia_sistema_aguas_residuales'
    ];
    
    for (const tabla of tablasALimpiar) {
      try {
        // Verificar si existe
        const [existe] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = '${tabla}' AND table_schema = 'public'
        `);
        
        if (existe[0].count === '0') {
          console.log(`⚠️  Tabla ${tabla} no existe`);
          continue;
        }
        
        // Contar y eliminar
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const registros = parseInt(count[0].count);
        
        if (registros > 0) {
          await sequelize.query(`DELETE FROM ${tabla}`);
          console.log(`✅ ${tabla}: ${registros} registros eliminados`);
        } else {
          console.log(`ℹ️  ${tabla}: ya estaba vacía`);
        }
        
      } catch (error) {
        console.log(`❌ Error con ${tabla}: ${error.message}`);
      }
    }
    
    // Rehabilitar restricciones
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    // Reiniciar secuencias
    console.log('\n🔄 Reiniciando secuencias de auto-incremento...');
    const secuencias = [
      { tabla: 'encuestas', columna: 'id_encuesta' },
      { tabla: 'familias', columna: 'id_familia' },
      { tabla: 'personas', columna: 'id_persona' },
      { tabla: 'difuntos_familia', columna: 'id_difunto' }
    ];

    for (const seq of secuencias) {
      try {
        await sequelize.query(`ALTER SEQUENCE ${seq.tabla}_${seq.columna}_seq RESTART WITH 1`);
        console.log(`✅ Secuencia ${seq.tabla}_${seq.columna}_seq reiniciada`);
      } catch (error) {
        console.log(`⚠️  No se pudo reiniciar secuencia ${seq.tabla}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Verificación final de todas las tablas...');
    const todasLasTablas = [
      'encuestas', 'familias', 'personas', 'difuntos_familia',
      'persona_destreza', 'persona_enfermedad', 
      'familia_sistema_acueducto', 'familia_tipo_vivienda',
      'familia_disposicion_basura', 'familia_aguas_residuales'
    ];
    
    let totalRegistros = 0;
    for (const tabla of todasLasTablas) {
      try {
        const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const count = parseInt(result[0].count);
        console.log(`📋 ${tabla}: ${count} registros`);
        totalRegistros += count;
      } catch (error) {
        console.log(`⚠️  No se pudo verificar ${tabla}`);
      }
    }
    
    if (totalRegistros === 0) {
      console.log('\n🎉 ¡LIMPIEZA COMPLETADA EXITOSAMENTE!');
      console.log('✅ Todas las tablas de encuestas están vacías');
      console.log('✅ Secuencias reiniciadas a 1');
      console.log('🚀 Base de datos lista para nuevas encuestas');
    } else {
      console.log(`\n⚠️  Aún quedan ${totalRegistros} registros en total`);
    }
    
  } catch (error) {
    console.error('❌ Error en limpieza final:', error);
  } finally {
    await sequelize.close();
  }
}

limpiezaFinal();
