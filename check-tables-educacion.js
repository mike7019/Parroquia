/**
 * Script para verificar qué tablas existen en la base de datos
 */

import sequelize from './config/sequelize.js';

async function checkTables() {
  try {
    console.log('🔍 Verificando tablas existentes...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type LIKE '%TABLE' 
      AND table_name != 'spatial_ref_sys'
      ORDER BY table_name;
    `);

    console.log(`\n📋 Tablas encontradas (${results.length}):`);
    results.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    // Buscar tablas relacionadas con educación
    console.log('\n🎓 Buscando tablas relacionadas con educación:');
    const educationTables = results.filter(row => 
      row.table_name.includes('educ') || 
      row.table_name.includes('nivel') || 
      row.table_name.includes('estudio')
    );

    if (educationTables.length > 0) {
      educationTables.forEach(row => {
        console.log(`   📚 ${row.table_name}`);
      });
    } else {
      console.log('   ❌ No se encontraron tablas relacionadas con educación');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

const isMainModule = process.argv[1].endsWith('check-tables-educacion.js');
if (isMainModule) {
  checkTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default checkTables;
