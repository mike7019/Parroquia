/**
 * Debug script to check estudios table and fix the null ID issue
 */
import { sequelize } from './src/models/index.js';
import { QueryTypes } from 'sequelize';

async function debugEstudiosIssue() {
  try {
    console.log('🔍 Debugging estudios null ID issue...\n');
    
    // 1. Check the structure of the estudios table
    console.log('📋 1. Checking estudios table structure:');
    const tableStructure = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'estudios' 
      ORDER BY ordinal_position;
    `, { type: QueryTypes.SELECT });
    
    console.table(tableStructure);
    
    // 2. Check all records in estudios table
    console.log('\n📊 2. All records in estudios table:');
    const allEstudios = await sequelize.query(`
      SELECT * FROM estudios ORDER BY id_estudios;
    `, { type: QueryTypes.SELECT });
    
    console.table(allEstudios);
    
    // 3. Look for "Universitario" specifically
    console.log('\n🎓 3. Looking for "Universitario" record:');
    const universitario = await sequelize.query(`
      SELECT * FROM estudios WHERE nombre ILIKE '%universitario%' OR nombre ILIKE '%universidad%';
    `, { type: QueryTypes.SELECT });
    
    if (universitario.length > 0) {
      console.table(universitario);
    } else {
      console.log('❌ No "Universitario" record found in estudios table');
    }
    
    // 4. Check what values are stored in personas.estudios field
    console.log('\n👥 4. Sample estudios values from personas table:');
    const personasEstudios = await sequelize.query(`
      SELECT DISTINCT estudios, COUNT(*) as count
      FROM personas 
      WHERE estudios IS NOT NULL 
      GROUP BY estudios 
      ORDER BY count DESC 
      LIMIT 20;
    `, { type: QueryTypes.SELECT });
    
    console.table(personasEstudios);
    
    // 5. Check specific case with "Universitario"
    console.log('\n🔍 5. Checking personas with "Universitario" estudios:');
    const personasUniversitario = await sequelize.query(`
      SELECT id_personas, primer_nombre, primer_apellido, estudios
      FROM personas 
      WHERE estudios ILIKE '%universitario%'
      LIMIT 10;
    `, { type: QueryTypes.SELECT });
    
    if (personasUniversitario.length > 0) {
      console.table(personasUniversitario);
    } else {
      console.log('❌ No personas with "Universitario" found');
    }
    
    // 6. Check if there's a mismatch between stored values and catalog
    console.log('\n⚠️ 6. Looking for potential mismatches:');
    const mismatches = await sequelize.query(`
      SELECT p.estudios as stored_value, COUNT(*) as personas_count
      FROM personas p
      LEFT JOIN estudios e ON p.estudios = e.nombre
      WHERE p.estudios IS NOT NULL 
        AND e.id_estudios IS NULL
        AND p.estudios NOT LIKE 'FALLECIDO%'
        AND p.estudios != ''
      GROUP BY p.estudios
      ORDER BY personas_count DESC;
    `, { type: QueryTypes.SELECT });
    
    if (mismatches.length > 0) {
      console.log('🚨 Found mismatches between stored values and catalog:');
      console.table(mismatches);
    } else {
      console.log('✅ No mismatches found');
    }
    
    // 7. Check if we need to create missing estudios records
    console.log('\n💡 7. Suggestions for fixing the issue:');
    
    if (mismatches.length > 0) {
      console.log('\n🔧 Recommended fixes:');
      for (const mismatch of mismatches) {
        console.log(`   - Create estudios record for: "${mismatch.stored_value}" (${mismatch.personas_count} personas affected)`);
      }
    }
    
    console.log('\n✅ Debug analysis completed');
    
  } catch (error) {
    console.error('❌ Error debugging estudios issue:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the debug
debugEstudiosIssue();
