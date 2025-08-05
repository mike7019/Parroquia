import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

async function checkDuplicateTables() {
  try {
    console.log('🔍 Verificando tablas duplicadas y estructura de la base de datos...\n');

    // 1. Listar todas las tablas
    console.log('📋 Todas las tablas en la base de datos:');
    const allTables = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
      { type: QueryTypes.SELECT }
    );
    
    allTables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.tablename}`);
    });
    console.log(`\n🎯 Total de tablas: ${allTables.length}\n`);

    // 2. Verificar la estructura de la tabla personas
    console.log('🔍 Verificando estructura de la tabla personas:');
    const personasStructure = await sequelize.query(
      `SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'personas' 
       ORDER BY ordinal_position`,
      { type: QueryTypes.SELECT }
    );

    if (personasStructure.length > 0) {
      console.log('  Columnas de la tabla personas:');
      personasStructure.forEach(col => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`    - ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultValue}`);
      });
    } else {
      console.log('  ⚠️  La tabla personas no existe en la base de datos');
    }

    // 3. Verificar constraints y keys de personas
    console.log('\n🔑 Verificando constraints de la tabla personas:');
    const constraints = await sequelize.query(
      `SELECT 
        tc.constraint_type,
        tc.constraint_name,
        kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu 
         ON tc.constraint_name = kcu.constraint_name
       WHERE tc.table_schema = 'public' 
         AND tc.table_name = 'personas'
       ORDER BY tc.constraint_type, kcu.column_name`,
      { type: QueryTypes.SELECT }
    );

    if (constraints.length > 0) {
      constraints.forEach(constraint => {
        console.log(`    - ${constraint.constraint_type}: ${constraint.constraint_name} (${constraint.column_name})`);
      });
    } else {
      console.log('  ⚠️  No se encontraron constraints para la tabla personas');
    }

    // 4. Verificar tablas con nombres similares
    console.log('\n🔍 Buscando tablas con nombres similares a "personas":');
    const similares = allTables.filter(table => 
      table.tablename.includes('persona') || 
      table.tablename.includes('person')
    );
    
    if (similares.length > 0) {
      similares.forEach(table => {
        console.log(`  - ${table.tablename}`);
      });
    } else {
      console.log('  ✅ No se encontraron tablas similares');
    }

  } catch (error) {
    console.error('❌ Error ejecutando verificación:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n🔒 Cerrando conexión...');
    await sequelize.close();
  }
}

// Ejecutar la verificación
checkDuplicateTables().catch(console.error);
