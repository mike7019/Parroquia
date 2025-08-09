import sequelize from './config/sequelize.js';

/**
 * Script para verificar que todos los seeders han sido ejecutados correctamente
 */

async function verifyAllSeeders() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    const tables = [
      { name: 'tipos_identificacion', description: 'Tipos de Identificación' },
      { name: 'estados_civiles', description: 'Estados Civiles' },
      { name: 'tipo_viviendas', description: 'Tipos de Vivienda' },
      { name: 'sistemas_acueducto', description: 'Sistemas de Acueducto' },
      { name: 'tipos_aguas_residuales', description: 'Tipos de Aguas Residuales' },
      { name: 'tipos_disposicion_basura', description: 'Tipos de Disposición de Basura' },
      { name: 'sexos', description: 'Sexos' },
      { name: 'roles', description: 'Roles' },
      { name: 'departamentos', description: 'Departamentos' },
      { name: 'enfermedades', description: 'Enfermedades' }
    ];

    console.log('📊 Verificando datos en todas las tablas de catálogo:\n');

    let totalTables = 0;
    let tablesWithData = 0;
    let totalRecords = 0;

    for (const table of tables) {
      try {
        const [results] = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${table.name}`
        );
        
        const count = parseInt(results[0].count);
        totalTables++;
        totalRecords += count;
        
        if (count > 0) {
          tablesWithData++;
          console.log(`✅ ${table.description.padEnd(35)} | ${count.toString().padStart(3)} registros`);
        } else {
          console.log(`⚠️  ${table.description.padEnd(35)} | ${count.toString().padStart(3)} registros`);
        }
        
      } catch (error) {
        console.log(`❌ ${table.description.padEnd(35)} | Error: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Resumen de verificación:`);
    console.log(`   Tablas totales: ${totalTables}`);
    console.log(`   Tablas con datos: ${tablesWithData}`);
    console.log(`   Total de registros: ${totalRecords}`);
    console.log(`   Porcentaje completado: ${Math.round((tablesWithData / totalTables) * 100)}%`);

    if (tablesWithData === totalTables) {
      console.log('\n🎉 ¡Todos los seeders han sido ejecutados correctamente!');
    } else {
      console.log('\n⚠️  Algunos seeders necesitan ser ejecutados.');
      console.log('   Ejecuta: node runSeeders.js');
    }

    // Mostrar algunos ejemplos de enfermedades si existen
    try {
      const [enfermedades] = await sequelize.query(
        "SELECT nombre FROM enfermedades ORDER BY id_enfermedad LIMIT 5"
      );
      
      if (enfermedades.length > 0) {
        console.log('\n📋 Ejemplos de enfermedades en el catálogo:');
        enfermedades.forEach((enfermedad, index) => {
          console.log(`   ${index + 1}. ${enfermedad.nombre}`);
        });
      }
    } catch (error) {
      console.log('\n⚠️  No se pudieron obtener ejemplos de enfermedades');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Parece que las tablas no existen. Ejecuta primero:');
      console.log('   node syncDatabase.js');
    }
  } finally {
    try {
      await sequelize.close();
      console.log('\n🔌 Conexión cerrada');
    } catch (closeError) {
      console.warn('⚠️  Error cerrando conexión:', closeError.message);
    }
  }
}

// Ejecutar verificación
verifyAllSeeders();
