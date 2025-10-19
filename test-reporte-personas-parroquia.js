import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function testParroquiaEnReporte() {
  try {
    console.log('🔍 TEST: Verificar datos de Parroquia en reporte de personas');
    console.log('='.repeat(70));

    const query = `
      SELECT 
        p.id_personas,
        CONCAT(
          p.primer_nombre,
          CASE WHEN p.segundo_nombre IS NOT NULL THEN ' ' || p.segundo_nombre ELSE '' END,
          ' ',
          p.primer_apellido,
          CASE WHEN p.segundo_apellido IS NOT NULL THEN ' ' || p.segundo_apellido ELSE '' END
        ) as nombre_completo,
        p.identificacion as documento,
        
        -- Ubicación
        m.nombre_municipio as municipio,
        pr.id_parroquia,
        pr.nombre as parroquia,
        sec.nombre as sector,
        v.nombre as vereda,
        f.direccion_familia,
        f.apellido_familiar
        
      FROM personas p
      LEFT JOIN familias f ON p.id_familia_familias = f.id_familia
      LEFT JOIN municipios m ON f.id_municipio = m.id_municipio
      LEFT JOIN sectores sec ON f.id_sector = sec.id_sector
      LEFT JOIN veredas v ON f.id_vereda = v.id_vereda
      LEFT JOIN parroquia pr ON f.id_parroquia = pr.id_parroquia
      ORDER BY p.id_personas
      LIMIT 10
    `;

    console.log('\n📊 Ejecutando consulta...\n');

    const personas = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });

    console.log(`✅ Encontradas ${personas.length} personas\n`);

    // Tabla de resultados
    console.log('┌─────┬──────────────────────────┬─────────────┬──────────────┬─────────────────────┐');
    console.log('│ ID  │ Nombre                   │ Documento   │ Parroquia ID │ Parroquia Nombre    │');
    console.log('├─────┼──────────────────────────┼─────────────┼──────────────┼─────────────────────┤');
    
    personas.forEach(p => {
      const id = String(p.id_personas).padStart(3, ' ');
      const nombre = (p.nombre_completo || '').substring(0, 24).padEnd(24, ' ');
      const doc = (p.documento || 'N/A').substring(0, 11).padEnd(11, ' ');
      const parId = p.id_parroquia ? String(p.id_parroquia).padStart(12, ' ') : '     NULL    ';
      const parNombre = (p.parroquia || 'NULL').substring(0, 19).padEnd(19, ' ');
      
      console.log(`│ ${id} │ ${nombre} │ ${doc} │ ${parId} │ ${parNombre} │`);
    });
    
    console.log('└─────┴──────────────────────────┴─────────────┴──────────────┴─────────────────────┘\n');

    // Análisis de datos
    const conParroquia = personas.filter(p => p.parroquia !== null && p.parroquia !== undefined);
    const sinParroquia = personas.filter(p => p.parroquia === null || p.parroquia === undefined);

    console.log('📈 ANÁLISIS:');
    console.log(`   Total personas consultadas: ${personas.length}`);
    console.log(`   Con parroquia: ${conParroquia.length} (${(conParroquia.length / personas.length * 100).toFixed(1)}%)`);
    console.log(`   Sin parroquia: ${sinParroquia.length} (${(sinParroquia.length / personas.length * 100).toFixed(1)}%)\n`);

    if (conParroquia.length > 0) {
      console.log('✅ Ejemplos con parroquia:');
      conParroquia.slice(0, 3).forEach(p => {
        console.log(`   - ${p.nombre_completo} → Parroquia: "${p.parroquia}"`);
      });
    }

    if (sinParroquia.length > 0) {
      console.log('\n⚠️  Ejemplos sin parroquia:');
      sinParroquia.slice(0, 3).forEach(p => {
        console.log(`   - ${p.nombre_completo} → id_parroquia en familia: ${p.id_parroquia || 'NULL'}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('💡 CONCLUSIÓN:');
    
    if (sinParroquia.length === personas.length) {
      console.log('   ❌ NINGUNA persona tiene parroquia asignada');
      console.log('   ➡️  Problema: Las familias no tienen id_parroquia');
    } else if (sinParroquia.length > 0) {
      console.log('   ⚠️  ALGUNAS personas no tienen parroquia asignada');
      console.log('   ➡️  Revisar: Familias sin id_parroquia');
    } else {
      console.log('   ✅ TODAS las personas tienen parroquia asignada');
      console.log('   ➡️  El JOIN con parroquia funciona correctamente');
    }

    // Verificar estructura de datos para Excel
    console.log('\n📋 ESTRUCTURA PARA EXCEL:');
    if (personas.length > 0) {
      const ejemplo = personas[0];
      console.log('   Campos disponibles:', Object.keys(ejemplo).join(', '));
      console.log(`   Campo "parroquia" existe: ${ejemplo.hasOwnProperty('parroquia') ? '✅' : '❌'}`);
      console.log(`   Valor del campo: ${ejemplo.parroquia !== null ? `"${ejemplo.parroquia}"` : 'NULL'}`);
    }

    await sequelize.close();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testParroquiaEnReporte();
