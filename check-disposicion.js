import sequelize from './config/sequelize.js';

async function checkDisposicionBasura() {
  try {
    await sequelize.authenticate();
    
    console.log('🔍 Checking tipos_disposicion_basura table existence:');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%disposicion%';
    `);
    
    console.table(tables);
    
    if (tables.length > 0) {
      console.log('\n🔍 Schema for tipos_disposicion_basura:');
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'tipos_disposicion_basura' 
        ORDER BY ordinal_position;
      `);
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDisposicionBasura();
