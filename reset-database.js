import sequelize from './config/sequelize.js';

async function resetDatabase() {
  try {
    console.log('🔄 INICIANDO RESET COMPLETO DE BASE DE DATOS');
    console.log('⚠️  ADVERTENCIA: Este script eliminará TODAS las tablas y datos');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // Obtener lista de todas las tablas
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename != 'information_schema'
      ORDER BY tablename;
    `);
    
    if (tables.length === 0) {
      console.log('ℹ️  No hay tablas para eliminar');
      return;
    }
    
    console.log(`\n📋 Tablas encontradas (${tables.length}):`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.tablename}`);
    });
    
    // Eliminar todas las tablas en orden inverso (para manejar dependencias)
    console.log('\n🗑️  Eliminando tablas...');
    
    // Primero, eliminar todas las foreign keys para evitar conflictos
    console.log('🔗 Eliminando restricciones de foreign keys...');
    await sequelize.query(`
      DO $$ 
      DECLARE 
        rec RECORD;
      BEGIN
        FOR rec IN 
          SELECT constraint_name, table_name 
          FROM information_schema.table_constraints 
          WHERE constraint_type = 'FOREIGN KEY' 
          AND table_schema = 'public'
        LOOP
          EXECUTE 'ALTER TABLE ' || rec.table_name || ' DROP CONSTRAINT IF EXISTS ' || rec.constraint_name || ' CASCADE';
        END LOOP;
      END $$;
    `);
    console.log('✅ Restricciones eliminadas');
    
    // Ahora eliminar todas las tablas
    console.log('🗑️  Eliminando tablas...');
    for (const table of tables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`);
        console.log(`  ✅ Eliminada: ${table.tablename}`);
      } catch (error) {
        console.log(`  ⚠️  Error eliminando ${table.tablename}: ${error.message}`);
      }
    }
    
    // Verificar que no queden tablas
    const [remainingTables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename != 'information_schema';
    `);
    
    if (remainingTables.length === 0) {
      console.log('\n🎉 TODAS LAS TABLAS ELIMINADAS EXITOSAMENTE');
    } else {
      console.log(`\n⚠️  Quedan ${remainingTables.length} tablas:`);
      remainingTables.forEach(table => {
        console.log(`  - ${table.tablename}`);
      });
    }
    
    console.log('\n✅ Reset de base de datos completado');
    console.log('📝 Próximos pasos:');
    console.log('   1. Ejecutar: npm run db:sync');
    console.log('   2. Ejecutar: npm run db:seed:config (para datos básicos)');
    console.log('   3. Ejecutar: npm run admin:create (para crear usuario admin)');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar reset
resetDatabase()
  .then(() => {
    console.log('\n🎯 Reset completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset falló:', error.message);
    process.exit(1);
  });
