import sequelize from './config/sequelize.js';

(async () => {
  try {
    console.log('🔍 Verificando estructura de la tabla familias...');
    
    // Verificar constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable, 
        column_default,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'familias' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de la tabla familias:');
    constraints.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} | Nullable: ${col.is_nullable} | Default: ${col.column_default || 'N/A'}`);
    });
    
    // Verificar si hay datos con id_familia null
    const [nullCheck] = await sequelize.query(`
      SELECT COUNT(*) as count_nulls 
      FROM familias 
      WHERE id_familia IS NULL;
    `);
    
    console.log(`\n🔍 Registros con id_familia NULL: ${nullCheck[0].count_nulls}`);
    
    // Verificar el próximo valor del sequence
    const [seqInfo] = await sequelize.query(`
      SELECT last_value, is_called 
      FROM familias_id_familia_seq;
    `);
    
    console.log(`\n🔢 Información del sequence: Last value: ${seqInfo[0].last_value}, Is called: ${seqInfo[0].is_called}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
