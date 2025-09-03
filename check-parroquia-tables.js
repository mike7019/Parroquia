import sequelize from './config/sequelize.js';

(async () => {
  try {
    console.log('🔍 Checking parroquia-related tables...');
    
    const [results] = await sequelize.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name LIKE '%parroqu%' 
      ORDER BY table_name
    `);
    
    console.log('📊 Parroquia-related tables:');
    console.table(results);
    
    // Check specific tables and their structure
    for (const table of results) {
      const tableName = table.table_name;
      console.log(`\n📋 Structure of table "${tableName}":`);
      
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `);
      
      console.table(columns);
      
      // Check record count
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`📊 Records in ${tableName}: ${count[0].count}`);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
