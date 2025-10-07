/**
 * Script para verificar celebraciones en API
 * Consulta una familia y muestra las celebraciones
 */

import { QueryTypes } from 'sequelize';
import sequelize from './config/sequelize.js';

async function verificarCelebracionesEnAPI() {
  try {
    console.log('🔍 Verificando cómo se ven las celebraciones en la API...\n');

    // Obtener una familia con miembros que tengan celebraciones
    const familias = await sequelize.query(`
      SELECT DISTINCT f.id_familia, f.apellido_familiar
      FROM familias f
      INNER JOIN personas p ON p.id_familia_familias = f.id_familia
      WHERE p.motivo_celebrar IS NOT NULL
      LIMIT 3
    `, { type: QueryTypes.SELECT });

    if (familias.length === 0) {
      console.log('⚠️  No se encontraron familias con celebraciones');
      return;
    }

    for (const familia of familias) {
      console.log('═'.repeat(70));
      console.log(`📋 FAMILIA: ${familia.apellido_familiar} (ID: ${familia.id_familia})`);
      console.log('═'.repeat(70));
      console.log('');

      // Obtener miembros con celebraciones
      const miembros = await sequelize.query(`
        SELECT 
          p.id_personas,
          CONCAT(p.primer_nombre, ' ', COALESCE(p.segundo_nombre, ''), ' ', 
                 p.primer_apellido, ' ', COALESCE(p.segundo_apellido, '')) as nombre_completo,
          p.identificacion,
          p.motivo_celebrar,
          p.dia_celebrar,
          p.mes_celebrar,
          COALESCE(par.nombre, 'Familiar') as parentesco
        FROM personas p
        LEFT JOIN parentescos par ON p.id_parentesco = par.id_parentesco
        WHERE p.id_familia_familias = :idFamilia
        ORDER BY 
          CASE 
            WHEN COALESCE(par.nombre, 'Familiar') LIKE '%Padre%' THEN 1
            WHEN COALESCE(par.nombre, 'Familiar') LIKE '%Madre%' THEN 2
            ELSE 3
          END
      `, {
        replacements: { idFamilia: familia.id_familia },
        type: QueryTypes.SELECT
      });

      console.log(`👥 Miembros de la familia (${miembros.length}):\n`);

      miembros.forEach((m, idx) => {
        console.log(`${idx + 1}. ${m.nombre_completo}`);
        console.log(`   Parentesco: ${m.parentesco}`);
        console.log(`   Identificación: ${m.identificacion || 'N/A'}`);
        
        if (m.motivo_celebrar || m.dia_celebrar || m.mes_celebrar) {
          const nombreMes = obtenerNombreMes(m.mes_celebrar);
          console.log(`   🎉 Celebración:`);
          console.log(`      {`);
          console.log(`        "motivo": "${m.motivo_celebrar || ''}",`);
          console.log(`        "dia": "${m.dia_celebrar || ''}",`);
          console.log(`        "mes": "${nombreMes}"`);
          console.log(`      }`);
          console.log(`      📅 ${m.motivo_celebrar} - ${m.dia_celebrar} de ${nombreMes}`);
        } else {
          console.log(`   ⚪ Sin celebración registrada`);
        }
        console.log('');
      });
    }

    console.log('═'.repeat(70));
    console.log('✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

function obtenerNombreMes(numeroMes) {
  const meses = {
    1: 'enero', 2: 'febrero', 3: 'marzo', 4: 'abril',
    5: 'mayo', 6: 'junio', 7: 'julio', 8: 'agosto', 
    9: 'septiembre', 10: 'octubre', 11: 'noviembre', 12: 'diciembre'
  };
  return meses[numeroMes] || '';
}

// Ejecutar
verificarCelebracionesEnAPI();
