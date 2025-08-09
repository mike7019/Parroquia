import sequelize from './config/sequelize.js';
import { runConfigSeeders } from './src/seeders/configSeeder.js';

async function verifyDatabaseStatus() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar que las tablas principales existen
    const tables = [
      'tipos_vivienda',
      'tipos_disposicion_basura', 
      'enfermedades',
      'sexos',
      'roles',
      'departamentos'
    ];

    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${results[0].count} registros`);
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      }
    }

    // Verificar estructura de la tabla problemática
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'tipos_disposicion_basura' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Estructura de tipos_disposicion_basura:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } catch (error) {
      console.log('❌ Error verificando estructura:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

verifyDatabaseStatus();
