/**
 * Sc  const duplicateTables = [
    { old: 'sexo', new: 'sexos', description: 'Catálogo de sexos' },
    { old: 'sector', new: 'sectores', description: 'Catálogo de sectores' },
    { old: 'parroquias', new: 'parroquia', description: 'Catálogo de parroquias (usar singular)' },
    { old: 'tipo_identificacion', new: 'tipos_identificacion', description: 'Tipos de identificación' },
    { old: 'tipo_viviendas', new: 'tipos_vivienda', description: 'Tipos de vivienda' },
    { old: 'families', new: 'familias', description: 'Registro de familias' },
    { old: 'comunidad_cultural', new: 'comunidades_culturales', description: 'Comunidades culturales' }
  ];pendiente para limpiar tablas duplicadas
 * Ejecuta solo la limpieza sin hacer sync completo
 */
import sequelize from './config/sequelize.js';

// Función para limpiar tablas duplicadas vacías
async function cleanDuplicateTables() {
  console.log('🧹 Limpiando tablas duplicadas y obsoletas...\n');
  
  const tablesToClean = [
    { old: 'sexo', new: 'sexos', description: 'Catálogo de sexos' },
    { old: 'sector', new: 'sectores', description: 'Catálogo de sectores' },
    { old: 'parroquia', new: 'parroquias', description: 'Catálogo de parroquias' },
    { old: 'tipo_identificacion', new: 'tipos_identificacion', description: 'Tipos de identificación' },
    { old: 'tipo_viviendas', new: 'tipos_vivienda', description: 'Tipos de vivienda' },
    { old: 'families', new: 'familias', description: 'Registro de familias' },
    { old: 'comunidad_cultural', new: 'comunidades_culturales', description: 'Comunidades culturales' }
  ];

  let tablesDeleted = 0;
  let tablesSkipped = 0;
  let tablesNotFound = 0;

  console.log('📋 Analizando tablas duplicadas:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const table of tablesToClean) {
    try {
      // Verificar si la tabla existe
      const [tableExists] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${table.old}'
      `);

      if (tableExists.length > 0) {
        // Verificar si la tabla tiene datos
        const [rowCount] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table.old}"`);
        const count = parseInt(rowCount[0].count);

        console.log(`📊 Tabla: ${table.old.padEnd(25)} | Registros: ${count.toString().padStart(3)} | ${table.description}`);

        if (count === 0) {
          console.log(`   🗑️  Eliminando tabla vacía...`);
          await sequelize.query(`DROP TABLE IF EXISTS "${table.old}" CASCADE`);
          console.log(`   ✅ Eliminada exitosamente`);
          tablesDeleted++;
        } else {
          console.log(`   ⚠️  CONSERVADA (tiene datos) - Revisar manualmente`);
          tablesSkipped++;
        }
      } else {
        console.log(`📊 Tabla: ${table.old.padEnd(25)} | Estado: NO EXISTE`);
        tablesNotFound++;
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error(`   ❌ Error procesando tabla ${table.old}:`, error.message);
    }
  }

  console.log('\n📊 RESUMEN DE LIMPIEZA:');
  console.log(`┌─────────────────────────┬─────────┐`);
  console.log(`│ Resultado               │ Cantidad│`);
  console.log(`├─────────────────────────┼─────────┤`);
  console.log(`│ Tablas eliminadas       │ ${tablesDeleted.toString().padStart(7)} │`);
  console.log(`│ Tablas conservadas      │ ${tablesSkipped.toString().padStart(7)} │`);
  console.log(`│ Tablas no encontradas   │ ${tablesNotFound.toString().padStart(7)} │`);
  console.log(`│ Total procesadas        │ ${tablesToClean.length.toString().padStart(7)} │`);
  console.log(`└─────────────────────────┴─────────┘`);
  
  if (tablesDeleted > 0) {
    console.log('\n🎉 ¡Base de datos limpiada exitosamente!');
    console.log('💡 Ahora puedes ejecutar el sync completo con: npm run sync');
  } else if (tablesSkipped > 0) {
    console.log('\n⚠️  Algunas tablas duplicadas contienen datos');
    console.log('💡 Revisa manualmente si es seguro migrar/eliminar esos datos');
  } else {
    console.log('\n✨ ¡Base de datos ya estaba limpia!');
  }
}

async function main() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');
    
    await cleanDuplicateTables();
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

main().catch(console.error);
