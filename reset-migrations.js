import sequelize from './config/sequelize.js';

async function resetMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Limpiar la tabla SequelizeMeta para recrear las migraciones
    console.log('\n🧹 Limpiando estado de migraciones...');
    await sequelize.query('DELETE FROM "SequelizeMeta";');
    
    // Eliminar todas las tablas para una migración limpia
    console.log('🗑️  Eliminando tablas existentes...');
    
    const tablesToDrop = [
      'familia_integrante',
      'familia',
      'usuarios',
      'veredas',
      'municipios',
      'departamentos',
      'sector',
      'parroquia',
      'comunidades_culturales',
      'sexo',
      'estado_civil',
      'tipo_identificacion'
    ];

    for (const table of tablesToDrop) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`  ✅ Eliminada tabla: ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Tabla ${table} no existe o ya fue eliminada`);
      }
    }

    console.log('\n✅ Reset completado. Ahora puedes ejecutar las migraciones de nuevo.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetMigrations();
