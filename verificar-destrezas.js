import sequelize from './config/sequelize.js';

async function verificarDestrezas() {
  try {
    console.log('🔍 Verificando tabla destrezas...\n');
    
    // Consultar registros actuales
    const [results] = await sequelize.query('SELECT * FROM destrezas ORDER BY id_destreza');
    
    console.log(`📊 Total de destrezas en la base de datos: ${results.length}\n`);
    
    if (results.length === 0) {
      console.log('❌ La tabla destrezas está VACÍA\n');
      console.log('💡 Posibles causas:');
      console.log('   1. El seeder detectó que ya había registros (COUNT > 0)');
      console.log('   2. La tabla tiene un nombre diferente');
      console.log('   3. Los timestamps no coinciden con la estructura\n');
      
      // Verificar estructura de la tabla
      console.log('🔍 Verificando estructura de la tabla...');
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'destrezas'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Columnas de la tabla destrezas:');
      columns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
      });
    } else {
      console.log('✅ Destrezas encontradas:\n');
      results.forEach((destreza, index) => {
        console.log(`${index + 1}. ${destreza.nombre}${destreza.descripcion ? ' - ' + destreza.descripcion : ''}`);
      });
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarDestrezas();
