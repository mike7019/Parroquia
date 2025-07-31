import sequelize from './config/sequelize.js';

async function syncMigrationState() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Marcar migraciones como ejecutadas
    const completedMigrations = [
      '20250730000002-create-main-entities.cjs',
      '20250730000003-create-family-tables.cjs',
      '20250730000004-create-person-related-tables.cjs',
      '20250730000005-create-user-tables.cjs',
      '20250730000006-update-tipo-identificacion-table.cjs',
      '20250731002551-create-departamentos-and-update-municipios.cjs',
      '20250731055137-add-codigo-dane-to-municipios.cjs',
      '20250731055538-add-timestamps-to-departamentos.cjs'
    ];

    console.log('📝 Marcando migraciones como completadas...');
    
    for (const migration of completedMigrations) {
      try {
        await sequelize.query(`
          INSERT INTO "SequelizeMeta" (name) 
          VALUES (:migration) 
          ON CONFLICT (name) DO NOTHING
        `, {
          replacements: { migration }
        });
        console.log(`  ✅ ${migration}`);
      } catch (error) {
        console.log(`  ⚠️  Error con ${migration}: ${error.message}`);
      }
    }

    console.log('\n🔄 Estado final de migraciones:');
    const [migrations] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" ORDER BY name;
    `);
    console.table(migrations);

    console.log('\n✅ Sincronización completada.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

syncMigrationState();
