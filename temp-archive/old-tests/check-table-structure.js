import sequelize from './config/sequelize.js';

async function checkTableStructure() {
  console.log('🔍 CHECKING ACTUAL DATABASE TABLE STRUCTURE');
  console.log('=' .repeat(60));

  try {
    // Get table information
    const [municipiosStructure] = await sequelize.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'municipios' 
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Municipios table structure:');
    console.table(municipiosStructure);

    // Check constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = 'municipios';
    `);

    console.log('\n🔒 Municipios table constraints:');
    console.table(constraints);

    // Check indexes
    const [indexes] = await sequelize.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'municipios';
    `);

    console.log('\n📇 Municipios table indexes:');
    console.table(indexes);

    // Check for unique constraint on codigo_dane
    const [uniqueConstraints] = await sequelize.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        a.attname as column_name
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey)
      JOIN pg_class r ON c.conrelid = r.oid
      WHERE r.relname = 'municipios' 
      AND c.contype = 'u';
    `);

    console.log('\n🔓 Unique constraints on municipios:');
    if (uniqueConstraints.length > 0) {
      console.table(uniqueConstraints);
    } else {
      console.log('❌ No unique constraints found on municipios table');
      console.log('⚠️  This explains why duplicate codigo_dane was allowed');
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }

  process.exit(0);
}

checkTableStructure();
