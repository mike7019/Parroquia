import { Municipios } from './src/models/catalog/index.js';
import { Op } from 'sequelize';

async function checkDataBeforeSync() {
  console.log('🔍 CHECKING DATA INTEGRITY BEFORE SYNC');
  console.log('=' .repeat(60));

  try {
    // 1. Check for NULL codigo_dane values
    console.log('\n📋 Checking for NULL codigo_dane values:');
    const nullCodigoDane = await Municipios.findAll({
      where: {
        codigo_dane: {
          [Op.is]: null
        }
      }
    });

    if (nullCodigoDane.length > 0) {
      console.log(`❌ Found ${nullCodigoDane.length} municipios with NULL codigo_dane:`);
      nullCodigoDane.forEach(m => {
        console.log(`   - ID: ${m.id_municipio}, Nombre: ${m.nombre_municipio}`);
      });
    } else {
      console.log('✅ No NULL codigo_dane values found');
    }

    // 2. Check for duplicate codigo_dane values
    console.log('\n📋 Checking for duplicate codigo_dane values:');
    const [duplicates] = await Municipios.sequelize.query(`
      SELECT codigo_dane, COUNT(*) as count 
      FROM municipios 
      WHERE codigo_dane IS NOT NULL
      GROUP BY codigo_dane 
      HAVING COUNT(*) > 1
    `);

    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate codigo_dane values:`);
      duplicates.forEach(d => {
        console.log(`   - Código: ${d.codigo_dane}, Count: ${d.count}`);
      });

      // Show detailed info for duplicates
      for (const dup of duplicates) {
        const municipiosWithDup = await Municipios.findAll({
          where: { codigo_dane: dup.codigo_dane }
        });
        console.log(`\n   Municipios with codigo_dane '${dup.codigo_dane}':`);
        municipiosWithDup.forEach(m => {
          console.log(`     - ID: ${m.id_municipio}, Nombre: ${m.nombre_municipio}, Created: ${m.created_at}`);
        });
      }
    } else {
      console.log('✅ No duplicate codigo_dane values found');
    }

    // 3. Check for empty string or invalid formato
    console.log('\n📋 Checking for invalid codigo_dane format:');
    const invalidFormat = await Municipios.findAll({
      where: {
        [Op.or]: [
          { codigo_dane: '' },
          { codigo_dane: { [Op.notRegexp]: '^[0-9]{5}$' } }
        ]
      }
    });

    if (invalidFormat.length > 0) {
      console.log(`⚠️  Found ${invalidFormat.length} municipios with invalid codigo_dane format:`);
      invalidFormat.forEach(m => {
        console.log(`   - ID: ${m.id_municipio}, Nombre: ${m.nombre_municipio}, Código: '${m.codigo_dane}'`);
      });
    } else {
      console.log('✅ All codigo_dane values have valid format');
    }

    // 4. Total count
    const totalMunicipios = await Municipios.count();
    console.log(`\n📊 Total municipios: ${totalMunicipios}`);

    // Determine if sync is safe
    const hasCriticalIssues = nullCodigoDane.length > 0 || duplicates.length > 0;
    
    if (hasCriticalIssues) {
      console.log('\n❌ CRITICAL ISSUES FOUND - SYNC MAY FAIL');
      console.log('Please fix NULL values and duplicates before running sync');
      return false;
    } else {
      console.log('\n✅ DATA IS CLEAN - SAFE TO PROCEED WITH SYNC');
      return true;
    }

  } catch (error) {
    console.error('❌ Error checking data:', error.message);
    return false;
  }
}

// Run the check
checkDataBeforeSync().then(isSafe => {
  if (isSafe) {
    console.log('\n🚀 Ready to execute: npm run db:sync:alter');
  } else {
    console.log('\n⚠️  Please clean data first before syncing');
  }
  process.exit(0);
});
