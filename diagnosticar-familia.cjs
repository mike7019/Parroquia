// Script para diagnosticar el problema de id_familia
import { Familia, sequelize } from './src/models/index.js';

async function diagnosticarProblemaFamilia() {
  try {
    console.log('🔍 Diagnóstico de tabla familias...\n');
    
    // 1. Verificar la secuencia
    console.log('📊 1. Verificando secuencia de familias...');
    const secuenciaQuery = `
      SELECT 
        sequence_name,
        last_value,
        start_value,
        increment_by,
        max_value,
        min_value,
        cache_value,
        log_cnt,
        is_cycled,
        is_called
      FROM familias_id_familia_seq;
    `;
    
    const secuenciaResult = await sequelize.query(secuenciaQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('Secuencia actual:', secuenciaResult[0]);
    
    // 2. Verificar el máximo ID actual en la tabla
    console.log('\n📊 2. Verificando máximo ID en tabla familias...');
    const maxIdQuery = `SELECT MAX(id_familia) as max_id FROM familias;`;
    const maxIdResult = await sequelize.query(maxIdQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('Máximo ID en tabla:', maxIdResult[0].max_id);
    
    // 3. Verificar estructura de la tabla
    console.log('\n📊 3. Verificando estructura de tabla familias...');
    const estructuraQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      ORDER BY ordinal_position;
    `;
    
    const estructura = await sequelize.query(estructuraQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('Estructura de tabla familias:');
    estructura.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });
    
    // 4. Contar registros en la tabla
    console.log('\n📊 4. Contando registros...');
    const count = await Familia.count();
    console.log(`Total de familias: ${count}`);
    
    // 5. Verificar si hay problemas de sincronización
    const secuenciaValue = secuenciaResult[0].last_value;
    const maxId = maxIdResult[0].max_id || 0;
    
    console.log('\n🔍 5. Análisis de sincronización:');
    console.log(`Valor de secuencia: ${secuenciaValue}`);
    console.log(`Máximo ID en tabla: ${maxId}`);
    
    if (secuenciaValue <= maxId) {
      console.log('❌ PROBLEMA DETECTADO: La secuencia está desincronizada!');
      console.log(`La secuencia debería estar en: ${maxId + 1}`);
      
      // Corregir la secuencia
      console.log('\n🔧 Corrigiendo secuencia...');
      const nuevoValor = maxId + 1;
      const correccionQuery = `SELECT setval('familias_id_familia_seq', ${nuevoValor}, false);`;
      await sequelize.query(correccionQuery);
      console.log(`✅ Secuencia ajustada a: ${nuevoValor}`);
      
      // Verificar corrección
      const nuevaSecuencia = await sequelize.query(secuenciaQuery, {
        type: sequelize.QueryTypes.SELECT
      });
      console.log('Nueva secuencia:', nuevaSecuencia[0]);
      
    } else {
      console.log('✅ La secuencia está correctamente sincronizada');
    }
    
    // 6. Probar inserción simple
    console.log('\n🧪 6. Probando inserción de prueba...');
    try {
      const familiaTest = await Familia.create({
        apellido_familiar: 'TEST_FAMILIA',
        direccion_familia: 'TEST_DIRECCION',
        id_municipio: '001', // Asumiendo que existe
        fecha_ultima_encuesta: new Date()
      });
      
      console.log(`✅ Inserción exitosa con ID: ${familiaTest.id_familia}`);
      
      // Eliminar la familia de prueba
      await familiaTest.destroy();
      console.log('✅ Familia de prueba eliminada');
      
    } catch (insertError) {
      console.log('❌ Error en inserción de prueba:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await sequelize.close();
  }
}

diagnosticarProblemaFamilia();
