/**
 * Script to populate niveles_educativos table with common educational levels
 */
import { sequelize } from './src/models/index.js';
import { QueryTypes } from 'sequelize';

async function populateNivelesEducativos() {
  try {
    console.log('🎓 Populating niveles_educativos table...\n');
    
    // Educational levels to add
    const nivelesEducativos = [
      { nivel: 'Sin Educación Formal', descripcion: 'Persona sin educación formal', orden_nivel: 0 },
      { nivel: 'Educación Primaria', descripcion: 'Nivel básico de educación formal', orden_nivel: 1 },
      { nivel: 'Educación Secundaria', descripcion: 'Educación media o bachillerato', orden_nivel: 2 },
      { nivel: 'Técnico', descripcion: 'Formación técnica especializada', orden_nivel: 3 },
      { nivel: 'Tecnológico', descripcion: 'Formación tecnológica superior', orden_nivel: 4 },
      { nivel: 'Universitario', descripcion: 'Educación universitaria de pregrado', orden_nivel: 5 },
      { nivel: 'Especialización', descripcion: 'Estudios de especialización universitaria', orden_nivel: 6 },
      { nivel: 'Maestría', descripcion: 'Estudios de maestría o magíster', orden_nivel: 7 },
      { nivel: 'Doctorado', descripcion: 'Estudios doctorales', orden_nivel: 8 }
    ];
    
    console.log('📋 Current records in niveles_educativos:');
    const existing = await sequelize.query(`
      SELECT id_niveles_educativos, nivel, descripcion, orden_nivel
      FROM niveles_educativos 
      ORDER BY orden_nivel;
    `, { type: QueryTypes.SELECT });
    
    console.table(existing);
    
    console.log('\n🔧 Adding missing educational levels...');
    
    for (const nivel of nivelesEducativos) {
      // Check if it already exists
      const [existingRecord] = await sequelize.query(`
        SELECT id_niveles_educativos 
        FROM niveles_educativos 
        WHERE LOWER(nivel) = LOWER(:nivel)
      `, {
        replacements: { nivel: nivel.nivel },
        type: QueryTypes.SELECT
      });
      
      if (!existingRecord) {
        await sequelize.query(`
          INSERT INTO niveles_educativos (nivel, descripcion, orden_nivel, activo, "createdAt", "updatedAt")
          VALUES (:nivel, :descripcion, :orden_nivel, true, NOW(), NOW())
        `, {
          replacements: {
            nivel: nivel.nivel,
            descripcion: nivel.descripcion,
            orden_nivel: nivel.orden_nivel
          },
          type: QueryTypes.INSERT
        });
        
        console.log(`✅ Added: ${nivel.nivel}`);
      } else {
        console.log(`ℹ️  Already exists: ${nivel.nivel}`);
      }
    }
    
    console.log('\n📊 Final records in niveles_educativos:');
    const final = await sequelize.query(`
      SELECT id_niveles_educativos as id, nivel, descripcion, orden_nivel, activo
      FROM niveles_educativos 
      ORDER BY orden_nivel;
    `, { type: QueryTypes.SELECT });
    
    console.table(final);
    
    // Test the "Universitario" lookup
    console.log('\n🔍 Testing "Universitario" lookup:');
    const [universitario] = await sequelize.query(`
      SELECT id_niveles_educativos as id, nivel as nombre 
      FROM niveles_educativos 
      WHERE LOWER(nivel) LIKE LOWER(:nivelBusqueda)
      AND activo = true
    `, {
      replacements: { nivelBusqueda: '%Universitario%' },
      type: QueryTypes.SELECT
    });
    
    if (universitario) {
      console.log('✅ "Universitario" found:');
      console.table([universitario]);
    } else {
      console.log('❌ "Universitario" not found');
    }
    
    // Check how many personas will be affected
    console.log('\n👥 Checking affected personas:');
    const affectedPersonas = await sequelize.query(`
      SELECT p.estudios, COUNT(*) as count
      FROM personas p
      WHERE p.estudios IS NOT NULL 
        AND p.estudios != ''
        AND p.estudios NOT LIKE 'FALLECIDO%'
      GROUP BY p.estudios
      ORDER BY count DESC;
    `, { type: QueryTypes.SELECT });
    
    console.table(affectedPersonas);
    
    console.log('\n✅ Population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating niveles_educativos:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the population
populateNivelesEducativos();
