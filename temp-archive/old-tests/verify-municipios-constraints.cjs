const { sequelize } = require('./config/database');

async function checkConstraints() {
  try {
    await sequelize.authenticate();
    console.log('🔌 Conectado a la base de datos');

    // Verificar constraints de la tabla municipios
    const [constraintsResult] = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'municipios' 
      AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY')
      ORDER BY tc.constraint_type, tc.constraint_name;
    `);

    console.log('\n📋 Constraints en tabla municipios:');
    constraintsResult.forEach(constraint => {
      console.log(`- ${constraint.constraint_type}: ${constraint.constraint_name} (${constraint.column_name})`);
    });

    // Verificar indexes
    const [indexesResult] = await sequelize.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'municipios' 
      ORDER BY indexname;
    `);

    console.log('\n📊 Índices en tabla municipios:');
    indexesResult.forEach(index => {
      console.log(`- ${index.indexname}: ${index.indexdef}`);
    });

    // Verificar estructura de la tabla
    const [columnsResult] = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'municipios'
      ORDER BY ordinal_position;
    `);

    console.log('\n🗂️ Estructura de la tabla municipios:');
    columnsResult.forEach(column => {
      const length = column.character_maximum_length ? `(${column.character_maximum_length})` : '';
      const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = column.column_default ? ` DEFAULT ${column.column_default}` : '';
      console.log(`- ${column.column_name}: ${column.data_type}${length} ${nullable}${defaultVal}`);
    });

    await sequelize.close();
    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
  }
}

checkConstraints();
