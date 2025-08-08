import sequelize from './config/sequelize.js';

async function checkParroquiaTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla parroquia...');
    
    // Verificar columnas
    const [columns] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'parroquia' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estructura de la tabla parroquia:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) (default: ${col.column_default})`);
    });
    
    // Verificar índices
    const [indexes] = await sequelize.query(`
      SELECT 
        indexname, 
        indexdef 
      FROM pg_indexes 
      WHERE tablename = 'parroquia'
    `);
    
    console.log('\n📋 Índices de la tabla parroquia:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}: ${idx.indexdef}`);
    });
    
    // Verificar constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        constraint_name, 
        constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'parroquia'
    `);
    
    console.log('\n🔗 Constraints de la tabla parroquia:');
    constraints.forEach(cons => {
      console.log(`  - ${cons.constraint_name}: ${cons.constraint_type}`);
    });
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error al verificar la tabla:', error);
  } finally {
    await sequelize.close();
  }
}

checkParroquiaTable();
