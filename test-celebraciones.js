/**
 * Script de prueba para verificar datos de celebraciones
 * Diagnóstico: Las celebraciones están vacías
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function verificarCelebraciones() {
  try {
    console.log('🔍 Verificando datos de celebraciones en la base de datos...\n');

    // 1. Verificar campos en la tabla personas
    console.log('📋 Paso 1: Verificar estructura de campos de celebración');
    const columnas = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'personas' 
      AND column_name LIKE '%celebr%'
      ORDER BY column_name
    `, { type: QueryTypes.SELECT });
    
    console.log('✅ Columnas encontradas en tabla personas:');
    columnas.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    console.log('');

    // 2. Contar personas con datos de celebración
    console.log('📋 Paso 2: Contar personas con datos de celebración');
    const conteo = await sequelize.query(`
      SELECT 
        COUNT(*) as total_personas,
        COUNT(motivo_celebrar) as con_motivo,
        COUNT(dia_celebrar) as con_dia,
        COUNT(mes_celebrar) as con_mes,
        COUNT(CASE WHEN motivo_celebrar IS NOT NULL AND motivo_celebrar != '' THEN 1 END) as motivo_no_vacio,
        COUNT(CASE WHEN dia_celebrar IS NOT NULL THEN 1 END) as dia_no_nulo,
        COUNT(CASE WHEN mes_celebrar IS NOT NULL THEN 1 END) as mes_no_nulo
      FROM personas
    `, { type: QueryTypes.SELECT });

    console.log('✅ Estadísticas de celebraciones:');
    console.log(`   Total personas: ${conteo[0].total_personas}`);
    console.log(`   Con motivo (no NULL): ${conteo[0].con_motivo}`);
    console.log(`   Con motivo (no vacío): ${conteo[0].motivo_no_vacio}`);
    console.log(`   Con día (no NULL): ${conteo[0].con_dia}`);
    console.log(`   Con día (valor): ${conteo[0].dia_no_nulo}`);
    console.log(`   Con mes (no NULL): ${conteo[0].con_mes}`);
    console.log(`   Con mes (valor): ${conteo[0].mes_no_nulo}`);
    console.log('');

    // 3. Obtener ejemplos de personas con celebraciones
    console.log('📋 Paso 3: Ejemplos de personas con datos de celebración');
    const ejemplos = await sequelize.query(`
      SELECT 
        id_personas,
        CONCAT(primer_nombre, ' ', primer_apellido) as nombre,
        motivo_celebrar,
        dia_celebrar,
        mes_celebrar
      FROM personas
      WHERE (motivo_celebrar IS NOT NULL AND motivo_celebrar != '')
         OR dia_celebrar IS NOT NULL
         OR mes_celebrar IS NOT NULL
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    if (ejemplos.length > 0) {
      console.log(`✅ Encontrados ${ejemplos.length} ejemplos:`);
      ejemplos.forEach((ej, idx) => {
        console.log(`\n   ${idx + 1}. ${ej.nombre} (ID: ${ej.id_personas})`);
        console.log(`      Motivo: "${ej.motivo_celebrar || '(vacío)'}"`);
        console.log(`      Día: ${ej.dia_celebrar || '(NULL)'}`);
        console.log(`      Mes: ${ej.mes_celebrar || '(NULL)'}`);
      });
    } else {
      console.log('⚠️  No se encontraron personas con datos de celebración');
    }
    console.log('');

    // 4. Probar la consulta exacta que usa el servicio
    console.log('📋 Paso 4: Probar consulta del servicio (familia ejemplo)');
    
    // Obtener primera familia
    const primeraFamilia = await sequelize.query(`
      SELECT id_familia FROM familias LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (primeraFamilia.length > 0) {
      const idFamilia = primeraFamilia[0].id_familia;
      console.log(`   Consultando familia ID: ${idFamilia}`);
      
      const miembros = await sequelize.query(`
        SELECT 
          p.id_personas,
          CONCAT(p.primer_nombre, ' ', p.primer_apellido) as nombre_completo,
          COALESCE(p.motivo_celebrar, '') as motivo_celebrar,
          p.dia_celebrar,
          p.mes_celebrar
        FROM personas p
        WHERE p.id_familia_familias = $1
        LIMIT 5
      `, {
        bind: [idFamilia],
        type: QueryTypes.SELECT
      });

      console.log(`\n   ✅ Miembros encontrados: ${miembros.length}`);
      miembros.forEach((m, idx) => {
        console.log(`\n   ${idx + 1}. ${m.nombre_completo}`);
        console.log(`      Motivo: "${m.motivo_celebrar}"`);
        console.log(`      Día: ${m.dia_celebrar}`);
        console.log(`      Mes: ${m.mes_celebrar}`);
        console.log(`      Resultado en JSON:`);
        console.log(`      {`);
        console.log(`        "motivo": "${m.motivo_celebrar}",`);
        console.log(`        "dia": "${m.dia_celebrar ? m.dia_celebrar.toString() : ''}",`);
        console.log(`        "mes": "${m.mes_celebrar || ''}"`);
        console.log(`      }`);
      });
    }
    console.log('');

    // 5. Verificar nombres de meses
    console.log('📋 Paso 5: Verificar conversión de meses');
    const meses = {
      1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
      5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 
      9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
    };
    
    console.log('   ✅ Función obtenerNombreMes:');
    [1, 6, 12, null, undefined].forEach(num => {
      console.log(`      obtenerNombreMes(${num}) => "${meses[num] || ''}"`);
    });
    console.log('');

    console.log('🎉 Diagnóstico completado!');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarCelebraciones();
