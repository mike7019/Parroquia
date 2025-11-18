import { QueryTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

/**
 * Script de diagnóstico para verificar datos del reporte de personas
 */
async function testReportePersonas() {
  try {
    console.log('🔍 Verificando datos para reporte de personas...\n');
    
    // Obtener una persona de ejemplo
    const [persona] = await sequelize.query(`
      SELECT 
        p.id_personas,
        p.primer_nombre,
        p.primer_apellido,
        p.en_que_eres_lider
      FROM personas p
      LIMIT 1
    `, {
      type: QueryTypes.SELECT
    });
    
    if (!persona) {
      console.log('❌ No hay personas en la base de datos');
      return;
    }
    
    console.log('👤 Persona de ejemplo:', persona);
    console.log('   Liderazgo:', persona.en_que_eres_lider || 'NULL');
    
    // Obtener destrezas de esta persona
    const destrezas = await sequelize.query(`
      SELECT d.id_destreza, d.nombre
      FROM persona_destreza pd
      INNER JOIN destrezas d ON pd.id_destrezas_destrezas = d.id_destreza
      WHERE pd.id_personas_personas = :id_persona
    `, {
      replacements: { id_persona: persona.id_personas },
      type: QueryTypes.SELECT
    });
    
    console.log('\n🎯 Destrezas encontradas:', destrezas.length);
    if (destrezas.length > 0) {
      console.log('   Lista:', destrezas.map(d => d.nombre).join(', '));
    }
    
    // Obtener habilidades de esta persona
    const habilidades = await sequelize.query(`
      SELECT h.id_habilidad, h.nombre
      FROM persona_habilidad ph
      INNER JOIN habilidades h ON ph.id_habilidad = h.id_habilidad
      WHERE ph.id_persona = :id_persona
    `, {
      replacements: { id_persona: persona.id_personas },
      type: QueryTypes.SELECT
    });
    
    console.log('\n💡 Habilidades encontradas:', habilidades.length);
    if (habilidades.length > 0) {
      console.log('   Lista:', habilidades.map(h => h.nombre).join(', '));
    }
    
    // Obtener enfermedades de esta persona
    const enfermedades = await sequelize.query(`
      SELECT e.id_enfermedad, e.nombre
      FROM persona_enfermedad pe
      INNER JOIN enfermedades e ON pe.id_enfermedad = e.id_enfermedad
      WHERE pe.id_persona = :id_persona AND pe.activo = true
    `, {
      replacements: { id_persona: persona.id_personas },
      type: QueryTypes.SELECT
    });
    
    console.log('\n🏥 Enfermedades encontradas:', enfermedades.length);
    if (enfermedades.length > 0) {
      console.log('   Lista:', enfermedades.map(e => e.nombre).join(', '));
    }
    
    // Verificar total de personas con datos
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT p.id_personas) as total_personas,
        COUNT(DISTINCT pd.id_personas_personas) as personas_con_destrezas,
        COUNT(DISTINCT ph.id_persona) as personas_con_habilidades,
        COUNT(DISTINCT pe.id_persona) as personas_con_enfermedades,
        COUNT(DISTINCT CASE WHEN p.en_que_eres_lider IS NOT NULL THEN p.id_personas END) as personas_con_liderazgo
      FROM personas p
      LEFT JOIN persona_destreza pd ON p.id_personas = pd.id_personas_personas
      LEFT JOIN persona_habilidad ph ON p.id_personas = ph.id_persona
      LEFT JOIN persona_enfermedad pe ON p.id_personas = pe.id_persona AND pe.activo = true
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log('\n📊 Estadísticas generales:');
    console.log('   Total personas:', stats.total_personas);
    console.log('   Con destrezas:', stats.personas_con_destrezas);
    console.log('   Con habilidades:', stats.personas_con_habilidades);
    console.log('   Con enfermedades:', stats.personas_con_enfermedades);
    console.log('   Con liderazgo:', stats.personas_con_liderazgo);
    
    console.log('\n✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  } finally {
    await sequelize.close();
  }
}

testReportePersonas();
